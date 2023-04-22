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


// const pug = require("pug");
// const htmlToText = require("html-to-text");
// module.exports = class Email {
//   constructor(user, url) {
//     this.to = user.email;
//     this.name = user.name;
//     this.url = url;
//     this.from = `InReach <${process.env.EMAIL}>`;
//   }

//   newTransport() {
//     return nodemailer.createTransport({
//       host: "smtp.gmail.com",
//       port: 465,
//       secure: true,
//       auth: {
//         user: process.env.EMAIL,
//         pass: process.env.PASSWORD,
//       },
//     });
//   }
//   //todo Send actual email
//   async send(template, subject) {
//     //! [1] Render HTML based on a pug template
//     const html = pug.renderFile(`${__dirname}/../emails/${template}.pug`, {
//       name: this.name,
//       url: this.url,
//       subject,
//     });
    
//     //! [2] Define email options
//     const mailOptions = {
//       from: this.from,
//       to: this.to,
//       subject,
//       html,
//       text: htmlToText.fromString(html),
//     };

//     //! [3] Render HTML based on a pug template
//     await this.newTransport().sendMail(mailOptions);
//   }

//   async sendWelcome() {
//     await this.send('welcome', 'Welcome✨');
//   }
// };