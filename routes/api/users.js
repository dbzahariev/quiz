const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const keys = require('../../config/keys');

const validateRegisterInput = require('../../utils/validation/register');
const validateLoginInput = require('../../utils/validation/login');
const validateChangePasswordInput = require('../../utils/validation/changePassword');
const validateUpdateDataInput = require('../../utils/validation/updateData');

const User = require('../../models/User');
const Profile = require('../../models/Profile');

const router = express.Router();

// Register new user
// @route POST /api/users/register
// @desc register user
// @access Public
router.post('/register', (req, res) => {
    const { errors, isValid } = validateRegisterInput(req.body);

    if (!isValid) {
        return res.status(400).json(errors);
    }

    User.findOne({ username: req.body.username })
        .then(returnedUser => {
            if (returnedUser) {
                errors.username = 'Username already exists!';
                return res.status(406).json(errors);
            }
            User.findOne({ email: req.body.email })
                .then(user => {
                    if (user) {
                        errors.email = 'Email already exists!';
                        return res.status(406).json(errors);
                    } 

                    const userData = new User({
                        firstName: req.body.firstName.toUpperCase(),
                        lastName: req.body.lastName.toUpperCase(),
                        username: req.body.username,
                        email: req.body.email.toLowerCase(),
                        password: req.body.password
                    });
                
                    bcrypt.genSalt(10, (err, salt) => {
                        if (err) {
                            return console.log(err);
                        }
                
                        bcrypt.hash(userData.password, salt, (err, hash) => {
                            if (err) {
                                return console.log(err);
                            }
                            userData.password = hash;
                            userData.save()
                                .then(savedUser => {
                                    const userProfile = new Profile({
                                        user: savedUser.id
                                    });
                                    userProfile.save()
                                        .then(profile => {
                                            res.json({ message: 'Registration Successful!' });
                                        })
                                        .catch(err => console.log(err));
                                })
                                .catch(err => console.log(err));
                        });
                    });
                })
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
});

// Login user
// @route POST /api/users/login /Returmn JWT token
// @desc login user
// @access Private
router.post('/login', (req, res) => {
    const { errors, isValid } = validateLoginInput(req.body);

    if (!isValid) {
        return res.status(400).json(errors);
    }

    const username = req.body.username;
    const password = req.body.password;

    User.findOne({ username })
        .then(user => {
            if (!user) {
                errors.username = 'User not found!';
                res.status(404).json(errors);
            }

            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if (isMatch) {
                        Profile.findOne({ user: user.id })
                            .then(profile => {
                                const payload = {
                                    id: user.id,
                                    firstName: user.firstName,
                                    lastName: user.lastName,
                                    username: user.username,
                                    email: user.email,
                                    dateCreated: user.dateCreated,
                                    lastSeen: user.lastSeen,
                                    phone: user.phone,
                                    balance: profile.balance,
                                    totalEarnings: profile.totalEarnings,
                                    gamesPlayed: profile.gamesPlayed,
                                    rank: profile.rank,
                                    rankPercentage: profile.rankPercentage,
                                    wins: profile.wins,
                                    losses: profile.losses,
                                    bank: profile.bank,
                                    accountName: profile.accountName,
                                    accountNumber: profile.accountNumber,
                                    cardNumber: profile.cardNumber,
                                    cardName: profile.cardName,
                                    cvv: profile.cvv,
                                    cardExp: profile.cardExp

                                }; // JWT Payload
        
                                // Sign the token
                                jwt.sign(payload, keys.secretOrKey, { expiresIn: '30 days' }, (err, token) => {
                                    res.json({
                                        success: true,
                                        token: `Bearer ${token}`
                                    });
                                });
                            })
                            .catch(err => console.log(err));
                    } else {
                        errors.password = 'Password incorrect!';
                        return res.status(401).json(errors)
                    }
                })
                .catch(err => console.log(err));
        })
        .catch(err => {});
});

