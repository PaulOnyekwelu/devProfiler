const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../config/keys');
const debug = require('debug')('app:auth')

const User = require('../models/User');

exports.getUser = async(req, res) => {
    try{
        const user = await User.findById(req.user.id).select('-password');
        if(!user){
            return res.status(404).json({errors: [{ msg: "user not found!" }]})
        }
        res.json(user); 
    }catch(err){
        debug(err)
        return res.status(500).send('internal server error!')
    }

}


exports.login = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    }

    try{
        const user = await User.findOne({ email: req.body.email });
        if(!user){
            return res.status(400).json({ errors: [{ msg: "invalid credentials" }]})
        }
        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if(!isMatch){
            return res.status(400).json({ errors: [{ msg: "invalid credentials"}]})
        }

        const payload = {
            user: {
                id: user.id
            }
        }
        jwt.sign(payload, keys.jwtSecret, { expiresIn: 3600 }, (error, token) => {
            if(error) throw error;
            res.json({token});
        })
    }catch(err){
        debug(err);
        return res.status(500).send("internal server error!");
    }
}