const router = require('express').Router();
const jwt = require('jsonwebtoken');

const Lawyer = require('../models/lawyer');
const Case = require('../models/case');
const config = require('../config');
const checkJWT = require('../middlewares/check-jwtlawyer');


router.post('/signup', (req, res, next) => {
 let lawyer = new Lawyer();
 lawyer.name = req.body.name;
 lawyer.email = req.body.email;
 lawyer.password = req.body.password;
 lawyer.mobile = req.body.mobile;
 lawyer.picture = lawyer.gravatar();

 Lawyer.findOne({ email: req.body.email },{password:0}, (err, existingUser) => {
  if (existingUser) {
    res.json({
      success: false,
      message: 'Account with that email is already exist'
    });

  } else {
    lawyer.save();

    var token = jwt.sign({
        lawyer: lawyer,
        islawyer:true
    }, config.secret, {
      expiresIn: '7d'
    });

    res.json({
      success: true,
      message: 'Enjoy your token',
      token: token,
      name:lawyer.name
    });
  }

 });
});

router.post('/login', (req, res, next) => {

    Lawyer.findOne({ email: req.body.email }, (err, lawyer) => {
    if (err) throw err;

    if (!lawyer) {
      res.json({
        success: false,
        message: 'Authenticated failed, User not found'
      });
    } else if (lawyer) {

      var validPassword = lawyer.comparePassword(req.body.password);
      if (!validPassword) {
        res.json({
          success: false,
          message: 'Authentication failed. Wrong password'
        });
      } else {
        delete lawyer['password']
        var token = jwt.sign({
            lawyer: lawyer,
            islawyer:true
        }, config.secret, {
          expiresIn: '7d'
        });

        res.json({
          success: true,
          mesage: "Enjoy your token",
          token: token,
          name:lawyer.name
        });
      }
    }

  });
});

router.route('/profile')
  .get(checkJWT, (req, res, next) => {
    Lawyer.findOne({ _id: req.decoded.lawyer._id },{password:0}, (err, lawyer) => {
      res.json({
        success: true,
        lawyer: lawyer,
        message: "Successful"
      });
    });
  })
  .post(checkJWT, (req, res, next) => {
    Lawyer.findOne({ _id: req.decoded.lawyer._id },{password:0}, (err, lawyer) => {
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

    router.get('/cases', checkJWT, (req, res, next) => {
    Case.find({lawyerRequests: req.decoded.lawyer._id})
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

  router.get('/acceptedcases', checkJWT, (req, res, next) => {
    Case.find({ lockedlawyer: req.decoded.lawyer._id })
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

  router.get('/rejectedcases', checkJWT, (req, res, next) => {
    Case.find({ locked: true,lawyerRequests: req.decoded.lawyer._id })
      .populate('User','email name mobile')
      .exec((err, cases) => {
        if (err) {
          res.json({
            success: false,
            message: "Couldn't find your Cases"
          });
        } else {
          cases=cases.filter((b)=>b.lockedlawyer!=req.decoded.lawyer._id)
          res.json({
            success: true,
            message: 'Found your Cases',
            cases: cases
          });
        }
      });
  });

  router.get('/pendingcases', checkJWT, (req, res, next) => {
    Case.find({ locked: false ,lawyerRequests: req.decoded.lawyer._id})
      .populate('User','email name mobile')
      .exec((err, cases) => {
        if (err) {
          res.json({
            success: false,
            message: "Couldn't find your Cases"
          });
        } else {
          cases=cases.filter((b)=>b.lockedlawyer!=req.decoded.lawyer._id)
          res.json({
            success: true,
            message: 'Found your Cases',
            cases: cases
          });
        }
      });
  });

  router.post('/apply/:id',checkJWT, (req, res, next) => {
    Case.findOne({ _id: req.params.id })
      .exec((err, cases) => {
        if (err) {
          console.log(err)
          res.json({
            success: false,
            message: "Couldn't find the Cases"
          });
        }else{
          // cases.lockedlawyer=req.decoded.lawyer._id ;
          // cases.locked=true;
          cases.lawyerRequests=cases.lawyerRequests.concat(req.decoded.lawyer._id) ;
          cases.save();
          res.json({
            success: true,
            message: "Applied Successfully !!",
            case:cases
          });
        }
        
      })
  })

  router.get('/allcases', (req, res, next) => {
    Case.find({ locked:false})
      .populate('User','name email mobile')
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
  
  // router.get('/cases/:id', checkJWT, (req, res, next) => {
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


module.exports = router;
