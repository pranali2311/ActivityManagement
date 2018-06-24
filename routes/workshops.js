const express = require('express');
const router = express.Router();
const crypto = require('crypto');  //generate file names
const multer = require('multer');
const Grid = require('gridfs-stream');
const GridFsStorage = require('multer-gridfs-storage');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const path1 = require('path');

//Bring in Workshop Model
let Workshop = require('../models/workshop');

//Bring in User Model
let User = require('../models/user');

//Create Storage Engine
const storage = new GridFsStorage({
    url: 'mongodb://127.0.0.1/portal',
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path1.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads'
                };
                resolve(fileInfo);
            });
        });
    }
});
const upload = multer({ storage: storage });

//Summary Route
router.get('/summary',ensureAuthenticated,function (req,res) {
    Workshop.find({},function (err, workshops) {
        if(err){
            console.log(err);
        }
        else{
            res.render('summary',{
                workshops: workshops
            });
        }
    });
});


//Add Route
router.get('/upload',ensureAuthenticated,function (req,res) {
   res.render('workshop_details');
});


//Add SUBMIT Post Route
router.post('/upload',upload.single('file'),function (req,res) {

    //console.log(req.file);

    req.checkBody('wname','Workshop name required').notEmpty();
    req.checkBody('sdate','Start date required').notEmpty();
    req.checkBody('cdate','Conclusion date required').notEmpty();
    req.checkBody('team','Team members required').notEmpty();
    req.checkBody('body','Details are required').notEmpty();
    //req.checkBody('file','File has to entered').notEmpty();

    //Get Errors
    let errors = req.validationErrors();

    if(errors){
        res.render('workshop_details',{
            errors: errors
        });
    }else{
        let workshop = new Workshop();
        workshop.wname = req.body.wname;
        workshop.sdate = req.body.sdate;
        workshop.cdate = req.body.cdate;
        workshop.team = req.body.team;
        workshop.body = req.body.body;
        workshop.file = req.file.filename;

        workshop.save(function (err) {
           if(err){
               console.log(err);
               return;
           }else{
               req.flash('success','Entry saved');
               res.redirect('/workshops/summary');
           }
        });
    }
});


//Get Single Workshop Detail
router.get('/:id',function (req,res) {
    Workshop.findById(req.params.id, function (err,workshop) {
            res.render('details',{
                workshop: workshop,
            });
        //console.log(article);
        //return;
    });
});

//Acess Control
function ensureAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }else{
        req.flash('danger', 'Please Log in');
        res.redirect('/users/login');
    }
}


module.exports = router;