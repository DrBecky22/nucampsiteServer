const express = require('express');
const Promotion = require('../models/promotion');
////////// NOTE: Your code works, but for making sense of what this router deals with, I would recommend changing every instance of
// "campsiteRouter" to "promotionRouter".
const campsiteRouter = express.Router();
const authenticate = require('../authenticate');


////////////////////////////////////////////
////  Promotion Routes
////////////////////////////////////////////

campsiteRouter.route('/')
.get((req, res, next) => {
    Promotion.find()
    .then(promotions => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotions);
    })
    .catch(err => next(err));
})
////////// FIX 1: The POST endpoint on this route should be limited to admins only.
// OLD CODE:    .post(authenticate.verifyUser, (req, res, next) => {
.post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
////////// END FIX 1
    Promotion.create(req.body)
    .then(promotion => {
        console.log('Promotion Created ', promotion);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotion);
    })
    .catch(err => next(err));
})
.put(authenticate.verifyUser, (req, res) => {    
    res.statusCode = 403;
////////// NOTE: If you don't use res.send() or set the content type with a default ".all()" route, you need to set the header.
    res.setHeader('Content-Type', 'text/plain');
////////// END NOTE
    res.end('PUT operation not supported on /promotions');
})
////////// FIX 2: The DELETE endpoint on this route should be limited to admins only.
// OLD CODE:    .delete(authenticate.verifyUser, (req, res, next) => {
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
////////// END FIX 2
    Promotion.deleteMany()
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

////////////////////////////////////////////
////  Individual Promotion Routes
////////////////////////////////////////////

campsiteRouter.route('/:promotionId')
.get((req, res, next) => {
    Promotion.findById(req.params.promotionId)
    .then(promotion => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotion);
    })
    .catch(err => next(err));
})      

.post(authenticate.verifyUser, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
////////// NOTE: If you don't use res.send() or set the content type with a default ".all()" route, you need to set the header.
    res.setHeader('Content-Type', 'text/plain');
////////// END NOTE
    res.end(`POST operation not supported on /promotions/${req.params.promotionId}`);
})  
////////// FIX 3: The PUT endpoint on this route should be limited to admins only.
// OLD CODE:    .put(authenticate.verifyUser, (req, res, next) => {
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
////////// END FIX 3
    Promotion.findByIdAndUpdate(req.params.promotionId, {
        $set: req.body
    }, { new: true })
    .then(promotion => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotion);
    })
    .catch(err => next(err));
})

.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {   
    Promotion.findByIdAndDelete(req.params.promotionId)
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

module.exports = campsiteRouter;