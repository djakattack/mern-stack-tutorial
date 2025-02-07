const express = require('express');
// -- Delete Later --
const gravatar = require('gravatar');
// -- /Delete -------
const bcrypt = require('bcryptjs');
const router = express.Router();

const { check, validationResult } = require('express-validator');

const User = require("../../models/User");

// @route   POST api/user
// @desc    Register user
// @access  Public
router.post(
    '/', 
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email address').isEmail(),
        check('password', 'Please enter a password with 6 or more characters').isLength({min:6})
    ], 
    async (req, res)=> {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()});
        }
        
        const { name, email, password } = req.body;

        try {
            // See if user exists
            let user = await User.findOne({ email });
            if (user){
                res.status(400).json({ errors: [ { msg: 'User already exists'} ]});
            }
            
            // -----DELETE THIS LATER------
            // Get users garavatar
            const avatar = gravatar.url(email, {
                s: '200',
                r: 'pg',
                d: 'mm'
            })
            // -----/DELETE----------------

            user = new User({
                name,
                email,
                avatar,
                password
            });

            // Encrypt password
            const salt = await bcrypt.genSalt(10);

            user.password = await bcrypt.hash(password, salt);
            await user.save();
    
            // Return JWT
        } catch(err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }


        // console.log(req.body);
        res.send('User route');
    }
);

module.exports = router;