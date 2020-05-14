const nodemailer = require('nodemailer');

async function sendMail(email,data){
    async function main() {
        // Generate test SMTP service account from ethereal.email
        // Only needed if you don't have a real mail account for testing
        var transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
              user: 'kycappeth@gmail.com',
              pass: '1admin1Kyc1'
          }
      });
      
        // send mail with defined transport object
        let info = await transporter.sendMail({
          from: '"KYC ADMIN" <kycappeth@gmail.com>', // sender address
          to: email, // list of receivers
          subject: "Hello ✔", // Subject line
          text: data, // plain text body
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


exports.email = (req, res) => {

    sendMail(req.query.email,req.query.data)

    res.status(200).json({
      success: true,
      data:"email sent",
    });
  };
  