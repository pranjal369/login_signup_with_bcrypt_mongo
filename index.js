var express = require("express")
var bodyParser = require("body-parser")
var mongoose = require("mongoose")
var bcrypt=require("bcrypt");
const app = express()

app.use(bodyParser.json())


// app.use(express.static('public'))
app.use(express.json())
app.use(bodyParser.urlencoded({
    extended:false
}))

app.set('view-engine','ejs');

const employeeschema = new mongoose.Schema({
    name: {
        type: String,
        required: true
        // unique:true
        // validate:[]
    },
    email: {
        type: String,
        required: true,
        unique:true
    },
    phno:{
        type:Number,
        required:true
    },
    password: {
        type: String,
        required: true
    },
    cpassword: {
        type: String,
        required: true
    }
})


// for hashing...
employeeschema.pre("save",async function(next){
    // if(this.password && this.isModified('password'))
    // {
    //      bcrypt.hash(this.password,10,(err,hashed)=>{
    //          if(err) return next(err);
    //          this.password=hashed;
    //          next();
    //      });
        
    // }
    // else

    if(this.isModified("password"))
    {
        // const password_hash=await bcrypt.hash(this.password,10);
        console.log(`current password is ${this.password}`);
        this.password=await bcrypt.hash(this.password,10);
        console.log(`after hashing password is ${this.password}`);
        this.cpassword=undefined;
        next();

    }
    else
    {
        next();
    }

});

mongoose.connect('mongodb://localhost:27017/mydata',{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

var registers = new mongoose.model("Users4", employeeschema);
const { json }=require("express")
var db = mongoose.connection;

db.on('error',()=>console.log("Error in Connecting to Database"));
db.once('open',()=>console.log("Connected to Database"))

app.post("/sign_up",async(req,res)=>{
   try{
    var name = req.body.name;
    var email = req.body.email;
    var phno = req.body.phno;
    var password = req.body.password;
    var cpassword=req.body.cpassword;

    if (password === cpassword) {
            
        const regemployee = new registers({
            name: req.body.name,
            email: req.body.email,
            phno:req.body.phno,
            password:req.body.password,
            cpassword: req.body.cpassword
        })
      const registered= await regemployee.save();
    //   res.status(201).render("index");

    // employeeschema.path('name').validate(async(name)=>{
    //     const emailcount=await mongoose.models.Users.countDocuments({name})
    //     return !emailcount;
    //   },'Email already exists')
      
   

       res.render('signup_success.ejs')
      db.collection('Users4').insertOne(data,(err,collection)=>{
          if(err){
              throw err;
          }
          console.log("Record Inserted Successfully");
      });
      

    } else {
        res.send("Password not matched")
    }

    console.log(`name is ${name}, E-mail is: ${email} and pasword is ${password}`)
} catch (err) {
    res.send("Name Already Exists");
}



})

// learning hashing...

// const secure_password=async(password)=>{
//     const password_hash=await bcrypt.hash(password,10);
//     console.log(password_hash);

//     const password_match=await bcrypt.compare(password,password_hash);
//     console.log(password_match);
// }

// secure_password("pranjal@27");


app.get('/login',(req,res)=>{
    res.render("login.ejs");
})
app.get('/register',(req,res)=>{
    res.render("index.ejs");
})

app.post('/login',async(req,res)=>{
    try{
        const email=req.body.email;
        const password=req.body.password;
        
        // console.log(` E-mail is: ${email} and pasword is ${password}`)
        const user_email = await registers.findOne({email:email});
        // res.send(user_email)
        // console.log(user_email)
        // we arew checking if our db password matching toour typed password by user...
        const is_match= await bcrypt.compare(password,user_email.password);

        // if(user_email.password===password)
        // {
        //     res.status(201).render('home.ejs');

        // } 

        if(is_match)
        {
            res.status(201).render('home.ejs');

        } 
        else{
            res.send("Password not matching to the DataBase");
        }
    }
    catch(error){
        res.status(400).send("Email is Invalid");
    }
})


app.get('/logout',(req,res)=>{
    console.log("Log Out Successfully");
    res.render("login.ejs")
})

app.get("/",(req,res)=>{
    res.set({
        "Allow-access-Allow-Origin": '*'
    })
    return res.render('index.ejs');
}).listen(3000);


console.log("Listening on PORT 3000"); 
