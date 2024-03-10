const collection = require("../src/config");
const loadAuth = (req, res) => {
    res.render('auth');
}
const successGoogleLogin = async(req , res) => { 
	if(!req.user) 
		res.redirect('/failure'); 
    console.log(req.user);
	const data = {
        name: req.user.given_name,
        email: req.user.email,
    }
    const userdata = await collection.insertMany(data);
    console.log(userdata);
}

const failureGoogleLogin = (req , res) => { 
	res.send("login",{data:"true"}); 
}

module.exports = {
    loadAuth,
    successGoogleLogin,
    failureGoogleLogin
}