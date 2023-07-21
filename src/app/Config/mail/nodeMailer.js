const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // => Gmail Google
    port: 465, // PORT
    secure: true,
    auth: {
        user: process.env.EMAIL_NAME,
        pass: process.env.APP_PASSWORD
    }
});

module.exports = transporter;