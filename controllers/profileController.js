const { validationResult } = require('express-validator');
const  debug = require('debug')("app:profile");

const  Profile = require('../models/Profile');


// get user profile
exports.getProfile = async (req, res) => {
    try{
        const profile = await Profile.findOne({user: req.user.id}).populate('user', ['name', 'avatar']);
        if(!profile){
            return res.status(400).json({ errors: [{ msg:"no profile found for this user"}]});
        }
        res.send(profile);
    }catch(err){
        debug(err)
        return res.status(500).json({ errors: [{ msg: "internal server error"}]});
    }
}


// create or edit user profile
exports.postProfile = async (req, res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    // build objects
    const profileField = {};
    const socialField = {};
    const socialKeys = ['twitter', 'facebook', 'instagram', 'linkedIn'];

    profileField.user = req.user.id;
    Object.entries(req.body).map(item => {
        if(item[0] === 'skills'){
            //creating an array of skills
            const skills = item[1].split(',').map(skill => skill.trim());
            profileField[item[0]] = skills;
        }else if(socialKeys.indexOf(item[0]) > -1 ){
            //populating the socialField object
            socialField[item[0]] = item[1];
        }else{
            profileField[item[0]] = item[1]
        }
    });
    profileField.socials = socialField;

    try{
        let profile = await Profile.findOne({user: req.user.id });
        if(profile){
            profile = await Profile.findOneAndUpdate({ user: req.user.id}, profileField, { new: true});
            return res.send(profile);
        }else{
            profile = new Profile(profileField);
            await profile.save();
            return res.send(profile);
        }

    }catch(err){
        debug(err);
        return res.status(500).json({ errors: [{ msg: 'internal server error!'}]})
    }
}


// get all profiles
exports.getProfiles = async(req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.send(profiles);
    } catch (err) {
        debug(err);
        return res.status(500).json({ errors: [{ msg: "internal server error"}]})
    }
}


// get user profile by user id
exports.getProfileByUserId = async(req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);
        if(!profile) return res.status(404).json({ error: [{ msg: "there is no profile for this user"}]})
        res.send(profile);
    } catch (err) {
        debug(err);
        if(err.kind === "ObjectId") return res.status(404).json({ error: [{ msg: "there is no profile for this user"}]});
        return res.status(500).json({ errors: [{ msg: "internal server error"}]})
    }
    
}


// delete user, user profile and user posts
exports.deleteUserInfo = async(req, res) => {
    try {
        await Profile.findOneAndRemove({ user: req.user.id});
        await User.findOneAndRemove({_id: req.user.id});
        res.json({msg: "user deleted successfully!"})
    } catch (err) {
        debug(err);
        return res.status(500).json({ errors: [{ msg: "internal server error"}]})
    }
}


// add user experience
exports.addExperience = async(req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }
    const experience = {...req.body};
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        profile.experience.unshift(experience);
        await profile.save();
        res.send(profile);
    } catch (err) {
        debug(err);
        return res.status(500).json({ errors: [{ msg: "internal server error"}]})
    }
}


// delete experience
exports.deleteExperience = async(req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        const index = profile.experience.map(item => item._id).indexOf(req.params.exp_id);
        if(index > -1){
            profile.experience.splice(index, 1);
            profile.save();
            return res.send(profile);
        }
        res.send(profile);
    } catch (err) {
        debug(err);
        return res.status(500).json({ errors: [{ msg: "internal server error"}]})
    }
}
