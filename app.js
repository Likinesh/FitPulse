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
    password:"likith",
    port:5432,
});
db.connect(console.log("DataBase connected"));

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine","ejs");

const saltRounds=10;

app.get("/login",(req,res)=>{
    res.render("login",{data:0});
})

app.post("/login",async (req,res)=>{
        const loginusername=req.body.username;
        const loginpassword=req.body.password;
        try{
        const storedusername= await db.query(
        "SELECT * FROM users WHERE email= $1",
        [loginusername]
        );
    if(storedusername.rows.length>0){
        if(loginpassword=== storedusername.rows[0].tpassword){
        res.render("secrets",{data:loginusername});
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

app.get("/register",(req,res)=>{
    res.render("register",{data:0});
})

const user_id=1;
app.post("/register",async (req,res)=>{
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
    res.render("register",{data:"username already exists."});
   }
   
   else{
    // const result= 
    await db.query(
        "INSERT INTO users (tusername,tpassword,email,age,weight,height,gender,bmi,user_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)",
        [username,password,email,age,weight,height,gender,bmi,user_id]
    );
    user_id=user_id+1;
    res.redirect("/login");
    }
    }catch(err){
        console.log(err);
        res.send("<h1>Error connecting to database</h1>")

    }
})

app.post("/addlog",async (req,res)=>{
    const username=req.body.username;
    const cal=req.body.cal;
    const dur= req.body.dur;
    const activity=req.body.activity;
    const date=Date.now;
    try{
    await db.query(
        "INSERT INTO data(tusername,calories,duration,activity,date) VALUES ($1,$2,$3,$4,$5)",
        [username,cal,dur,activity,date]
    
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