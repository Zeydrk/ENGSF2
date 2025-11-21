// all required packages
const passport = require('passport')
const session = require('express-session')
const LocalStrategy = require('passport-local')

// all midlleware functions 
// test if it will word

// Serializing za user
passport.serializeUser((user, done) =>{
  done(null,user.email)
})

// deserializing za user
passport.deserializeUser((email, done) =>{
  if (email){
    done(null, user)
  }
  else{
    done(err, null)
  }
})

// test for exporting local strategy
passport.use(
  new LocalStrategy((email, password, done) => {
    if (err) {
      done(err, null);
    };
    if (user !== null) {
      done(null, user);
    }
  
  })

)
module.exports = passport
