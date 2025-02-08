const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth' );
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

// Models
const User = require('../../models/User');

// // @route   GET api/user
// // @desc    Test Route
// // @access  Public
// router.get('/', (req, res)=> res.send('Auth route'));


// @route   GET api/auth
// @desc    
// @access  Public
router.get(
    '/',
    auth,
    async (req, res) => {
        try{
            const user = await User.findById(req.user.id).select('-password');
            res.json(user);
        } catch(err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   POST api/auth
// @desc    Authenticate user & get token
// @access  Public
router.post(
    '/', 
    [
        check('email', 'Please include a valid email address').isEmail(),
        check('password', 'Password is required').exists()
    ], 
    async (req, res)=> {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()});
        }
        
        const { email, password } = req.body;

        try {
            // See if user does not exists
            let user = await User.findOne({ email });
            if (!user){
                return res.status(400).json({ errors: [ { msg: 'Invalid credentials'} ]});
            }

            // Check if password matches the one stored in the database.
            const isMatch = await bcrypt.compare(password, user.password);
  
            if (!isMatch){
                return res.status(400).json({ errors: [ { msg: 'Invalid credentials'} ]});
            }

            // Return JWT
            const payload = {
                user: {
                    id: user.id, 
                }
            }

            jwt.sign(
                payload,
                config.get('jwtSecret'),
                { expiresIn: 3600000},
                (err, token) => {
                    if(err) throw err;
                    res.json({ token });
                }
            );

        } catch(err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }


        // console.log(req.body);
        // res.send('User route');
    }
);

module.exports = router;