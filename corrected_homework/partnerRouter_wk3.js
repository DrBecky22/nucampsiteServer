const express = require('express');
const Partner = require('../models/partner');
const partnerRouter = express.Router();
const authenticate = require('../authenticate');


////////////////////////////////////////////
////  Partner Routes    
////////////////////////////////////////////

partnerRouter.route('/')
.get((req, res, next) => {
    Partner.find()
    .then(partners => {
    res.statusCode = 200;
////////// NOTE: Wrong content type.
// OLD CODE:    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Type', 'application/json');
////////// END NOTE
    res.json(partners);
})
.catch(err => next(err));
})

.post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Partner.create(req.body)
    .then(partner => {
        console.log('Partner Created ', partner);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(partner);
    })
    .catch(err => next(err));
})

.put(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
////////// NOTE: If you don't use res.send() or set the content type with a default ".all()" route, you need to set the header.
    res.setHeader('Content-Type', 'text/plain');
////////// END NOTE
    res.end('PUT operation not supported on /partners');
})


.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Partner.deleteMany()
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

////////////////////////////////////////////
////  Individual Partner Routes
////////////////////////////////////////////

partnerRouter.route('/:partnerId')
.get((req, res, next) => {
    Partner.findById(req.params.partnerId)
    .then(partner => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(partner);
    })
    .catch(err => next(err));
})      

.post(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
////////// NOTE: If you don't use res.send() or set the content type with a default ".all()" route, you need to set the header.
    res.setHeader('Content-Type', 'text/plain');
////////// END NOTE
    res.end(`POST operation not supported on /partners/${req.params.partnerId}`);
})  

.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Partner.findByIdAndUpdate(req.params.partnerId, {
        $set: req.body
    }, { new: true })
    .then(partner => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(partner);
    })
    .catch(err => next(err));
})  

.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Partner.findByIdAndDelete(req.params.partnerId)
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

module.exports = partnerRouter;