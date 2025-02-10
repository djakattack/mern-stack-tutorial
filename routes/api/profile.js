// TODO: Determine how to create different permissions.  One account would need to be able to assign things to the other users. 
// A "trainer" account vs "client" account.
// Client accounts cannot see the information of other accounts.  Trainer accounts can see everyone's info.
// Profile would only be something viewable by the trainer?

const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const Profile = require('../../models/Profile')
const User = require('../../models/User');

// // ======= TEST ROUTE ========
// // @route   GET api/post
// // @desc    Test Route
// // @access  Public
// router.get('/', (req, res)=> res.send('post route'));

module.exports = router;

// @route   GET api/profile/me
// @desc    GET current user's profile
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);

        if(!profile) {
            return res.status(400).json({ msg: 'There is no profile for this user'});
        }

        res.json(profile);

    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/profile
// @desc    Create or update a user profile
// @access  Private

router.post(
    '/',
    [
        auth,
        [
            check('status', 'Status is required').not().isEmpty(),
            check('skills', 'Skills is required').not().isEmpty()    
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req);
        console.log(`Req: ${req}`);
        console.log(`Res: ${res}`);
        console.log(`Errors: ${errors}`);
        if(!errors.isEmpty()){
            return res.status(400).json({ "errors": errors.array });
        }
});

module.exports = router;