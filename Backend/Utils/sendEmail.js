const nodemailer = require('nodemailer');

// E-mail küldése a Nodemailer és a .env-ben megadott beállítások segítségével.
const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    await transporter.sendMail({
        from: `ArtisticEye <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        html: options.html,
    });
};

module.exports = sendEmail;