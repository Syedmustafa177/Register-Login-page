//jshint esversion:6
require('dotenv').config()

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const ejs = require('ejs');
const path = require('path');
const encrypt = require('mongoose-encryption');




const app = express();


// Set the view engine to EJS
app.set('view engine', 'ejs');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/userDB');


const userSchema = new mongoose.Schema( {
    email : String,
    password : String
}) ;

console.log(process.env.API_KEY)


userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields:["password"] }); 

const User = new mongoose.model("user",userSchema); 








// Serve static files from the 'public' directory (if needed)
app.use(express.static(path.join(__dirname, 'public')));

// Use bodyParser for parsing form data
app.use(bodyParser.urlencoded({ extended: true }));

// Define a route for the homepage
app.get('/', (req, res) => {
    res.render("home")
});

app.get('/login', (req, res) => {
    res.render("login")
});


app.get('/register', (req, res) => {
    res.render("register")
});


app.post('/register',(req,res) =>{
    const newuser = new User({
        email : req.body.username,
        password : req.body.password
    }) ;

    newuser.save()
    .then(() => {
        console.log("Good news!! Added a new user");
        res.render("secrets");
    })
    .catch((err) => {
        console.error(err);

    });
})





app.post('/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    try {
        const foundUser = await User.findOne({ email: username }).exec();

        if (foundUser) {
            if (foundUser.password === password) {
                res.render("secrets");
            } else {
                res.send("Invalid password");
            }
        } else {
            res.send("User not found");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred while fetching user');
    }
});






// Start the server on port 3000
app.listen(3000, () => {
    console.log('Server Started on port 3000');
});