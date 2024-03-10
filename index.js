const express = require("express");
const path = require("path");
const collection = require("./src/config");
const bcrypt = require('bcrypt');
require('dotenv').config();
const session = require('express-session');

const app = express();
app.use(express.json());
app.use(express.static("public"));
app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET 
}));

app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");

const userRoutes = require('./routes/userRoute');

app.use('/',userRoutes);

app.get("/", (req, res) => {
    res.render("login",{data:"0"});
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.post("/signup", async (req, res) => {
    const data = {
        name: req.body.username,
        email: req.body.email,
        password: req.body.password
    }

    const existingUser = await collection.findOne({ name: data.name });

    if (existingUser) {
        res.redirect("signup",{data:'User already exists.'});
    } else {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);
        data.password = hashedPassword; 

        const userdata = await collection.insertMany(data);
        console.log(userdata);
        res.redirect("/");
    }

});

app.post("/login", async (req, res) => {
    try {
        const check = await collection.findOne({ name: req.body.username });
        if (!check) {
            res.render("login",{data:"User name cannot found"})
        }
        const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
        if (!isPasswordMatch) {
            res.render("login",{data:"wrong Password"});
        }
        else {
            res.render("home");
        }
    }
    catch {
        res.render("login",{data:"wrong Details"});
    }
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
});