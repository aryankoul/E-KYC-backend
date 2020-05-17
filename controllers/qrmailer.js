const path = require('path');

var QRCode = require('qrcode')
const nodemailer = require('nodemailer');
const account = require('../config/account.json');
async function sendMail(email,data,fileLocation){
    async function main() {
        // Generate test SMTP service account from ethereal.email
        // Only needed if you don't have a real mail account for testing
        var transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
              user: account.user,
              pass: account.pass
          }
      });
      
        // send mail with defined transport object
        let info = await transporter.sendMail({
          from: '"KYC ADMIN" <kycappeth@gmail.com>', // sender address
          to: email, // list of receivers
          subject: "Mail From KYC Services", // Subject line
          text: data, // plain text body
          attachments:[
              {
                  filename:"qrcode.jpg",
                  path:fileLocation
              }
          ]
          // html: "<b>Hello world?</b>" // html body
        });
      
        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
      
        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
      }
      
      main().catch(console.error);
}

exports.qr = (req, res) => {
    var data=req.body.data;
    var email= req.body.email;
    var filename= Date.now()+email;
    const fileLocation = path.join('./qr', filename+'.jpg');
    QRCode.toFile(fileLocation,data,{
    },function(err){
        if(err) throw err
        console.log("done")
        var txt = "Your KYC documents have been verified and the kyc key for reference is "+req.body.userId;
        sendMail(email,txt,fileLocation)
    })

  };
  