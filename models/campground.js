var mongoose = require("mongoose");

var campgroundSchema = new mongoose.Schema({
   name: String,
   location:String,
   description: String,
   price:Number,
   author: {
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String,
      email:String
   },
   comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ],
   images: [
      {
         data:Buffer,
         contentType:String
     }
   ],
   avg_rating:Number,
   likes:[
      {
         type:mongoose.Schema.Types.ObjectId,
         ref:"User"
      }
   ]
});

module.exports = mongoose.model("Campground", campgroundSchema);