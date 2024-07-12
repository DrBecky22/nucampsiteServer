const express = require('express');
const Campsite = require('../models/campsite');
const campsiteRouter = express.Router();
const authenticate = require('../authenticate');


////////////////////////////////////////////
////  Campsite Routes
////////////////////////////////////////////

campsiteRouter.route('/')
    .get((req, res, next) => {
        Campsite.find()
            .populate('comments.author')
            .then(campsites => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsites);
            })
            .catch(err => {
                next(err);
            });
    })
    .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Campsite.create(req.body)
            .then(campsite => {
                console.log('Campsite Created ', campsite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite);
            })
            .catch(err => {
                next(err);
            });
    })
    .put(authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
////////// NOTE: If you don't use res.send() or set the content type with a default ".all()" route, you need to set the header.
        res.setHeader('Content-Type', 'text/plain');
////////// END NOTE
        res.end('PUT operation not supported on /campsites');
    })
    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Campsite.deleteMany()
            .then(response => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);
            })
            .catch(err => {
                next(err);
            });
    });

////////////////////////////////////////////
////  Individual Campsite Routes
////////////////////////////////////////////
campsiteRouter.route('/:campsiteId')
    .get((req, res, next) => {
        Campsite.findById(req.params.campsiteId)
            .populate('comments.author')
            .then(campsite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite);
            })
            .catch(err => next(err));
    })
    .post(authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
////////// NOTE: If you don't use res.send() or set the content type with a default ".all()" route, you need to set the header.
        res.setHeader('Content-Type', 'text/plain');
////////// END NOTE
        res.end(`POST operation not supported on /campsites/${req.params.campsiteId}`);
    })
    .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Campsite.findByIdAndUpdate(req.params.campsiteId, {
            $set: req.body
        }, { new: true })
            .then(campsite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite);
            })
            .catch(err => next(err));
    })
    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Campsite.findByIdAndDelete(req.params.campsiteId)
            .then(response => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);
            })
            .catch(err => next(err));
    });

////////////////////////////////////////////
////  Campsite Comments Routes
////////////////////////////////////////////

