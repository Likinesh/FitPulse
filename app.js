import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import {dirname} from "path";
import {fileURLToPath} from "url";
const _dirname =dirname(fileURLToPath(import.meta.url));

const app=express();
const port=3000; 

const db=new pg.Client({
    user:"postgres",
    host:"localhost",
    database:"users",
    password:"postgres",
    port:5432,
});
db.connect(console.log("DataBase connected"));

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

const saltRounds=10;

app.get("/login",(req,res)=>{
    res.render("login.ejs",{data:0});//login page
})

app.post("/login",async (req,res)=>{
    console.log("here");

        const loginusername=req.body.username;
        const loginpassword=req.body.password;
        // console.log(loginpassword);
        try{
        const storedusername= await db.query(
        "SELECT * FROM users WHERE email= $1",
        [loginusername]
        );
      
        
//  console.log(storedusername.rows);
const x=storedusername.rows.length ;
 if(x>0){
    if(loginpassword=== storedusername.rows[0].tpassword){
        res.render("secrets.ejs",{data:0});
    }
    else{
        res.render("login.ejs",{data:"Wrong Password"})
    }
 }
 else{
    res.render("login.ejs",{data:"No User Found"})
  }
        }catch(err){
            console.log(err);
        }
})

app.get("/register",(req,res)=>{
    res.render("register.ejs",{data:0});
})

app.post("/register",async (req,res)=>{
    const user_id=1;
    const username=req.body.username;
    const email = req.body.email;
    const password=req.body.password;
    const age=req.body.age;
    const weight = req.body.weight;
    const height=req.body.height;
    const gender = req.body.gender;
    const bmi=(weight*100*100)/(height*height);
    try{
    const checkresult= await db.query(
        "SELECT * FROM users WHERE tusername=$1",
        [username]
    );
   
   if(checkresult.rows.length>0){
    res.render("register.ejs",{data:"username already exists."});
   }
   
   else{
    // const result= 
    await db.query(
        "INSERT INTO users (tusername,tpassword,email,age,weight,height,gender,bmi,user_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)",
        // "INSERT INTO users (tusername,tpassword) VALUES ($1,$2)",
        [username,password,email,age,weight,height,gender,bmi,user_id]
        
    );
    res.redirect("/login");
    // console.log("result:",result);
    }
    }catch(err){
        console.log(err);
        res.send("<h1>Error connecting to database</h1>")

    }
    // res.send("<h1>done</h1>");//render the next oage after email

})

app.listen(port,()=>{
    console.log(`server running on port ${port}`);
})