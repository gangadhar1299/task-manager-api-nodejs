const sendGridMail = require('@sendgrid/mail');

sendGridMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sendGridMail.send({
        to: email,
        from: 'gaganskyline@gmail.com',
        subject: 'Thanks for signing up!',
        text: `Welcome to Task App, ${name}.Hope you manage your task and time wisely.`
    }).then(() => { }, error => {
        if (error) console.log(error);
        if (error.response)
            console.log(error.response.message);
    });
}


const sendCancellationEmail = (email, name) => {
    sendGridMail.send({
        to: email,
        from: 'gaganskyline@gmail.com',
        subject: 'Sorry to see you go! :(',
        text: `Goodbye ${name}. I hope to see you back sometime soon.`
    }).then(() => { }, error => {
        if (error) console.log(error);
        if (error.response)
            console.log(error.response.message);
    });
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
};