// Change password
// @route POST /api/users/changePassword
// @desc change user password
// @access Public
router.put('/changePassword', (req, res) => {
    const { errors, isValid } = validateChangePasswordInput(req.body);
    const { currentPassword, newPassword } = req.body;

    if (!isValid) {
        return res.status(400).json(errors);
    }

    User.findById(req.user.id)
        .then(user => {
            if (user) {
                bcrypt.compare(currentPassword, user.password)
                    .then(isMatch => {
                        if (isMatch) {
                            bcrypt.genSalt(10, (err, salt) => {
                                if (err) {
                                    return console.log(err);
                                }
                        
                                bcrypt.hash(newPassword, salt, (err, hash) => {
                                    if (err) {
                                        return console.log(err);
                                    }
                                    bcrypt.compare(newPassword, user.password)
                                        .then(isMatch => {
                                            if (isMatch) {
                                                errors.newPassword = 'New password cannot be the same with the current password';
                                                return res.status(403).json(errors);
                                            } else {
                                                user.password = hash;
                                                user.save()
                                                    .then(() => res.json({ success: 'Password changed successfully!' }))
                                                    .catch(err => console.log(err));
                                            }
                                        })
                                        .catch(err => console.log(err));
                                });
                            });
                        } else {
                            errors.currentPassword = 'Incorrect Password!';
                            return res.status(401).json(errors);
                        }
                    })
                    .catch(err => console.log(err));
            } 
        })
        .catch(err => console.log(err));
});

// Update data
// @route PUT /api/users/updateData
// @desc update user data
// @access Private
router.put('/updateData', (req, res) => {
    console.log(req.user.id);
    const { errors, isValid } = validateUpdateDataInput(req.body);

    if (!isValid) {
        return res.status(400).json(errors);
    }

    const userData = {
        firstName: req.body.firstName.toUpperCase(),
        lastName: req.body.lastName.toUpperCase(),
        email: req.body.email.toLowerCase(), 
        phone: req.body.phone,
        password: req.body.password
    };

    User.findOne({ _id: req.user.id })
        .then(user => {
            if (user) {
                bcrypt.compare(req.body.password, user.password)
                    .then(isMatch => {
                        if (isMatch) {
                            user.firstName = userData.firstName;
                            user.lastName = userData.lastName;
                            user.email = userData.email;
                            user.phone = userData.phone
                            user.save()
                                .then(updatedUser => {
                                    Profile.findOne({ user: req.user.id })
                                        .then(profile => {
                                            const payload = {
                                                success: 'Update Successful',
                                                id: updatedUser.id,
                                                username: updatedUser.username,
                                                firstName: updatedUser.firstName,
                                                lastName: updatedUser.lastName,
                                                email: updatedUser.email,
                                                phone: updatedUser.phone,
                                                lastSeen: user.lastSeen,
                                                dateCreated: user.dateCreated,
                                                balance: profile.balance,
                                                totalEarnings: profile.totalEarnings,
                                                gamesPlayed: profile.gamesPlayed,
                                                rank: profile.rank,
                                                wins: profile.wins,
                                                losses: profile.losses,
                                                bank: profile.bank,
                                                accountName: profile.accountName,
                                                accountNumber: profile.accountNumber
                                            };
                                            jwt.sign(payload, keys.secretOrKey, { expiresIn: '30 days' }, (err, token) => {
                                                res.json({
                                                    ...payload,
                                                    token: `Bearer ${token}`
                                                });
                                            });
                                        })
                                        .catch(err => console.log(err))
                                })
                                .catch(err => console.log(err));
                        } else {
                            errors.password = 'Incorrect password!';
                            res.status(401).json(errors);
                        }
                    })
                    .catch(err => console.log(err));
            }
        })
        .catch(err => console.log(err));
});

// Gets quiz questions
// @route GET /api/users/quiz/category/:category
// @desc get questions by category
// @access Private
router.get('/quiz/category/:quizCategory', (req, res) => {
    Quiz.find({ type: req.params.quizCategory })
        .then(quizzes => res.json(quizzes))
        .catch(err => console.log(err));
});

