const express = require('express');
const router = express();
const passport = require('passport'); 
require('../passport');

router.use(passport.initialize()); 
router.use(passport.session());

const userController = require('../controllers/userController');

router.get('/auth/google' , passport.authenticate('google', { scope: 
	[ 'email', 'profile' ] 
})); 

router.get( '/auth/google/callback', 
	passport.authenticate( 'google', { 
		successRedirect: '/success', 
		failureRedirect: '/failure'
}));

router.get('/success' ,(req,res)=>{
	res.render("home")
}); 

router.get('/failure' , userController.failureGoogleLogin);

module.exports = router;