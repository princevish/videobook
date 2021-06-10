const express = require('express');
const app =  express();

const cors =require('cors');
const session = require('express-session');
const passport = require('passport');
const db = require('./config/db');
const initialize = require('./config/passport-config')
const expressLayouts = require('express-ejs-layouts');
const flash = require('connect-flash');

app.set('view engine', 'ejs');
app.use(passport.initialize())
app.use(passport.session())
app.use(cors())
app.use(express.json());
app.use(express.static('views'));
app.use('/video',express.static('uploads'));
app.use(expressLayouts);
app.use(flash());
app.use(express.urlencoded({ extended: true }));

// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);


app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});


app.use('/', require('./router'));


app.listen('5000', function() {
  console.log("Server is listening at the port",5000);
});

