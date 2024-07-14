const express = require('express');
const authenticate = require('../authenticate');
const cors = require('./cors');
const Favorite = require('../models/favorite');

const favoriteRouter = express.Router();

////////////////////////////////////////////
////  Favorite Routes
////////////////////////////////////////////
favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))   // preflight request
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({user: req.user._id})
    .populate('user')
    .populate('campsites')
    .then(favorites => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {  // only logged in users can add a favorite  
    Favorite.findOne({user: req.user._id})
    .then(favorite => {
        if (favorite) {
            req.body.forEach(fav => {
                if (!favorite.campsites.includes(fav._id)) {
                    favorite.campsites.push(fav._id);
                }
            });
            favorite.save()  // using the word save b/c we are using mongoose, if we were't it would be update or updateOne as a mongo method
            .then(favorite => {  //can use any word to represent the new array of saved favorites
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);  //use whatever word you used in the .then callback function originator
            })
            .catch(err => next(err));
        } else {
            Favorite.create({user: req.user._id, campsites: req.body.map(favorite => favorite._id)})  //this is the first time the user is adding a favorite, and the curly bracers are around the key/values of oject that is being created
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch(err => next(err));
        }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => { // PUT operation not supported - would be OK to skip the cors and authenticate middleware here, and would probs be more polite        
    res.statusCode = 403;
    res.send('PUT operation not supported on /favorites');  //skipped setting the header by using .send - which has implicit headers
}
)
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {    
    Favorite.findOneAndDelete({user: req.user._id})
    .then(response => {
        res.statusCode = 200;
        if (response) {
            res.setHeader('Content-Type', 'application/json');
            res.json(response);
        } else {
            res.setHeader('Content-Type', 'text/plain');
            res.end('You do not have any favorites to delete.');
        }
    })
    .catch(err => next(err));
}
);


////////////////////////////////////////////
////  Individual Favorite Routes
////////////////////////////////////////////
favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))   // preflight request
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {   // GET operation not supported
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    res.end(`GET operation not supported on /favorites/${req.params.campsiteId}`);  //params is used when the information comes as part of the route (instead of the body)
})      
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => { 
    Favorite.findOne({user: req.user._id})
    .then(favorite => {
        if (favorite) {
            if (!favorite.campsites.includes(req.params.campsiteId)) {
                favorite.campsites.push(req.params.campsiteId);
                favorite.save()
                .then(favorite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
                .catch(err => next(err));
            } else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/plain');
                res.end('That campsite is already a favorite!');
            }
        } else {
            Favorite.create({user: req.user._id, campsites: [req.params.campsiteId]})
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch(err => next(err));
        }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    res.end(`POST operation not supported on /favorites/${req.params.campsiteId}`);
})

.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
    .then(favorite => {
        if (favorite) {
            const index = favorite.campsites.indexOf(req.params.campsiteId);
            if (index >= 0) {
                favorite.campsites.splice(index, 1);
                favorite.save()
                .then(favorite => {
                    Favorite.findById(favorite._id)
                    .populate('user')
                    .populate('campsites')
                    .then(favorite => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    });
                })
                .catch(err => next(err));
            } else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/plain');
                res.end('That campsite is not a favorite!');
            }
        } else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.end('No favorites to delete.');
        }
    })
    .catch(err => next(err));
});

module.exports = favoriteRouter;