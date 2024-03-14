import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import {dirname} from "path";
import {fileURLToPath} from "url";
import axios from "axios"
const _dirname =dirname(fileURLToPath(import.meta.url));
import morgan from "morgan";

morgan('combined');


const app=express();
const port=3000; 

const db=new pg.Client({
    user:"postgres",
    host:"localhost",
    database:"users",
    password:"likith",
});
db.connect(console.log("DataBase connected"));

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine","ejs");

app.get("/",(req,res)=>{
    res.render("home");
})

let user=null;
app.get("/login",(req,res)=>{
    res.render("login",{data:0});
})

app.post("/login",async (req,res)=>{
        const loginemail=req.body.email;
        const loginpassword=req.body.password;
        try{
        const storedemail= await db.query(
        "SELECT * FROM users WHERE email= $1",
        [loginemail]
        );
        console.log(storedemail.rows);
        console.log(storedemail.rows.length);
        console.log(storedemail.rows[0]);
        console.log(loginpassword);
    if(storedemail.rows.length>0){ 
    if(loginpassword=== storedemail.rows[0].tpassword){
        user=storedemail.rows[0].tusername;
        res.render("secrets",{data:user,bmi:storedemail.rows[0].tbmi});
    }
    else{
        res.render("login",{data:"Wrong Password"})
    }
 }
 else{
    res.render("login",{data:"No User Found"})
  }
        }catch(err){
            console.log(err);
        }
})

app.get("/secrets",(req,res)=>{
    res.render("secrets.ejs");
})
app.get("/signup",(req,res)=>{
    res.render("signup",{data:0});
})

app.post("/signup",async (req,res)=>{
    const username=req.body.username;
    const email = req.body.email;
    const password=req.body.password;
    try{
    const checkresult= await db.query(
        "SELECT * FROM users WHERE tusername=$1",
        [username]
    );
   
   if(checkresult.rows.length>0){
    res.render("signup",{data:"username already exists."});
   }
   
   else{
    await db.query(
        "INSERT INTO users (tusername,tpassword,email) VALUES ($1,$2,$3)",
        [username,password,email]
    );
    user=username;
    res.redirect("/register");
    }
    }
    catch(err){
        console.log(err);
        res.send("<h1>Error connecting to database</h1>")
    }
})

app.get("/register",(req,res)=>{
    res.render("register");
})
console.log(user)
app.post("/register",async(req,res)=>{
    const tage=req.body.age;
    const tweight = req.body.weight;
    const theight=req.body.height;
    const tgender = req.body.gender;
    const options = {
        method: 'GET',
        url: 'https://fitness-calculator.p.rapidapi.com/bmi',
        params: {
          age: tage,
          weight: tweight,
          height: theight
        },
        headers: {
          'X-RapidAPI-Key': '81f06e6ff8msh412817c08531a45p158f86jsn1050cfdaf157',
          'X-RapidAPI-Host': 'fitness-calculator.p.rapidapi.com'
        }
      };   
    try{
        const response = await axios.request(options);
        const result=response.data; 
        const tbmi=result.bmi;
        await db.query(
            "UPDATE users SET age=$1, weight=$2, height=$3, gender=$4, bmi=$5 WHERE tusername=$6",
            [tage, tweight, theight, tgender, tbmi, user]
        );
        
        res.redirect("/login");
    }
    catch(err){
        console.log(err);
        res.send("<h1>Error connecting to database</h1>")
    }
})

app.get("/user",async(req,res)=>{
    try{
        const result= await db.query(
            "SELECT * FROM users WHERE tusername=$1",
            [user]
        );
        const data={
            "user_name":user,
            "user_age":result.rows[0].age,
            "user_weight":result.rows[0].weight,
            "user_height":result.rows[0].height,
            "user_gender":result.rows[0].gender
        }
        const options = {
            method: 'GET',
            url: 'https://fitness-calculator.p.rapidapi.com/bmi',
            params: {
              age: result.rows[0].age,
              weight: result.rows[0].weight,
              height: result.rows[0].height
            },
            headers: {
              'X-RapidAPI-Key': '81f06e6ff8msh412817c08531a45p158f86jsn1050cfdaf157',
              'X-RapidAPI-Host': 'fitness-calculator.p.rapidapi.com'
            }
          };   
        const response = await axios.request(options);
        const result1=response.data;
    console.log(data);
    res.render("user",{data:data,api:result1});
    }
    catch(err){
        console.log(err);
        res.send("<h1>Error connecting to database</h1>")
    }
})
    

app.post("/addlog",async (req,res)=>{
    const username=user;
    const dur= req.body.dur;
    const activity=req.body.activity;
    const date=Date.now;
    try{
    await db.query(
        "INSERT INTO data(tusername,duration,activity,date) VALUES ($1,$2,$3,$4)",
        [username,dur,activity,date]
    
    );
    }
    catch(err){
        console.log(err);
        res.send("<h1>Error connecting to database</h1>")
    }
})

app.get("/contact",(req,res)=>{
    res.render("contact")
})

app.post('/sendmail',async(req,res)=>{
    let name =req.body.name;
    let mail =req.body.mail;
    let doubt = req.body.query;
    let testaccount = await nodemailer.createTestAccount();
    let transporter = await nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "8be94564c6efe9",
        pass: "134001e0c60db6"
      },
    })
    let info =transporter.sendMail({
        from: name + " " + mail,    
        to: "likithkskommareddy@gmail.com",  
        subject: "Query regarding Space Explorer",    
        text: doubt
    })
    console.log((await info).messageId)
    res.redirect("/contact")
  })

app.listen(port,()=>{
    console.log(`server running on port ${port}`);
})