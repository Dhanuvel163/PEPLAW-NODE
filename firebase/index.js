var admin = require("firebase-admin");
var serviceAccount = JSON.parse(process.env.ADMIN_APP_USER);
global.Userapp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://pep-law-react.firebaseio.com"
});
global.UserappAuth = Userapp.auth()
// export {Userapp}