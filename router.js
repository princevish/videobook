const express = require('express');
const router = express.Router();
const upload = require('./upload')
const multer = require('multer')
const bcrypt = require('bcrypt');
const passport = require('passport');
const User = require('./model/user');
const Video = require('./model/video');
const {
  forwardAuthenticated,
  ensureAuthenticated
} = require('./config/auth');
router.get('/', (req, res, next) => {
  console.log(res.locals.user)
  
  Video.find({}, async function (err, data) {
    if (err) {
      console.log(err)
    }


    res.render("index.ejs", {
      video: data
    });

  });


});
router.get('/upload', ensureAuthenticated, (req, res) => {
  
  res.render('upload');
})

router.post('/upload', ensureAuthenticated, (req, res, next) => {


  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      return res.status(401).json({
        "data": err
      })
    } else if (err) {
      // An unknown error occurred when uploading.
      return res.status(403).json({
        "data": err
      })
    }

    const video = new Video({
      name: req.body.name,
      discription: req.body.discription,
      video: `video/${req.file.filename}`
    });
    video.save()
    return res.redirect('/')
  })

});

router.get('/login', forwardAuthenticated, (req, res) => {
  res.render('login');
})


router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));

router.get('/register', forwardAuthenticated, (req, res) => {
  res.render('register');
})

router.post('/register', (req, res) => {
  try {

    const {
      name,
      email,
      password
    } = req.body
    let errors = [];
    if (!name || !email || !password) {
      errors.push({
        msg: 'Please enter all fields'
      });
    }



    if (password.length < 6) {
      errors.push({
        msg: 'Password must be at least 6 characters'
      });
    }

    if (errors.length > 0) {
      return res.render('register', {
        errors

      });
    }
    User.findOne({
      email
    }, async function (err, user) {
      if (err) {
        console.log(err)
      }
      console.log(user)
      if (!user) {
        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await User.create({
          name,
          email,
          password: hashedPassword
        })

        res.redirect('/')
      } else {
        errors.push({
          msg: 'user allready Exist'
        });
        res.render('register', {
          errors
        });
      }
    });


  } catch {
    res.redirect('/register')
  }
})

router.get('/logout', ensureAuthenticated, (req, res) => {
  req.logOut()
  res.redirect('/login')
})


module.exports = router;