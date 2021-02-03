var admin = require("firebase-admin");
var serviceAccount = JSON.parse(process.env.ADMIN_APP_USER);
global.Userapp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://pep-law-react.firebaseio.com"
});
global.UserappAuth = Userapp.auth()

var serviceAccountLawyer = JSON.parse(process.env.ADMIN_APP_LAWYER);
global.Lawyerapp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccountLawyer),
},'Lawyer');
global.LawyerappAuth = Lawyerapp.auth()
// export {Userapp}