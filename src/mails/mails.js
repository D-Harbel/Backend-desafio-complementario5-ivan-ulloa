const nodemailer = require('nodemailer')

const transport=nodemailer.createTransport(
    {
        service: 'gmail',
        port: 587,
        auth: {
            user: "dgmnicolas@gmail.com",
            pass: "bzvgzefoqceodxaj"
        }
    }
)


const enviarEmail=(to, subject, message)=>{
    return transport.sendMail(
        {
            to, subject, 
            html: message
        }
    )    
}

module.exports = { enviarEmail };