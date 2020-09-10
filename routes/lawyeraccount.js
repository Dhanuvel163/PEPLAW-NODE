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

 Lawyer.findOne({ email: req.body.email }, (err, existingUser) => {
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
      token: token
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
        var token = jwt.sign({
            lawyer: lawyer,
            islawyer:true
        }, config.secret, {
          expiresIn: '7d'
        });

        res.json({
          success: true,
          mesage: "Enjoy your token",
          token: token
        });
      }
    }

  });
});

router.route('/profile')
  .get(checkJWT, (req, res, next) => {
    Lawyer.findOne({ _id: req.decoded.lawyer._id }, (err, lawyer) => {
      res.json({
        success: true,
        lawyer: lawyer,
        message: "Successful"
      });
    });
  })
  .post(checkJWT, (req, res, next) => {
    Lawyer.findOne({ _id: req.decoded.lawyer._id }, (err, lawyer) => {
      if (err) return next(err);
      console.log(req.body)
      if (req.body.name) lawyer.name = req.body.name;
      if (req.body.email) lawyer.email = req.body.email;
      if (req.body.password) lawyer.password = req.body.password;
      if (req.body.mobile) lawyer.mobile = req.body.mobile;
      try{
        lawyer.save();
      console.log(lawyer)
      }
      catch(e){
        console.log(e)
      }
      res.json({
        success: true,
        message: 'Successfully edited your profile'
      });
    });
  });

  // router.route('/address')
  // .get(checkJWT, (req, res, next) => {
  //   Lawyer.findOne({ _id: req.decoded.lawyer._id }, (err, lawyer) => {
  //     res.json({
  //       success: true,
  //       address: lawyer.address,
  //       message: "Successful"
  //     });
  //   });
  // })
  // .post(checkJWT, (req, res, next) => {
  //   Lawyer.findOne({ _id: req.decoded.lawyer._id }, (err, lawyer) => {
  //     if (err) return next(err);

  //     if (req.body.addr1) lawyer.address.addr1 = req.body.addr1;
  //     if (req.body.addr2) lawyer.address.addr2 = req.body.addr2;
  //     if (req.body.city) lawyer.address.city = req.body.city;
  //     if (req.body.state) lawyer.address.state = req.body.state;
  //     if (req.body.country) lawyer.address.country = req.body.country;
  //     if (req.body.postalCode) lawyer.address.postalCode = req.body.postalCode;
  //    try{
  //     lawyer.save();
  //    }
  //    catch(e){
  //      console.log(e)
  //    }
  //     res.json({
  //       success: true,
  //       message: 'Successfully edited your address'
  //     });
  //   });
  // });


  router.get('/cases', checkJWT, (req, res, next) => {
    Case.find({ lockedlawyer: req.decoded.lawyer._id })
      // .populate('User')
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

  router.get('/allcases', checkJWT, (req, res, next) => {
    Case.find({ locked:false})
      // .populate('User')
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

  router.post('/accept/:id',checkJWT, (req, res, next) => {
    Case.findOne({ _id: req.params.id })
      .exec((err, cases) => {
        if (err) {
          console.log(err)
          res.json({
            success: false,
            message: "Couldn't find your Cases"
          });
        }else{
          console.log(cases)
          cases.lockedlawyer=req.decoded.lawyer._id ;
          cases.locked=true;
          cases.save();
          console.log(cases)
          res.json({
            success: true,
            message: "Updated Successfully !!"
          });
        }
        
      })
  })
  
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
