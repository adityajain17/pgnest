var express = require("express");
var router  = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");
const campground = require("../models/campground");


//Comments Create
router.post("/",middleware.isLoggedIn,function(req, res){
   //lookup campground using ID
//    console.log(req.body);
   Campground.findById(req.params.id).populate("comments").exec(function(err, campground){
       if(err){
           console.log(err);
           res.redirect("/campgrounds");
       } else {
        var author={id:req.user._id,username:req.user.username};
        var total_sum=campground.avg_rating*campground.comments.length;
        var new_avg=parseFloat(((total_sum+parseInt(req.body.rating))/(campground.comments.length+1)).toFixed(1));
        // console.log(author);
        var comm={text:req.body.comment,rating:req.body.rating,author:author};
        Comment.create(comm,function(err,newComment)
        {
            if(err){
                console.log(err);
            }
            else{
                // console.log(newComment);
                campground.avg_rating=new_avg;
                campground.comments.push(newComment);
                campground.save();
                res.redirect('/campgrounds/' + campground._id);
            }
        });
       }
   });
});

// COMMENT EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
   Comment.findById(req.params.comment_id, function(err, foundComment){
      if(err){
          res.redirect("back");
      } else 
      {
        Campground.findById(req.params.id).populate('comments').exec(function(err,foundCampground)
        {
            if(err){
                console.log(err);
            }
            else{
                res.render("comments/edit", {campground:foundCampground,comment_id:req.params.comment_id});
            }
        });
      }
   });
});

// COMMENT UPDATE
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    // console.log(req.body);
    var newComment={text:req.body.comment,rating:req.body.rating};
   Comment.findById(req.params.comment_id,async function(err,comment){
      if(err){
          res.redirect("back");
      } else {
        var old_rating=comment.rating;
        comment.text=newComment.text;
        comment.rating=parseInt(newComment.rating);
        await comment.save();
        //Re-Calculate the avg rating
          Campground.findById(req.params.id).populate("comments").exec(async function(err,foundCampground)
          {
            if(err){
                console.log(err);
                res.redirect("back");
            }
            else{
                var old_sum=foundCampground.avg_rating*foundCampground.comments.length;
                var new_sum=old_sum-old_rating+parseInt(newComment.rating);
                var new_avg=parseFloat((new_sum/foundCampground.comments.length).toFixed(1));
                foundCampground.avg_rating=new_avg;
                await foundCampground.save();
                res.redirect("/campgrounds/" + req.params.id+"?#"+req.params.comment_id);
            }
          });
      }
   });
});

// COMMENT DESTROY ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    //findByIdAndRemove
    Comment.findByIdAndRemove(req.params.comment_id, function(err,comment){
       if(err){
           res.redirect("back");
       } else {
           Campground.findById(req.params.id).populate("comments").exec(async function(err,campground){
            if(err){
                console.log(err);
                res.redirect("back");
            }
            else{
                var total_sum=campground.avg_rating*(campground.comments.length+1);
                var new_sum=total_sum-comment.rating;
                var avg_rating=0;
                if(campground.comments.length!=0){
                    avg_rating=new_sum/campground.comments.length;
                }
                avg_rating=parseFloat(avg_rating.toFixed(1));
                campground.avg_rating=avg_rating;
                await campground.save();
                res.redirect("/campgrounds/" + req.params.id);
            }
           });
       }
    });
});

module.exports = router;