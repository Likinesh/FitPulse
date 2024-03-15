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
    password:"postgres",
});
db.connect(console.log("DataBase connected"));

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine","ejs");

let user=null,user_val=0;
app.get("/",(req,res)=>{
    res.render("home",{data:user_val});
})
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
        console.log(storedemail.rows[0]);
        console.log(loginpassword);
    if(storedemail.rows.length>0){ 
    if(loginpassword=== storedemail.rows[0].tpassword){
        user=storedemail.rows[0].tusername;
        user_val=storedemail.rows[0].tusername;
        res.render("home",{data:user_val});
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
app.post("/update",(req,res)=>{
    res.render("update");
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
    const tbmi=(tweight*100*100)/(theight*theight);
    try{
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
        console.log(user);
        const result= await db.query(
            "SELECT * FROM users WHERE tusername=$1",
            [user]
        );
        var status,range;
        const x=result.rows[0].bmi;
        if(x<18.5){
            status="You are currently Underage";
            range="BMI range: 0-18.5"
        }
        else if(x>=18.5 && x<24.9){
            status="You are Healthy";
            range="BMI range: 18.5-24.9"
        }
        else if(x>=25 && x<29.9){
            status="You are currently Overage";
            range="BMI range: 25-29.9"
        }
        else if(x>=30){
            status="You have obesity";
            range="BMI range: 30 or higher"
        }
        const data={
            "user_name":result.rows[0].tusername,
            "user_age":result.rows[0].age,
            "user_mail":result.rows[0].email,
            "user_weight":result.rows[0].weight,
            "user_height":result.rows[0].height,
            "user_gender":result.rows[0].gender,
            "user_bmi":result.rows[0].bmi,
            "user_status":status,
            "user_range":range
        }
    console.log(data);
    res.render("user",{data:data});
    }
    catch(err){
        console.log(err);
        res.send("<h1>Error connecting to database</h1>")
    }
})
app.post("/update-info",async(req,res)=>{
    const tage=req.body.age;
    const tweight = req.body.weight;
    const theight=req.body.height;
    const tgender = req.body.gender;
    const tbmi=(tweight*100*100)/(theight*theight);
    try{
        await db.query(
            "UPDATE users SET age=$1, weight=$2, height=$3, gender=$4, bmi=$5 WHERE tusername=$6",
            [tage, tweight, theight, tgender, tbmi, user]
        );
        res.redirect("/user");
    }
    catch(err){
        console.log(err);
        res.send("<h1>Error connecting to database</h1>")
    }
})   


app.post("/addlog",async (req,res)=>{
    const username=user;
    const dur= req.body.dur;
    const user_activity=req.body.activity;
    const date=Date.now;
    var cal;
    try{
    await db.query( 
        "INSERT INTO workout(username,duration,act_date,date,cal) VALUES ($1,$2,$3,$4,$5)",
        [username,dur,user_activity,date,cal]
    
    );
    }
    
    catch(err){
        console.log(err);
        res.send("<h1>Error connecting to database</h1>")
    }
})

app.get("/secrets",async(req,res)=>{
    try{
          const out=await db.query(
        "SELECT FROM workout WHERE username=$1",
         [user]
          )

     const data={
        "act_date":out.rows[0].act_date,
        "user_activity":out.rows[0].activity,
        "user_duration":out.rows[0].duration,
        "calories":out.rows[0].cal
     }
     res.render("secrets",{data:data});
     }
     catch(err){
        console.log("Error occured in connecting database:",err);
        res.send("error while connecting database.");
     }

})
// app.get("/",async (req,res)=>{
// try{
// const response =await axios.get(
//     `https://api.api-ninjas.com/v1/caloriesburnedactivities?activity=${user_activity}`
// );
// const result2=response.data;
// res.render("/addlog",{data:result2})
// }catch(err){
//     console.log("Failed to mstch your request:",err.message)
// }
// })
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