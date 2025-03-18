// TODO: Determine how to create different permissions.  One account would need to be able to assign things to the other users. 
// A "trainer" account vs "client" account.
// Client accounts cannot see the information of other accounts.  Trainer accounts can see everyone's info.
// Profile would only be something viewable by the trainer?

// TODO: Functionality to update experience on profile.  Not included in tutorial

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

        // FOR TROUBLESHOOTING POSTMAN
        // console.log(`Errors: ${errors}`);
        // console.log(errors);

        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()});
        } 
        // else {
        
        //     // Added this (it is not in the tutorial) so I could have confirmation that this was working properly.
        //     return res.send("Profile Updated");
        // }

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

        // .split converts string into an array.  argument, ',', indicates delimeter.
        if(skills) {
            console.log(123);
            profileFields.skills = skills.split(',').map(skill => skill.trim());
        }
        
        // Test to make sure skills is returned properly and that the route is working
        console.log(`profielFields.skills: ${profileFields.skills}`);
        console.log(profileFields.skills);
        console.log(`profielFields: ${profileFields}`);
        console.log(profileFields);

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
    }
);

// @route   GET api/profile
// @desc    Get all Profiles
// @access  Public

router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/profile/user/:user_id
// @desc    Get Profile by UserID
// @access  Public
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);
        
        if(!profile) return res.status(400).json({ msg: 'Profile not found.'})

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        if(err.kind == 'ObjectID'){
            return res.status(400).json({ msg: 'Profile not found.'})
        }
        res.status(500).send('Server Error');
    }
});

// @route   DELTE api/profile
// @desc    Delete Profile, user & posts
// @access  Private

router.delete('/', auth, async (req, res) => {
    try {
        // @TODO - remove user's posts

        // Remove profile
        await Profile.findOneAndDelete({ user: req.user.id })
       
        // Remove user
        await Profile.findOneAndDelete({ _id: req.user.id })

        res.json({ msg: 'User removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/profile/experience
// @desc    Add profile experience
// @access  Private
router.put(
    '/experience',
    [
        auth,
        [
            check('title', 'Title is required').not().isEmpty(),
            check('company', 'Company is required').not().isEmpty(),
            check('from', 'From date is required').not().isEmpty(),
        ]   
    ], 
    async (req, res)=>{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        } =  req.body;

        const newExp = {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        }
        try {
            const profile = await Profile.findOne({user: req.user.id });
            profile.experience.unshift(newExp);
            await profile.save();
            res.json(profile);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');            
        }
});

// @route   DELETE api/profile/experience
// @desc    Delete profile experience
// @access  Private

module.exports = router;