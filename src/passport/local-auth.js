const passport = require('passport');
const LocalStrategy =  require('passport-local').Strategy;

const User = require('../models/user');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});

passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
},  async (req, email, password, done) => {
     try {
        const user = await User.findOne({ email: email });
        if (user) {
            return done(null, false, req.flash('signupMessage', 'The email is already taken.'));
        } else {
            const newUser = new User(); 
            const { role } = req.body;
            newUser.email = email;
            newUser.password = newUser.encryptPassword(password);
            newUser.role = role; 
            await newUser.save();
            return done(null, newUser);
        }
    } catch (error) {
        return done(error);
    }
}));

passport.use('local-signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, email, password, done) => {
    const user = await User.findOne({email: email});
    if(!user) {
        return done(null, false, req.flash('signinMessage','No userd found'));
    }
    if(!user.comparePassword(password)) {
        return done(null, false, req.flash('signinMessage','Incorrect Password'));
    }
    done(null, user);
}));
