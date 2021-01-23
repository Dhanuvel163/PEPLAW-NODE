const router = require('express').Router();
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Case = require('../models/case');
const Lawyer = require('../models/lawyer');

const config = require('../config');
const checkJWT = require('../middlewares/check-jwtuser');


router.post('/signup', (req, res, next) => {
 let user = new User();
 user.name = req.body.name;
 user.email = req.body.email;
 user.password = req.body.password;
 user.mobile = req.body.mobile;
 user.picture = user.gravatar();

 User.findOne({ email: req.body.email },{password:0}, (err, existingUser) => {
  if (existingUser) {
    res.json({
      success: false,
      message: 'Account with that email is already exist'
    });

  } else {
    user.save();

    var token = jwt.sign({
      user: user,
      islawyer:false
    }, config.secret, {
      expiresIn: '7d'
    });

    res.json({
      success: true,
      message: 'Enjoy your token',
      token: token,
      name:user.name
    });
  }

 });
});

router.post('/login', (req, res, next) => {

  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) throw err;

    if (!user) {
      res.json({
        success: false,
        message: 'Authenticated failed, User not found'
      });
    } else if (user) {

      var validPassword = user.comparePassword(req.body.password);
      if (!validPassword) {
        res.json({
          success: false,
          message: 'Authentication failed. Wrong password'
        });
      } else {
        delete user['password']
        var token = jwt.sign({
          user: user,
          islawyer:false
        }, config.secret, {
          expiresIn: '7d'
        });

        res.json({
          success: true,
          mesage: "Enjoy your token",
          token: token,
          name:user.name
        });
      }
    }

  });
});

router.route('/profile')
  .get(checkJWT, (req, res, next) => {
    User.findOne({ _id: req.decoded.user._id },{password:0}, (err, user) => {
      res.json({
        success: true,
        user: user,
        message: "Successful"
      });
    });
  })
  .post(checkJWT, (req, res, next) => {
    User.findOne({ _id: req.decoded.user._id },{password:0}, (err, user) => {
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

  router.get('/cases', checkJWT, (req, res, next) => {
    Case.find({ User: req.decoded.user._id })
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

  router.get('/pendingcases', checkJWT, (req, res, next) => {
    Case.find({ User: req.decoded.user._id,locked:false })
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
    Case.find({ locked:true })
    .populate('lockedlawyer','email name mobile')
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


  router.post('/cases', checkJWT, (req, res, next) => {
    let newcase = new Case();
    newcase.User=req.decoded.user._id;
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

  router.get('/alllawyers', checkJWT, (req, res, next) => {
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
  
module.exports = router;