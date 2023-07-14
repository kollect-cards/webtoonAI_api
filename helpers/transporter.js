const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'baran0627@gmail.com',
        pass: '_stotica_no_reply_'
    },
    tls: {
        rejectUnauthorized: false
    }
});

module.exports = {transporter};
