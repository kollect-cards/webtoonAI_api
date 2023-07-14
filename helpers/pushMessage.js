const firebaseAdmin = require("firebase-admin");
const {getMessaging} = require("firebase-admin/messaging");

module.exports = class pushMessage{
    static firebaseMessageByTokens(title, body, tokens) {
        let message = {
            notification: { title: title, body: body},
            data: { title: title, body: body},
            tokens: tokens
        };
        firebaseAdmin.messaging().sendMulticast(message)
            .then((response) => {
                console.log('Successfully sent message:', response);
            })
            .catch((error) => {
                console.log('Error sending message:', error);
            });
    }
    static firebaseMessageByTopic(title, body, topics) {
        let condition = `'${topics[0]}' in topics `;
        for (const tp of topics) {
            condition += `|| '${tp}' in topics `;
        }

        const message = {
            // notification: { title: title, body: body},
            notification: { title: title, body: body},
            data: { title: title, body: body},
            condition: condition
        };

        getMessaging().send(message)
            .then((response) => {
                console.log('Successfully sent message:', response);
            })
            .catch((error) => {
                console.log('Error sending message:', error);
            });
    }
};