campsiteRouter.route('/:campsiteId/comments')
    .get((req, res, next) => {
        Campsite.findById(req.params.campsiteId)
            .populate('comments.author')
            .then(campsite => {
                if (campsite) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(campsite.comments);
                } else {
                    err = new Error(`Campsite ${req.params.campsiteId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        Campsite.findById(req.params.campsiteId)
            .then(campsite => {
                if (campsite) {
                    req.body.author = req.user._id; //adds the user id to the comment before it gets pushed to the array
                    campsite.comments.push(req.body);
                    campsite.save()
                        .then(campsite => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(campsite);
                        })
                        .catch(err => next(err));
                } else {
                    err = new Error(`Campsite ${req.params.campsiteId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    })
    .put(authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
////////// NOTE: If you don't use res.send() or set the content type with a default ".all()" route, you need to set the header.
        res.setHeader('Content-Type', 'text/plain');
////////// END NOTE
        res.end(`PUT operation not supported on /campsites/${req.params.campsiteId}/comments`);
    })
    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Campsite.findById(req.params.campsiteId)
            .then(campsite => {
                if (campsite) {
                    for (let i = (campsite.comments.length - 1); i >= 0; i--) {
                        campsite.comments.id(campsite.comments[i]._id).deleteOne();
                    }
                    campsite.save()
                        .then(campsite => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(campsite);
                        })
                        .catch(err => next(err));
                } else {
                    err = new Error(`Campsite ${req.params.campsiteId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    });


////////////////////////////////////////////        
////  Individual Campsite Comment Routes
////////////////////////////////////////////

campsiteRouter.route('/:campsiteId/comments/:commentId')
    .get((req, res, next) => {
        Campsite.findById(req.params.campsiteId)
            .populate('comments.author')
            .then(campsite => {
                if (campsite && campsite.comments.id(req.params.commentId)) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(campsite.comments.id(req.params.commentId));
                } else if (!campsite) {
                    err = new Error(`Campsite ${req.params.campsiteId} not found`);
                    err.status = 404;
                    return next(err);
                } else {
                    err = new Error(`Comment ${req.params.commentId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    })

    .post(authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
////////// NOTE: If you don't use res.send() or set the content type with a default ".all()" route, you need to set the header.
        res.setHeader('Content-Type', 'text/plain');
////////// END NOTE
        res.end(`POST operation not supported on /campsites/${req.params.campsiteId}/comments/${req.params.commentId}`);
    })

    .put(authenticate.verifyUser, (req, res, next) => {
        Campsite.findById(req.params.campsiteId)
            .then(campsite => {
////////// FIX 1: Read csarefully. You have "campsites" (plural). That is undefined. Our current document is called "campsite" (singular).
// OLD CODE:                const comment = campsites.comments.id(req.params.commentId);   //this isolates the comment that the user is trying to edit
                const comment = campsite.comments.id(req.params.commentId);
////////// END FIX 1
                if (campsite && comment) {                   //this checks if the campsite and comment exist
                    if (req.user._id.equals(comment.author._id)) {   //this is the line that checks if the comment author matches the logged in user
                        if (req.body.rating) {
                            campsite.comments.id(req.params.commentId).rating = req.body.rating;
                        }
                        if (req.body.text) {
                            campsite.comments.id(req.params.commentId).text = req.body.text;
                        }
                        campsite.save()
                            .then(campsite => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(campsite);
                            })
                            .catch(err => next(err));
////////// FIX 2: Let's rearrange your else's to respond specifically to three situations: 1) the campsite document is not found; 2) the campsite is found, but the comment is not;
// and 3) both the campsite and comment are found, but the author does not match the logged in user ID.
// OLD CODE:
/*
                    } else if (!campsite) {
                        err = new Error(`You are not authorized to edit this comment`);
                        err.status = 403;
                        return next(err);
                        //seem like this line should have curly bracer and parenthesis, but that breaks it more
                    } else if (!campsite) {
                        err = new Error(`Campsite ${req.params.campsiteId} not found`);
                        err.status = 404;
                        return next(err);
                    } else {
                        err = new Error(`Comment ${req.params.commentId} not found`);
                        err.status = 404;
                        return next(err);
                    }
*/
                    } else {
                        err = new Error(`You are not authorized to edit this comment`);
                        err.status = 403;
                        return next(err);
                    }
                } else if (!campsite) {
                    err = new Error(`Campsite ${req.params.campsiteId} not found`);
                    err.status = 404;
                    return next(err);
                } else {
                    err = new Error(`Comment ${req.params.commentId} not found`);
                    err.status = 404;
                    return next(err);
                }
////////// END FIX 2
            })
            .catch(err => next(err));
    })

    .delete(authenticate.verifyUser, (req, res, next) => {
        Campsite.findById(req.params.campsiteId)
            .then(campsite => {
////////// FIX 3: Again, you have "campsites" (plural). That is undefined. Our current document is called "campsite" (singular).
// OLD CODE:                const comment = campsites.comments.id(req.params.commentId);   //this isolates the comment that the user is trying to edit
                const comment = campsite.comments.id(req.params.commentId);
////////// END FIX 3
                if (campsite && comment) {
                    if (req.user._id.equals(comment.author._id)) {
                          comment.deleteOne();

                        campsite.save()
                            .then(campsite => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(campsite);
                            })
                            .catch(err => next(err));
////////// FIX 4: Let's rearrange your else's to respond specifically to three situations: 1) the campsite document is not found; 2) the campsite is found, but the comment is not;
// and 3) both the campsite and comment are found, but the author does not match the logged in user ID.
// OLD CODE:
/*
                    } else if (!campsite) {
                        err = new Error(`You are not authorized to edit this comment`);
                        err.status = 403;
                        return next(err);
                    } else if (!campsite) {
                        err = new Error(`Campsite ${req.params.campsiteId} not found`);
                        err.status = 404;
                        return next(err);

                    } else {
                        err = new Error(`Comment ${req.params.commentId} not found`);
                        err.status = 404;
                        return next(err);
                    }
*/
                    } else {
                        err = new Error(`You are not authorized to edit this comment`);
                        err.status = 403;
                        return next(err);
                    }
                } else if (!campsite) {
                    err = new Error(`Campsite ${req.params.campsiteId} not found`);
                    err.status = 404;
                    return next(err);
                } else {
                    err = new Error(`Comment ${req.params.commentId} not found`);
                    err.status = 404;
                    return next(err);
                }
////////// END FIX 4
            })
            .catch(err => next(err));
    });

module.exports = campsiteRouter;