// add user credit card
// @route POST /api/users/addCard
// @desc Add Credit card to user account
// @access Private
router.post('/addCard', (req, res) => {
    console.log('card request');
    console.log(req.user);
    Profile.findOne({ user: req.user._id })
        .then(profile => {
            if (!profile) {
                console.log('profile found ', profile);
                return res.status(404).json({ msg: 'No profile found!' });
            }
            profile.cardNumber = req.body.cardNumber;
            profile.cardName = req.body.cardName;
            profile.cvv = req.body.cvv;
            profile.cardExp = req.body.cardExp;
            profile.save()
                .then(profile => {
                    console.log('user ', req.user);
                    const payload = {
                        id: req.user.id,
                        username: req.user.username,
                        firstName: req.user.firstName,
                        lastName: req.user.lastName,
                        email: req.user.email,
                        phone: req.user.phone,
                        lastSeen: req.user.lastSeen,
                        dateCreated: req.user.dateCreated,
                        balance: profile.balance,
                        totalEarnings: profile.totalEarnings,
                        gamesPlayed: profile.gamesPlayed,
                        rank: profile.rank,
                        wins: profile.wins,
                        losses: profile.losses,
                        bank: profile.bank,
                        accountName: profile.accountName,
                        accountNumber: profile.accountNumber,
                        cardName: profile.cardName,
                        cardNumber: profile.cardNumber,
                        cvv: profile.cvv,
                        cardExp: profile.cardExp
                    };
                    jwt.sign(payload, keys.secretOrKey, { expiresIn: '30 days' }, (err, token) => {
                        res.json({
                            ...payload,
                            success: 'Card added Successfully',
                            token: `Bearer ${token}`
                        });
                    });
                })
                .catch(err => console.log(err));
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: 'Something went wrong.' });
        });
});

// add User Bank Details
// @route POST /api/users/addBank
// @desc Add Bank user bank account details
// @access Private
router.post('/addBank', (req, res) => {
    console.log(req.body);
    Profile.findOne({ user: req.user._id })
        .then(profile => {
            if (!profile) {
                return res.status(404).json({ msg: 'No profile found!' });
            }
            profile.accountName = req.body.accountName;
            profile.accountNumber = req.body.accountNumber;
            profile.bank = req.body.bank;
            profile.save()
                .then(profile => {
                    console.log('user ', req.user);
                    const payload = {
                        id: req.user.id,
                        username: req.user.username,
                        firstName: req.user.firstName,
                        lastName: req.user.lastName,
                        email: req.user.email,
                        phone: req.user.phone,
                        lastSeen: req.user.lastSeen,
                        dateCreated: req.user.dateCreated,
                        balance: profile.balance,
                        totalEarnings: profile.totalEarnings,
                        gamesPlayed: profile.gamesPlayed,
                        rank: profile.rank,
                        wins: profile.wins,
                        losses: profile.losses,
                        bank: profile.bank,
                        accountName: profile.accountName,
                        accountNumber: profile.accountNumber,
                        cardName: profile.cardName,
                        cardNumber: profile.cardNumber,
                        cvv: profile.cvv,
                        cardExp: profile.cardExp
                    };
                    jwt.sign(payload, keys.secretOrKey, { expiresIn: '30 days' }, (err, token) => {
                        res.json({
                            ...payload,
                            success: 'Bank added Successfully',
                            token: `Bearer ${token}`
                        });
                    });
                })
                .catch(err => console.log(err));
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: 'Something went wrong.' });
        });
});

// funds user account
// @route POST /api/users/fundAccount
// @desc Add funds to user account
// @access Private
router.post('/fundAccount', (req, res) => {
    const publicKey = 'FLWPUBK-1a0620ce92aeed540c4de14424668caf-X';
    const secret = 'FLWSECK-4d3a45d7786963cbb688f9265b3eca67-X';
    const encryptionKey = '4d3a45d77869397ffdbb1b3b';
    const merchantID = '3017378';

    const customer = req.body;
    
});

module.exports = router;