const PDFDocument = require('pdfkit');
const fs = require('fs');

function gen_invoice(cdetails,callback)
{
    return new Promise((resolve,reject)=>{
        // Create a document
        const doc = new PDFDocument();
        var writeStream=fs.createWriteStream(__dirname+"/routes/output.pdf");
        doc.pipe(writeStream);

        //Image and Address
        doc
        .image(__dirname+"/public/assets/pg-nest.png", 50, 40, { width: 100,height:100})
        .moveDown()
        .fillColor("#444444")
        .fontSize(15)
        .font(__dirname+"/public/fonts/RobotoSlab-Regular.ttf")
        .text("PG Nest Inc.", 200, 50, { align: "right" })
        .text("Malancha Road", 200, 65, { align: "right" })
        .text("WB, IND, 721304", 200, 80, { align: "right" })
        .moveDown();

        //HEADING TAX INVOICE
        doc
            .fillColor("#444444")
            .fontSize(20)
            .font(__dirname+"/public/fonts/RobotoSlab-Bold.ttf")
            .text("Tax Invoice", 50, 160);
            
        generateHr(doc, 185);

        //Invoice Details
        const hotelInformationTop = 200;

        doc
            .fontSize(12)
            .font(__dirname+"/public/fonts/RobotoSlab-Regular.ttf")
            .text("Invoice Number : ", 50, hotelInformationTop)
            .font(__dirname+"/public/fonts/RobotoSlab-Bold.ttf")
            .text(cdetails.inv_num, 150, hotelInformationTop) //Invoice Number
            .font(__dirname+"/public/fonts/RobotoSlab-Regular.ttf")
            .text("Invoice Date : ", 50, hotelInformationTop + 20)
            .font(__dirname+"/public/fonts/RobotoSlab-Bold.ttf")
            .text(formatDate(new Date()), 150, hotelInformationTop + 20) //Date of Booking
            .font(__dirname+"/public/fonts/RobotoSlab-Regular.ttf")
            .text('Hotel Name : ',50,hotelInformationTop+40)
            .font(__dirname+"/public/fonts/RobotoSlab-Bold.ttf")
            .text(cdetails.hotel_name,150,hotelInformationTop+40) //Hotel Name
            .font(__dirname+"/public/fonts/RobotoSlab-Regular.ttf")
            .text('Hotel Address : ',50,hotelInformationTop+60)
            .font(__dirname+"/public/fonts/RobotoSlab-Bold.ttf")
            .text(cdetails.location,150,hotelInformationTop+60) //Hotel Address
            .moveDown();

        // HEADING Customer Info
        doc
            .fillColor("#444444")
            .font(__dirname+"/public/fonts/RobotoSlab-Bold.ttf")
            .fontSize(20)
            .text("Customer Information", 50, 300);

        generateHr(doc, 325);

        //Customer Informatiton
        const CustomerInformationTop = 340;
        doc
            .fontSize(12)
            .font(__dirname+"/public/fonts/RobotoSlab-Regular.ttf")
            .text('Customer Name : ',50,CustomerInformationTop)
            .font(__dirname+"/public/fonts/RobotoSlab-Bold.ttf")
            .text(cdetails.cname,150,CustomerInformationTop) //Customer Name
            .font(__dirname+"/public/fonts/RobotoSlab-Regular.ttf")
            .text('Email Id : ',50,CustomerInformationTop+20)
            .font(__dirname+"/public/fonts/RobotoSlab-Bold.ttf")
            .text(cdetails.email,150,CustomerInformationTop+20) //Customer Email Id
            .font(__dirname+"/public/fonts/RobotoSlab-Regular.ttf")
            .text('Check In Date : ',50,CustomerInformationTop+40)
            .font(__dirname+"/public/fonts/RobotoSlab-Bold.ttf")
            .text(cdetails.checkin,150,CustomerInformationTop+40) //Check-In Date
            .font(__dirname+"/public/fonts/RobotoSlab-Regular.ttf")
            .text('Check Out Date : ',50,CustomerInformationTop+60)
            .font(__dirname+"/public/fonts/RobotoSlab-Bold.ttf")
            .text(cdetails.checkout,150,CustomerInformationTop+60) //Check-Out Date
            .moveDown();

        //Heading Billing Info
        doc
            .fillColor("#444444")
            .font(__dirname+"/public/fonts/RobotoSlab-Bold.ttf")
            .fontSize(20)
            .text("Billing Information", 50, 440);

        generateHr(doc, 465);

        //Billing Information
        const BillingInformationTop=480;
        doc
            .fontSize(12)
            .font(__dirname+"/public/fonts/RobotoSlab-Regular.ttf")
            .text('Rate Per Day : ',50,BillingInformationTop)
            .font(__dirname+"/public/fonts/RobotoSlab-Bold.ttf")
            .fillColor('red')
            .text('INR '+cdetails.price,150,BillingInformationTop) //Rate per Day
            .fillColor('#444444')
            .font(__dirname+"/public/fonts/RobotoSlab-Bold.ttf")
            .text('Number of Days : ',50,BillingInformationTop+20)
            .fillColor('red')
            .text('    X '+cdetails.days,150,BillingInformationTop+20) //Number of Days
            .fillColor('#444444')
            .font(__dirname+"/public/fonts/RobotoSlab-Regular.ttf")
            .text('Total Amount : ',50,BillingInformationTop+40)
            .fillColor('red')
            .font(__dirname+"/public/fonts/RobotoSlab-Bold.ttf")
            .text('INR '+cdetails.bill,150,BillingInformationTop+40); //Total Amount

        //Booked Logo
        doc
            .image(__dirname+"/public/assets/booked.jpg", 250,BillingInformationTop+10, { width: 100,height:100});
        // Finalize PDF file
        doc.end();
        writeStream.on('finish',()=>{
            resolve("I am one");
        });
    });
}
//Few Helper Functions
function generateHr(doc, y) {
    doc
      .strokeColor("#aaaaaa")
      .lineWidth(1)
      .moveTo(50, y)
      .lineTo(550, y)
      .stroke();
}
function formatDate(date) {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
  
    return day+"/"+month+"/"+year;
}
module.exports.gen_invoice=gen_invoice;