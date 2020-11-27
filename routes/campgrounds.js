var express = require("express");
var router  = express.Router();
var Campground = require("../models/campground");
var Booking    = require("../models/booking");
var middleware = require("../middleware");
var User=require("../models/user");
var multer      = require('multer');
var {spawn}     = require('child_process');
var invoice=require('../test_inv');
var fs =require('fs');
var path=require('path');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null,process.env['ROOT']+"/public/uploads/")
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now()+path.extname(file.originalname))
    }
  }),
  upload = multer({ storage: storage });
//INDEX - show all campgrounds
router.get("/", function(req, res){
    // Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
       if(err){
           console.log(err);
       } else {
          res.render("campgrounds/index",{campgrounds:allCampgrounds});
       }
    });
});

//CREATE - add new campground to DB
router.post("/",middleware.isLoggedIn,upload.array('images'),function(req, res){
    // get data from form and add to campgrounds array
    var name = req.body.name;
    var location=req.body.location;
    var price=req.body.price;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username,
        email:req.user.email
    }
    var avg_rating=0;
    var count=req.files.length;
    var img_array=[];
    for(var i=0;i<count;i++){
        var obj={data:fs.readFileSync(process.env['ROOT']+"/public/uploads/"+req.files[i].filename),
                    contentType:req.files[i].mimetype};
        fs.unlinkSync(process.env['ROOT']+"/public/uploads/"+req.files[i].filename);
        img_array.push(obj);
    }
    var newCampground = {name: name,location:location,description:desc,price:price,author:author,
    images:img_array,avg_rating:avg_rating};
    // Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            // console.log(newlyCreated);
            res.redirect("/campgrounds");
        }
    });
});

//NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("campgrounds/new"); 
});

// SHOW - shows more info about one campground
router.get("/:id", function(req, res){
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            console.log(err);
        } else {
            //render show template with that campground
            if(foundCampground!=null){
                res.render("campgrounds/show", {campground: foundCampground});
            }
            else{
                req.flash("error","Listing Not found");
                res.redirect("/campgrounds");
            }
        }
    });
});

// EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        res.render("campgrounds/edit", {campground: foundCampground});
    });
});

// UPDATE CAMPGROUND ROUTE
router.put("/:id",middleware.checkCampgroundOwnership,upload.array('images'),function(req, res){
    //first get the textual-data and create the new object
    var name = req.body.name;
    var location=req.body.location;
    var price=req.body.price;
    var desc = req.body.description;
    var img_array=[];
    Campground.findById(req.params.id,function(err,foundCampground){
        if(err){
            console.log(err);
        }
        else
        {
            var flag=true;
            img_array=foundCampground.images;
            //Delete-the-images-requested
            if(req.body.check)
            {
                if(img_array.length+req.files.length-req.body.check.length>0)
                {
                    var ind=[];
                    ind=req.body.check;
                    ind=ind.reverse();
                    // console.log("After Reverse "+ind);
                    for(var i=0;i<ind.length;i++){
                        // console.log(ind[i]);
                        img_array.splice(ind[i],1);
                    }
                }
                else
                {
                    flag=false;
                    req.flash("error","Cannot Delete all the images");
                    return res.redirect("/campgrounds/"+req.params.id);
                }
            }
            //Upload New Ones
            var count=req.files.length;
            for(var i=0;i<count;i++)
            {
                var obj={data:fs.readFileSync(process.env['ROOT']+"/public/uploads/"+req.files[i].filename),
                            contentType:req.files[i].mimetype};
                fs.unlinkSync(process.env['ROOT']+"/public/uploads/"+req.files[i].filename);
                img_array.push(obj);
            }
            var newCampground = {name:name,location:location,description:desc,price:price,images:img_array};
            Campground.findByIdAndUpdate(req.params.id,newCampground,function(err,updatedCampground)
            {
                if(err)
                {
                    console.log(err);
                    res.redirect("/campgrounds");
                }
                else
                {
                    res.redirect("/campgrounds/"+req.params.id);
                }
            });
        }
    });
});

