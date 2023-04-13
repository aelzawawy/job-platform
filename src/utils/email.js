const nodemailer = require('nodemailer');

const sendEmail = async options => {
    //todo 1: Create a transporter
    const transporter = nodemailer.createTransport({
        host:'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    })
    //todo 2: Define the email options
    const mailOptions = {
        from: process.env.EMAIL,
        to: options.email,
        subject: options.subject,
        text: options.message,
    }
    //todo 3: Send the email
    await transporter.sendMail(mailOptions)
}

module.exports = sendEmail;