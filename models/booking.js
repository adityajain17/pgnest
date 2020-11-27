var mongoose = require("mongoose");
const campground = require("./campground");

var bookingSchema=new mongoose.Schema({
    customer_name:String,
    customer_email:String,
    checkin:String,
    checkout:String,
    bill:Number,
    days:Number,
    author:{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    campground:{    
            type:mongoose.Schema.Types.ObjectId,
            ref:"Campground"
    },
    invoice:{
        data:Buffer,
        contentType:String
    }
});

module.exports = mongoose.model("Booking", bookingSchema);