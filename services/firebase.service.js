const firebase = require("firebase-admin");
const config = require("../config/config");
var serviceAccount = require(`../${config.firebase.service_account_path}`);
const firebaseApp = firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: config.firebase.database_url
});

module.exports = firebaseApp;