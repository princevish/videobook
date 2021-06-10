const passport = require('passport');

const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../model/user');


// authentication using passport
passport.use(new LocalStrategy({
        usernameField: 'email',
        passReqToCallback: true
    },
    function(req, email, password, done){
        // find a user and establish the identity
        User.findOne({email: email},async function(err, user)  {
            if (err){
                
                return done(err);
            }
            if(!user){
                return done(null, false, { message: 'That email is not registered' });
            }
            
           
            if (user){
               const hashpass= await bcrypt.compare(password,user.password)
               if(hashpass){
                   return done(null, user); 
               }else{
                return done(null, false, { message: 'Password incorrect' });
               }
               
            }
            return done(null, false);
              
         
        });
    }


));


// serializing the user to decide which key is to be kept in the cookies
passport.serializeUser(function(user, done){
    done(null, user.id);
});



// deserializing the user from the key in the cookies
passport.deserializeUser(function(id, done){
    User.findById(id, function(err, user){
        if(err){
            console.log('Error in finding user --> Passport');
            return done(err);
        }

        return done(null, user);
    });
});


module.exports = passport