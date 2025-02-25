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
        // Not behaving as expected in Postman
        [
            check('status', 'Status is required').not().isEmpty(),
            check('skills', 'Skills is required').not().isEmpty()    
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req);
        // console.log(`Req: ${req}`);
        // console.log(`Res: ${res}`);
        // console.log(`Errors: ${errors}`);

        // Not behaving as expected in Postman
        if(!errors.isEmpty()){
            return res.status(400).json({ "errors": errors.array });
        }

        // destructure the request
        const {
            company,
            website,
            location,
            bio,
            status,
            githubusername,
            skills,
            youtube,
            facebook,
            twitter,
            instagram,
            linkedin,
        } = req.body;

        // Build profile object
        const profileFields = {};
        profileFields.user = req.user.id;

        if(company) profileFields.company = company;
        if(website) profileFields.website = website;
        if(location) profileFields.location = location;
        if(bio) profileFields.bio = bio;
        if(status) profileFields.status = status;
        if(githubusername) profileFields.githubusername = githubusername;
        
        // Convert comma-separated list to Array
        if(skills) {
            profileFields.skills = skills.split(',').map(skill => skill.trim());
        }
        
        // Test to make sure skills is returned properly and that the route is working
        // console.log(profileFields.skills);

        // Build Social object
        profileFields.social = {}
        if(youtube) profileFields.social.youtube = youtube;
        if(facebook) profileFields.social.facebook = facebook;
        if(twitter) profileFields.social.twitter = twitter;
        if(instagram) profileFields.social.instagram = instagram;
        if(linkedin) profileFields.social.linkedin = linkedin;

        try {
            let profile = await Profile.findOne({ user: req.user.id });
            if(profile) {
                profile = await Profile.findOneAndUpdate(
                    { user: req.user.id },
                    { $set: profileFields }, 
                    { new: true }
                );

                return res.json(profile);
            }

            // Create
            profile = new Profile(profileFields);
            await profile.save();
            res.json(profile);

        } catch(err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
});

// // @route   GET api/post
// // @desc    Get all Pprofiles
// // @access  Public

router.get('/', async (req, res) => {
    try {
        // Adding gravatar nonsense.
        const profiles = await Profile.find('user', ['name', 'avatar']);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})

module.exports = router;