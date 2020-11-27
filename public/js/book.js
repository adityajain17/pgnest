console.log("Connected");

var checkin=document.getElementById("checkin");
var checkout=document.getElementById("checkout");

checkin.addEventListener('change',function()
{
    var cdate=new Date(checkin.value);
    var cmin=new Date();
    cmin.setDate(cdate.getDate()+1);
    checkout.min=cmin.getFullYear()+"-"+(cmin.getMonth()+1)+"-"+cmin.getDate();
});