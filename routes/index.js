var express = require("express");
var router  = express.Router();
var passport = require("passport");
var fs=require('fs');
var path=require('path');
var validate = require("validate.js");
var {spawn}     = require('child_process');
var User = require("../models/user");
var Campground=require("../models/campground");
var custom_mail=require('../sendMail');
var multer      = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null,process.env['ROOT']+"/public/uploads/")
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now()+path.extname(file.originalname))
    }
  }),
  upload = multer({ storage: storage });

// Object which will provide the details for the emails
var mailOptions={from:'Aditya Jain'};

//root route
router.get("/", function(req, res){
    res.render("landing");
});

// show register form
router.get("/register", function(req, res){
   res.render("register"); 
});

//handle sign up logic
router.post("/register",upload.single('profile'),function(req, res){
    // console.log(req.body);
    var fname=req.body.fname;
    var lname=req.body.lname;
    var gen=req.body.gender;
    var uname=req.body.username;
    var pass=req.body.password;
    var cnf=req.body.cnfpass;
    var email=req.body.email;
    var constraints = {
        email: {
          email: true
        }
    };
    if(fname.length==0||uname.length==0||pass.length==0||cnf.length==0||email.length==0)
    {
        fs.unlinkSync(process.env['ROOT']+"/public/uploads/"+req.file.filename);
        req.flash("error","All the fields are mandatory");
        return res.redirect("/register");
    }
    else if(req.body.password!=req.body.cnfpass)
    {
        fs.unlinkSync(process.env['ROOT']+"/public/uploads/"+req.file.filename);
        req.flash("error","Password and Confirm password should match");
        return res.redirect("/register");
    }
    else if(validate({email:email},constraints)!=undefined)
    {
        fs.unlinkSync(process.env['ROOT']+"/public/uploads/"+req.file.filename);
        req.flash("error","Invalid Email");
        return res.redirect("/register");
    }
    var profile={data:fs.readFileSync(process.env['ROOT']+"/public/uploads/"+req.file.filename),
    contentType:req.file.mimetype};
    fs.unlinkSync(process.env['ROOT']+"/public/uploads/"+req.file.filename);
    var newUser = new User({username:uname,firstname:fname,lastname:lname,gender:gen,email:email,profile:profile});
    User.register(newUser, req.body.password, async function(err, user){
        if(err){
            // console.log(err);
            req.flash("error",err.message);
            return res.redirect("/register");
        }
        mailOptions.to=email;
        mailOptions.subject="Welcome to PG-Nest";
        mailOptions.html=`<img src="cid:pgnest" alt="Logo">
        <div><b>Hello `+fname+`,</b></div>
        <br>
        <div>Thank you for signing up for PG-Nest, your one stop solution for all your loding needs. Ready to dive in ?</div>
        <br>
        <div>You can list your proprties or book rooms at the most affordable prices.</div>
        <br>
        <div><b>Get Started Now.</b></div>
        <br>
        <div><a href="http://localhost:3000">Visit PG-Nest</a></div>
        <br><br>
        <div><b>Thank You,</b></div>
        <div>Team PG-Nest</div>`;
        custom_mail.sendMsg(mailOptions,false);
        passport.authenticate("local")(req, res,function(){
            req.flash("success", "Welcome to PG Nest " + user.username);
            res.redirect("/campgrounds"); 
        });
    });
});

//show login form
router.get("/login", function(req, res){
   res.render("login"); 
});

//handling login logic
router.post("/login", passport.authenticate("local", 
    {
        failureRedirect: "/login",
        failureFlash: true,
        successFlash: true
    }), function(req, res){
        req.flash("success","Welcome Back "+req.user.username);
        res.redirect("/campgrounds");
});

router.get("/account",isLoggedIn,async function(req,res)
{
    var id=req.user.id;
    var posted=[];
    var user=await User.findById(req.user._id).populate({path:'bookings',model:'Booking',populate:
    {
        path:'campground',model:'Campground'
    }});
    Campground.find({},function(err,camp)
    {
        if(err)
        {
            console.log(err);
        }
        else
        {
            camp.forEach(function(campground)
            {
                if(campground.author.id.toString()==id)
                posted.push(campground);
            });
            res.render("account.ejs",{bookings:user.bookings,posted:posted,profile:user.profile});
        }
    });
});

router.get("/word-cloud/:id",function(req,res)
{
    Campground.findById(req.params.id).populate("comments").exec(function(err,campground)
    {
        if(campground.comments.length<5)
            res.json("400"); // Not enough data to show the word cloud;
        else{
            var all_reviews='';
            for(var i=0;i<campground.comments.length;i++)
            {
                all_reviews=all_reviews+campground.comments[i].text+' ';
            }
            // console.log(campground._id);
            const python = spawn('python', ['word_cloud.py',all_reviews,campground._id]);
            python.on('close', (code) => 
            {
                // console.log(`child process close all stdio with code ${code}`);
                res.json("200"); //Generated the word cloud
            });
        }
    });
});

// logout route
router.get("/logout", function(req, res){
   req.logout();
   req.flash("success", "Logged you out!");
   res.redirect("/campgrounds");
});

//middleware
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error","You need to be logged in to do that");
    res.redirect("/login");
}

module.exports = router;