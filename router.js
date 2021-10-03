const express = require('express');
const router = express.Router();
const upload = require('./upload')
const multer = require('multer')
const bcrypt = require('bcrypt');
const passport = require('passport');
const fs = require("fs");
const {
  User,
  Video
} = require('./model/model');

const {
  forwardAuthenticated,
  ensureAuthenticated
} = require('./config/auth');


// main home 
router.get('/', (req, res, next) => {
  Video.find({}, async function (err, data) {
    if (err) {
      console.log(err)
    }
    res.render("index.ejs", {
      video: data
    });

  });

});

// login page
router.get('/login', forwardAuthenticated, (req, res) => {
  res.render('login');
})

// register page
router.get('/register', forwardAuthenticated, (req, res) => {
  res.render('register');
})


// upload page
router.get('/upload', ensureAuthenticated, (req, res) => {

  res.render('upload');
})


// upload route
router.post('/upload', ensureAuthenticated, (req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      return res.render('upload', {
        errors: err
      });
    } else if (err) {
      // An unknown error occurred when uploading.
      return res.render('upload', {
        errors: err
      });
    }

    const video = new Video({
      name: req.body.name,
      discription: req.body.discription,
      video: `${req.file.filename}`,
      user: req.user
    });
    video.save()
    return res.redirect('/')
  })

});

// login route
router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));

// register route
router.post('/register', forwardAuthenticated, (req, res) => {
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

      if (!user) {
        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await User.create({
          name,
          email,
          password: hashedPassword
        })

        res.redirect('/login')
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

//logout route
router.get('/logout', ensureAuthenticated, (req, res) => {
  req.logOut()
  res.redirect('/login')
})

router.get("/video", function (req, res) {
  // Ensure there is a range given for the video
  let {
    src
  } = req.query;
  const range = req.headers.range;
  if (!range) {
    res.status(400).send("Requires Range header");
  }

  // get video stats (about 61MB)

  try {
    var videoPath = `uploads/${src}`;
    var videoSize = fs.statSync(`uploads/${src}`).size;
  } catch (err) {
    var videoPath = `uploads/notfound.mp4`;
    var videoSize = fs.statSync(`uploads/notfound.mp4`).size;
  }
  // Parse Range
  // Example: "bytes=32324-"
  const CHUNK_SIZE = 10 ** 6; // 1MB
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

  // Create headers
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };

  // HTTP Status 206 for Partial Content
  res.writeHead(206, headers);

  // create video read stream for this particular chunk
  const videoStream = fs.createReadStream(videoPath, {
    start,
    end
  });

  // Stream the video chunk to the client
  videoStream.pipe(res);

});


module.exports = router;