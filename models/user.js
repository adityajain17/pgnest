var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    firstname:String,
    lastname:String,
    gender:String,
    username: String,
    password: String,
    email:String,
    bookings:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Booking"
        }
    ],
    profile:{
        data:Buffer,
        contentType:String
    }
});

UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model("User", UserSchema);