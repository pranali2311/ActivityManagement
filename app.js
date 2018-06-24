const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const session = require('express-session');
const flash = require('connect-flash');
const config= require('./config/database');
const passport = require('passport');
const Grid = require('gridfs-stream');

mongoose.connect(config.database);
let db = mongoose.connection;

let gfs;

//check connection
db.once('open',function () {
    //Init Stream
    gfs = Grid(db.db,mongoose.mongo);
    gfs.collection('uploads');
   console.log('Connected to  MongoDB');
});

//check for db errors
db.on('errors',function (err) {
    console.log(err);
});

//Init App
const app = express();

//Load view engine

app.set('views',path.join(__dirname,'views'));
app.set('view engine','pug');

app.use(bodyParser.urlencoded({extended: false}));

app.use(bodyParser.json());

//app.use(methodOverride('_method'));

//Set Public Folder
app.use(express.static(path.join(__dirname,'public')));

//Express Session Middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
    //cookie: { secure: true }
}));

//Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

//Express-Validator Middleware
app.use(expressValidator({
    errorFormatter: function(param,msg,value){
        var namespace = param.split('.')
            , root = namespace.shift()
            , formParam = root;

        while (namespace.length){
            formParam += '[' + namespace.shift() + ']';
        }
        return{
            param : formParam,
            msg : msg,
            value : value
        };
    }
}));

//Passport Config
require('./config/passport')(passport);

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());


//Global Variable for logout
app.get('*',function (req,res,next) {
    res.locals.user = req.user || null;
    next();  //Calls the next route
});




//Home Route
app.get('/',function (req,res) {
   res.render('home');
});

//Route Files
let users = require('./routes/users');
app.use('/users',users);
let workshops = require('./routes/workshops');
app.use('/workshops',workshops);

//Start Server
app.listen('5000',function () {
    console.log('Server started on port 5000');
});