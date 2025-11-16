// all required packages
const passport = require('passport')
const session = require('express-session')
const localStrategy = require('passport-local')
const model = require('../../models')

// all midlleware functions 
// test if it will word

// Serializing za user
passport.serializeUser((seller, done) =>{
  done(null,seller.id)
})

// deserializing za user
passport.deserializeUser((id, done) =>{
  if (id){
    done(null, seller)
  }
  else{
    done(err, null)
  }
})

// test for exporting local strategy
export default passport.use(
  new LocalStrategy((seller_Email, seller_Password, done) => {
    if (err) {
      done(err, null);
    };
    if (seller !== null) {
      done(null, seller);
    }
  
  })

)