// DESTROY CAMPGROUND ROUTE
router.delete("/:id",middleware.checkCampgroundOwnership, function(req, res){
   Campground.findByIdAndRemove(req.params.id, function(err){
      if(err){
          res.redirect("/campgrounds");
      } else {
          if(fs.existsSync(process.env['ROOT']+"/public/assets/word-"+req.params.id+".png"))
            fs.unlinkSync(process.env['ROOT']+"/public/assets/word-"+req.params.id+".png");
          res.redirect("/campgrounds");
      }
   });
});

//Book a Property
router.get("/:id/book",isLoggedIn,function(req,res)
{
    var cname,email,camp_id,checkin,checkout;
    if(Object.keys(req.query).length != 0){
        cname=req.query.name;
        email=req.query.email;
        camp_id=req.params.id;
        checkin=req.query.checkin;
        checkout=req.query.checkout;
        checkin=new Date(checkin);checkout=new Date(checkout);
        checkin=checkin.getFullYear()+"-"+(checkin.getMonth()+1)+"-"+checkin.getDate();
        checkout=checkout.getFullYear()+"-"+(checkout.getMonth()+1)+"-"+checkout.getDate();
        // console.log(checkin);
        // console.log(checkout);
    } else{
        cname=req.user.firstname+" "+req.user.lastname;
        email=req.user.email;
        camp_id=req.params.id; 
        checkin='';
        checkout='';
    }
    res.render("campgrounds/book",{cname:cname,email:email,camp_id:camp_id,checkin:checkin,checkout:checkout});
});
router.get("/:id/book/cnf",isLoggedIn,function(req,res)
{
    var cname=req.query.name;
    var email=req.query.email;
    var checkin=new Date(req.query.checkin);
    checkin=checkin.toDateString();
    var checkout=new Date(req.query.checkout);
    checkout=checkout.toDateString();
    var book={cname:cname,email:email,checkin:checkin,checkout:checkout};
    Campground.findById(req.params.id,function(err,campground)
    {
        if(err){
            console.log(err);
        }
        else{
            var date1 = new Date(checkin); 
            var date2 = new Date(checkout);
            var Difference_In_Time = date2.getTime() - date1.getTime();
            var days = Difference_In_Time / (1000 * 3600 * 24);  
            if(days<=0){
                    req.flash("error","Check-Out Date should be after Check-In date");
                    res.redirect("/campgrounds/"+req.params.id+"/book");
            }else{
                var bill_amt=days*campground.price;
                res.locals.error='';
                res.render("campgrounds/book_cnf",{book:book,campground:campground,days:days,bill_amt:bill_amt});
            }
            
        }
    });
});
//Finally do the Booking
router.post("/:id/book/cnf",isLoggedIn,function(req,res){
    // console.log(req.body);
    var author={id:req.user._id,username:req.user.username};
    var campground=req.params.id;
    var booking={customer_name:req.body.cname,customer_email:req.body.email,
    checkin:req.body.checkin,checkout:req.body.checkout,bill:req.body.bill_amt,
    author:author,campground:campground,days:req.body.days};
    // console.log(booking);
    Booking.create(booking,function(err,booking){
        if(err){
            console.log(err);
        }
        else{
            Booking.findById(booking._id).populate("campground").exec(async function(err,book_camp)
            {
                if(err){
                    console.log(err);
                }
                else{
                    var test_data={inv_num:book_camp._id,hotel_name:book_camp.campground.name,location:book_camp.campground.location,
                        cname:book_camp.customer_name,email:book_camp.customer_email,checkin:book_camp.checkin,checkout:book_camp.checkout,
                        price:book_camp.campground.price,bill:book_camp.bill,days:book_camp.days};
                    await invoice.gen_invoice(test_data);
                    var inv={data:fs.readFileSync(__dirname+"/output.pdf"),contentType:'application/pdf'};
                    book_camp.invoice=inv;
                    await book_camp.save();
                    fs.unlinkSync(__dirname+"/output.pdf");
                    User.findById(req.user._id,async function(err,foundUser)
                    {
                        foundUser.bookings.push(book_camp._id);
                        await foundUser.save();
                        req.flash("success","Booking Sucessful");
                        res.redirect("/bookings/"+book_camp._id);
                    });
                }
            });   
        }
    });
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