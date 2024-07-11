////This file handles the uploads endpoint of the REST API. It uses the multer Node module to handle file uploads. Multer is a middleware for handling multipart/form-data, which is primarily used for uploading files. It is written on top of busboy for maximum

////  Imports ///////
const express = require('express');
const authenticate = require('../authenticate');
const multer = require('multer');
const cors = require('./cors');

//// customizes the storage engine ////
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
});

//// customizes the file filter - to only accept image file types ////
const imageFileFilter = (req, file, cb) => {
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('You can upload only image files!'), false);
    }
    cb(null, true);
};

//// calls the multer function with the storage and file filter options ////
const upload = multer({ storage: storage, fileFilter: imageFileFilter});

//// this line sets up the router - why does this not go above all teh customization?////
const uploadRouter = express.Router();


//// below configures this upload router to handle the various http requests - why do we need to verify user/admin to fire off error messages? ////
uploadRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /imageUpload');
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, upload.single('imageFile'), (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(req.file);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /imageUpload');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end('DELETE operation not supported on /imageUpload');
});

module.exports = uploadRouter;