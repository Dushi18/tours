const express = require('express');
const app = express();
const path = require('path');
const User = require('./models/userSchema');
const jwt = require('jsonwebtoken');
const hbs = require('hbs');
const fs = require('fs');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
dotenv.config({path: './src/config.env'});
const tourData = fs.readFileSync("./src/tours.json");
const tours = JSON.parse(tourData);



// const exphbs = require('express-handlebars');
require('./db/conn.js');
const port = process.env.PORT||3000;
// console.log(process.env.PORT);

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const staticpath = path.join(__dirname, "../public/");
// const templatepath = path.join(__dirname, "../templates/");
// const partialpath = path.join(__dirname, "../templates/partials")

app.set('view engine', 'ejs');
// app.set('views', templatepath);
// console.log(staticpath);
const signToken = id=>{
    return jwt.sign({id: id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRATION});
}
// console.log(app.get('env'));
// console.log(process.env.JWT_SECRET);
app.use(express.static(staticpath));
app.use(express.urlencoded({extended:false}));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
// hbs.registerPartials(partialpath);

app.get('/', (req, res) => {
    res.render('index');
});
app.post('/signup',async (req,res) =>{
        try {
            // res.send(req.body);
            const userData = new User(req.body);
            await userData.save();
            console.log(userData.id);
            const token = signToken(userData.id);
            console.log(token);
            res.status(201).send(`<h1> User saved successfully</h1> \n<a href= './'>Click here to go back...</a> `);
        } catch (error) {
            res.status(500).send(error);            
        }
});
// const loggedIn = false;
app.post('/login', async(req,res,next)=>{
    const {email, password} = req.body;
    console.log(req.body);
    console.log(`${email} ${password}`);

    if(!email || !password) {
        return next(new Error('Please provie an email and password'));
    }
    const user = await User.findOne({email: email}).select('+password');
    console.log(user);
    if(!user||!(await user.correctPassword(password, user.password))) {
        return res.status(200).sendFile(path.join(__dirname, '../public/error_login.html'));
        // return next(new Error('Invalid EMAIL or PASSWORD'));
    };
    // loggedIn = true;
    const token = signToken(user.id);
    res.status(200).sendFile(path.join(__dirname, '../public/home.html'));
    // res.status(200).render('home.html');
    // res.status(200).send(`<b>Welcome! ${user.name} , email ${user.email}</b> \n <h1> You are successfully logged in</h1>\n <a href= './'>Click here to go back...</a> `);

});

app.get('/login/tour/:id', (req, res) => {
    const tourId = req.params.id*1;
    const tour = tours.find(el=>el.id===tourId);
    // console.log(tour);
    // res.status(200).json({
    //     status: "success",
    //     data: {
    //         tour: tour
    //     }
    // })
    res.status(200).render('tours', {
        id : tour.id,
        name: tour.tour_name,
        src: tour.src,
        location: tour.location,
        duration: tour.duration,
        ratings: tour.ratings,
        description: tour.description,
        price: tour.price
        });
});
app.get('/login/tour/:id/payment', (req, res)=>{
    const tourId = req.params.id*1;
    const tour = tours.find(el=>el.id===tourId);
    // console.log(tour);
    res.status(200).render('pay', {
        id : tour.id,
        name: tour.tour_name,
        src: tour.src,
        location: tour.location,
        duration: tour.duration,
        ratings: tour.ratings,
        description: tour.description,
        price: tour.price
    });
})
app.post('/login/tour/:id/payment/res', (req, res)=>{
    stripe.customers.create({
        fullName : req.body.fullName,
        source: req.body.stripeToken
    })
    .then((customer)=>{
        return stripe.charges.create({
            amount: 7000,
            description:'develeopment product',
            currency: 'INR',
            customer: customer.id
        })
    })
    .then((charge)=>{
        console.log(charge);
        res.send("success");
    })
    .catch((err)=>{
        res.send(err);
    })
})
app.listen(port, ()=>{
    console.log(`listening at port ${port}`);
});