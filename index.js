var express = require("express")
var bodyParser = require("body-parser")
var mongoose = require("mongoose")

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
        required: [true,'Please Insert name'],
        unique:true
        // validate:[]
    },
    email: {
        type: String,
        required: true
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



mongoose.connect('mongodb://localhost:27017/mydata',{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

var registers = new mongoose.model("Users", employeeschema);
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

    employeeschema.path('name').validate(async(name)=>{
        const emailcount=await mongoose.models.Users.countDocuments({name})
        return !emailcount;
      },'Email already exists')
      
   

       res.render('signup_success.ejs')
      db.collection('users').insertOne(data,(err,collection)=>{
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
    res.send("Invalid Email");
}



})


app.get("/",(req,res)=>{
    res.set({
        "Allow-access-Allow-Origin": '*'
    })
    return res.render('index.ejs');
}).listen(3000);


console.log("Listening on PORT 3000");