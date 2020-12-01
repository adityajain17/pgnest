var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'aditya.jain@vitap.ac.in',
    pass: 'Adityajain7@'
  }
});
function sendMsg(mailOptions,hasInvoice){
    return new Promise((resolve,reject)=>{
        // console.log(mailOptions);
        var attach=[{filename:'pg-nest.png',path:__dirname+"/public/assets/pg-nest.png",cid:'pgnest'}];
        if(hasInvoice==true)
            attach.push({filename:'invoice.pdf',path:__dirname+"/routes/output.pdf"});
        mailOptions.attachments=attach;
        transporter.sendMail(mailOptions, function(error, info){
            if (error) 
            {
                console.log(error);
                resolve("Email Not Sent !!!");
            } 
            else 
            {
                console.log('Email sent: ' + info.response);
                resolve("Email Sent");
            }
        });
    });
}
module.exports.sendMsg=sendMsg;