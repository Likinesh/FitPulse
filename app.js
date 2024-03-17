import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import {dirname} from "path";
import {fileURLToPath} from "url";
import axios from "axios"
const _dirname =dirname(fileURLToPath(import.meta.url));
import morgan from "morgan";

const app=express();
const port=3000; 

app.use(morgan('combined'));
morgan('tiny')
const db=new pg.Client({
    user:"postgres",
    host:"localhost",
    database:"users",
    password:"postgres"
});
db.connect(console.log("DataBase connected"));

const saltRounds=2;

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine","ejs");

let user=0,user_val=0;
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
            const storedhashpassword=storedemail.rows[0].tpassword;
            bcrypt.compare(loginpassword,storedhashpassword,(err,resu)=>{
                if(err){
                res.send("Error while checking hashed password");
                console.log("Error while occuring checking hashed password:",err);
                }
                else{
                    if(resu){
                  user=storedemail.rows[0].tusername;
               user_val=storedemail.rows[0].tusername;
              res.render("home",{data:user_val});
                }
             
              else{
                res.render("login",{data:"Wrong Password"})
              }
            }
              })
    
    
            }
    
         else{
           res.render("login",{data:"No User Found"})
           }
         }catch(err){
            console.log(err);
        }
})
app.get("/update",(req,res)=>{
    res.render("update",{data:user_val});
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
    bcrypt.hash(password,saltRounds,async(err,hash)=>{
        if(err){
            console.log("Error while hashing:",err);
        }
        else{
        await db.query(
            "INSERT INTO users (tusername,tpassword,email) VALUES ($1,$2,$3)",
            [username,hash,email]
        );
        user=username;
        res.redirect("/register");
        }
    })
   
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
        let log_user=0;
        const result= await db.query(
            "SELECT * FROM users WHERE tusername=$1",
            [user]
        );
        const log=await db.query(
            "SELECT * FROM workout WHERE username=$1",
            [user]
        );
        if(log.rows.length>0){
            log_user=log;
        }
        else{
            log_user=0;
        }
        var status,range;
        const x=result.rows[0].bmi;
        if(x<18.5){
            status="You are currently Underage";
            range="0-18.5"
        }
        else if(x>=18.5 && x<24.9){
            status="You are Healthy";
            range="18.5-24.9"
        }
        else if(x>=25 && x<29.9){
            status="You are currently Overage";
            range="25-29.9"
        }
        else if(x>=30){
            status="You have obesity";
            range="30 or higher"
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
    res.render("user",{data:data,log:log_user});
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
app.get("/addlog",async(req,res)=>{
    try{
        const options = {
            method: 'GET',
            url: 'https://api.api-ninjas.com/v1/caloriesburnedactivities',
            headers: {
                'X-API-Key': 'tRtAPplmWukhtiPoolga5Q==5p7NOagUHP5IloQa'
            }
          };
        const response = await axios.request(options);
        const result=response.data;
        res.render("addlog2",{act:result,data:user_val})
    }
    catch(err){
        console.log(err);
        res.send("<h1>Error connecting to API</h1>")
    }
})
app.post("/addlog",async (req,res)=>{
    const username=user_val;
    const dur= req.body.duration;
    const user_activity=req.body.activity;
    let date=req.body.date;
    let cal;
    try{
        if(user_activity!="Weight_Lifting"){
            const options1= {
                method: 'GET',
                url: 'https://api.api-ninjas.com/v1/caloriesburned?activity='+user_activity,
                headers: {
                    'X-API-Key': 'tRtAPplmWukhtiPoolga5Q==5p7NOagUHP5IloQa'
                }
              };
            const response = await axios.request(options1);
            const result=response.data;
            cal=(result[0].calories_per_hour)*(dur/60);
        }
        else{
            cal=0
        }
    await db.query( 
        "INSERT INTO workout(username,duration,activity,date,cal) VALUES ($1,$2,$3,$4,$5)",
        [username,dur,user_activity,date,cal]  
    );
    res.redirect("/user");
    }  
    catch(err){
        console.log(err);
        res.send("<h1>Error connecting to database</h1>")
    }
})


// app.post("/remove",async(req,res)=>{
//     // const resul2 =await db.query(
//     //         "SELECT * FROM workout WHERE username=user",
//     //         [user]
//     //     )
//         const workout_id=resul.rows[0].workout_id;
//        await db.query(
//          "DELETE FROM workout WHERE workout_id=$1",
// [workout_id]
//        )
//        res.render("user",{data:resul});
// })

app.get("/contact",(req,res)=>{
    res.render("contact",{data:user_val});
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