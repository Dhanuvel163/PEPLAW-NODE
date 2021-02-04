const router = require('express').Router();
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Case = require('../models/case');
const Lawyer = require('../models/lawyer');

const config = require('../config');
const firebaseAuthCheck = require('../firebase/authcheck')

router.post('/createUser',firebaseAuthCheck.authUser, (req, res, next) => {
 let user = new User();
 user.name = req.body.name;
 user.email = req.body.email;
 user.password = req.body.password;
 user.firebaseId = req.uid.uid
//  if(req.body.mobile){
//    user.mobile = req.body.mobile ;
//  }
 if(req.body.picture){
   user.picture = req.body.picture ;
 }else{
   user.picture = user.gravatar();
 }
 User.findOne({ email: req.body.email },{password:0}, (err, existingUser) => {
  if (existingUser) {
    res.json({
      success: false,
      message: 'Email already exists'
    });

  } else {
    user.save()
    res.json({
      success: true,
      message: 'Created user',
      user
    });
  }
 });
});


router.route('/profile')
  .get(firebaseAuthCheck.authUser, (req, res, next) => {
    User.findOne({ email: req.uid.email },{password:0}, (err, user) => {
      res.json({
        success: true,
        user: user,
        message: "Successful"
      });
    });
  })
  .post(firebaseAuthCheck.authUser, (req, res, next) => {
    User.findOne({ email: req.uid.email },{password:0}, (err, user) => {
      if (err) return next(err);

      if (req.body.name) user.name = req.body.name;
      if (req.body.email) user.email = req.body.email;
      if (req.body.mobile) user.mobile = req.body.mobile;
      if (req.body.country) user.country = req.body.country;
      if (req.body.city) user.city = req.body.city;

      if (req.body.addr1) user.address.addr1 = req.body.addr1;
      if (req.body.addr2) user.address.addr2 = req.body.addr2;
      if (req.body.state) user.address.state = req.body.state;
      if (req.body.postalCode) user.address.postalCode = req.body.postalCode;
      user.save();
      res.json({
        success: true,
        message: 'Successfully edited your profile',
        profile:user
      });
    });
  });

  router.route('/cases')
    .get(firebaseAuthCheck.authUser, (req, res, next) => {
      Case.find({ User: req.uid.email })
      .populate('lawyerRequests','email name mobile _id')
        .exec((err, cases) => {
          if (err) {
            res.json({
              success: false,
              message: "Couldn't find your Cases"
            });
          } else {
            res.json({
              success: true,
              message: 'Found your Cases',
              cases: cases
            });
          }
        });
    })
    .post(firebaseAuthCheck.authUser, (req, res, next) => {
      let newcase = new Case();
      newcase.User=req.uid.email;
      newcase.dispositioncode = req.body.dcode;
      newcase.dispositiondate = req.body.ddate;
      newcase.sentencetime = req.body.stime;
      newcase.amendedcharge = req.body.acharge;
      newcase.description = req.body.desc;

      Case.findOne({ dispositioncode: req.body.dcode }, (err, findcase) => {
        if (err) throw err;
        if (!findcase) {
          try{
            newcase.save()
            res.json({
              success: true,
              message: 'Added succesfully',
              case:newcase
            });
          }catch(e){
            console.log(e)
            res.json({
              success: false,
              message: e.message,
            });      
          }
        } else {
          res.json({
            success: false,
            message: 'Case with disposition code already exist'
          });
        }
      });
    });

  router.get('/pendingcases', firebaseAuthCheck.authUser, (req, res, next) => {
    Case.find({ User: req.uid.email,locked:false })
    .populate('lawyerRequests','email name mobile _id')
      .exec((err, cases) => {
        if (err) {
            res.json({
              success: false,
              message: "Couldn't find your Cases"
            });
        } else {
          res.json({
            success: true,
            message: 'Found your Cases',
            cases: cases
          });
        }
      });
  }); 

  router.get('/acceptedcases', firebaseAuthCheck.authUser, (req, res, next) => {
    Case.find({ User: req.uid.email,locked:true })
    .populate('lockedlawyer','email name mobile _id')
    .populate('lawyerRequests','email name mobile')
      .exec((err, cases) => {
        if (err) {
            res.json({
              success: false,
              message: "Couldn't find your Cases"
            });
        } else {
          res.json({
            success: true,
            message: 'Found your Cases',
            cases: cases
          });
        }
      });
  });

  router.post('/accept/:case/:lawyer', firebaseAuthCheck.authUser, (req, res, next) => {
    Case.findOne({locked:false,_id:req.params.case,User: req.uid.email})
    .populate('lawyerRequests','email name mobile _id')
      .exec((err, cases) => {
        if (err) {
          res.json({
            success: false,
            message: "You are not authorized to update or case is already accepted"
          });
        } else {
          cases.lockedlawyer = req.params.lawyer
          cases.locked = true
          cases.save()

          Lawyer.findById(req.params.lawyer)
          .exec((err,lawyer)=>{
            if(err){
              res.json({
                success: false,
                message: "Something Went Wrong"
              }); 
            }else{
              cases.lockedlawyer = {
                name :lawyer.name,
                email :lawyer.email,
                mobile :lawyer.mobile
              }
            }
          })
          
          res.json({
            success: true,
            message: 'Accepted',
            cases: cases
          });
        }
      });
  });

  // router.get('/cases/:id', firebaseAuthCheck.authUser, (req, res, next) => {
  //   Case.findOne({ _id: req.params.id })
  //     .populate('User')
  //     .exec((err, cases) => {
  //       if (err) {
  //         res.json({
  //           success: false,
  //           message: "Couldn't find your case"
  //         });
  //       } else {
  //         res.json({
  //           success: true,
  //           message: 'Found your case',
  //           cases: cases
  //         });
  //       }
  //     });
  // });

  router.get('/alllawyers', firebaseAuthCheck.authUser, (req, res, next) => {
    Lawyer.find()
      .exec((err, lawyers) => {
        if (err) {
          res.json({
            success: false,
            message: "Couldn't find your lawyers"
          });
        } else {
          res.json({
            success: true,
            message: 'Found your lawyers',
            lawyers: lawyers
          });
        }
      });
  });
  
router.route('/lawyerprofiledetail/:lawyer')
  .get(firebaseAuthCheck.authUser, (req, res, next) => {
    Lawyer.findOne({ _id: req.params.lawyer },{password:0}, (err, lawyer) => {
      res.json({
        success: true,
        lawyer,
        message: "Successful"
      });
    });
  })

module.exports = router;