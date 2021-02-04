const router = require('express').Router();
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Lawyer = require('../models/lawyer');
const Case = require('../models/case');
const config = require('../config');
const firebaseAuthCheck = require('../firebase/authcheck')

router.post('/createLawyer',firebaseAuthCheck.authLawyer, (req, res, next) => {
 let lawyer = new Lawyer();
 lawyer.name = req.body.name;
 lawyer.email = req.body.email;
 lawyer.password = req.body.password;

 lawyer.firebaseId = req.uid.uid
//  if(req.body.mobile){
//    user.mobile = req.body.mobile ;
//  }
 if(req.body.picture){
   lawyer.picture = req.body.picture ;
 }else{
   lawyer.picture = lawyer.gravatar();
 }
 Lawyer.findOne({ email: req.body.email },{password:0}, (err, existingLawyer) => {
  if (existingLawyer) {
    res.json({
      success: false,
      message: 'Email already exists'
    });

  } else {
    lawyer.save()
    res.json({
      success: true,
      message: 'Created user',
      lawyer
    });
  }
 });
});

router.route('/profile')
  .get(firebaseAuthCheck.authLawyer, (req, res, next) => {
    Lawyer.findOne({ email: req.uid.email },{password:0}, (err, lawyer) => {
      res.json({
        success: true,
        lawyer: lawyer,
        message: "Successful"
      });
    });
  })
  .post(firebaseAuthCheck.authLawyer, (req, res, next) => {
    Lawyer.findOne({ email: req.uid.email },{password:0}, (err, lawyer) => {
      if (err) return next(err);
      if (req.body.name) lawyer.name = req.body.name;
      if (req.body.email) lawyer.email = req.body.email;
      if (req.body.mobile) lawyer.mobile = req.body.mobile;
      if (req.body.country) lawyer.country = req.body.country;
      if (req.body.city) lawyer.city = req.body.city;

      if (req.body.addr1) lawyer.address.addr1 = req.body.addr1;
      if (req.body.addr2) lawyer.address.addr2 = req.body.addr2;
      if (req.body.state) lawyer.address.state = req.body.state;
      if (req.body.postalCode) lawyer.address.postalCode = req.body.postalCode;
      try{
        lawyer.save();
      }
      catch(e){
        console.log(e)
      }
      res.json({
        success: true,
        message: 'Successfully edited your profile',
        profile:lawyer
      });
    });
  });

    router.get('/cases', firebaseAuthCheck.authLawyer, (req, res, next) => {
    Case.find({lawyerRequests: req.uid.email})
      .populate('User','email name mobile')
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

  router.get('/acceptedcases', firebaseAuthCheck.authLawyer, (req, res, next) => {
    Case.find({ lockedlawyer: req.uid.email })
      .populate('User','email name mobile _id')
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

  router.get('/rejectedcases', firebaseAuthCheck.authLawyer, (req, res, next) => {
    Case.find({ locked: true,lawyerRequests: req.uid.email })
      .populate('User','email name mobile _id')
      .exec((err, cases) => {
        if (err) {
          res.json({
            success: false,
            message: "Couldn't find your Cases"
          });
        } else {
          cases=cases.filter((b)=>b.lockedlawyer!=req.uid.email)
          res.json({
            success: true,
            message: 'Found your Cases',
            cases: cases
          });
        }
      });
  });

  router.get('/pendingcases', firebaseAuthCheck.authLawyer, (req, res, next) => {
    Case.find({ locked: false ,lawyerRequests: req.uid.email})
      .populate('User','email name mobile _id')
      .exec((err, cases) => {
        if (err) {
          res.json({
            success: false,
            message: "Couldn't find your Cases"
          });
        } else {
          cases=cases.filter((b)=>b.lockedlawyer!=req.uid.email)
          res.json({
            success: true,
            message: 'Found your Cases',
            cases: cases
          });
        }
      });
  });

  router.post('/apply/:id',firebaseAuthCheck.authLawyer, (req, res, next) => {
    Case.findOne({ _id: req.params.id })
      .exec((err, cases) => {
        if (err) {
          console.log(err)
          res.json({
            success: false,
            message: "Couldn't find the Cases"
          });
        }else{
          // cases.lockedlawyer=req.uid.email ;
          // cases.locked=true;

          if(cases.lawyerRequests.includes(req.uid.email)){
            res.json({
              success: false,
              message: "You Have Already Applied !!"
            });
          }else{
            cases.lawyerRequests=cases.lawyerRequests.concat(req.uid.email) ;
            cases.save();
            res.json({
              success: true,
              message: "Applied Successfully !!",
              case:cases
            });
          }


        }
        
      })
  })

  router.get('/allcases', (req, res, next) => {
    Case.find({ locked:false})
      .populate('User','name email mobile _id')
      .exec((err, cases) => {
        if (err) {
          res.json({
            success: false,
            message: "Couldn't find your Cases",
            err:err.message
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
  
  // router.get('/cases/:id', firebaseAuthCheck.authLawyer, (req, res, next) => {
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

router.route('/userprofiledetail/:user')
  .get(firebaseAuthCheck.authLawyer, (req, res, next) => {
    User.findOne({ _id: req.params.user },{password:0}, (err, user) => {
      res.json({
        success: true,
        user,
        message: "Successful"
      });
    });
  })

module.exports = router;
