var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    Campground  = require("./models/campground"),
    Comment     = require("./models/comment"),
    User        = require("./models/user"),
    Booking     = require("./models/booking"),
    morgan      = require('morgan'),
    cors        = require('cors'),
    middleware  = require('./middleware/index'),
    fs          = require('fs'),
    flash       = require("connect-flash");
var commentRoutes    = require("./routes/comments"),
    campgroundRoutes = require("./routes/campgrounds"),
    indexRoutes      = require("./routes/index");
require('dotenv').config({path: __dirname + '/.env'});
mongoose.connect("mongodb://localhost/pgnest");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.use(cors());
process.env['ROOT']=__dirname;
// app.use(morgan('tiny'));
// app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});
app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

app.get("/bookings/:id",middleware.isLoggedIn,function(req,res)
{
    Booking.findById(req.params.id).populate("campground",["name","price","location","avg_rating","images","author"]).exec(function(err,booking)
    {
        var book={cname:booking.customer_name,email:booking.customer_email,checkin:booking.checkin,
            checkout:booking.checkout,bookid:booking._id};
        var campground=booking.campground;
        // console.log(campground);
        return res.render("booking",{book:book,campground,campground,days:booking.days,
        bill_amt:booking.bill});
    });
});
app.get("/bookings/:id/invoice",middleware.isLoggedIn,function(req,res)
{
    Booking.findById(req.params.id,function(err,foundBooking)
    {
        fs.writeFileSync("invoice-"+req.params.id+".pdf",foundBooking.invoice.data);
        res.download("invoice-"+req.params.id+".pdf",function(err)
        {
            fs.unlinkSync("invoice-"+req.params.id+".pdf");
        });
    });
});
const port=process.env.PORT||3000;
app.listen(port,function(){
   console.log("The Inotel Server Has Started!");
});