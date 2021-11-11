const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const keys = require('../config/keys');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const debug = require('debug')('app:user')

const User = require('../models/User');


exports.createUser = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array()  })
    }
    const { name, email, password } = req.body;

    try{
        let user = await User.findOne({email})
        if(user){
            return res.status(400).json({errors: [{msg: "Email already in use"}]})
        }
        const avatar = gravatar.url(email, {
            s: "200",
            r: "pg",
            d: "mm"
        });

        user = new User({name, email, password, avatar});

        //hashing password
        const salt = await bcrypt.genSalt(12)
        user.password = await bcrypt.hash(password, salt);

        //saving user to db
        await user.save();

        //generating user token
        const payload = {
            user: {
                id: user.id
            }
        }
        jwt.sign(payload, keys.jwtSecret, { expiresIn: 360000 }, (err, token) => {
            if(err) throw err;
            res.json({ token });
        })

    }catch(err){
        debug(err);
        res.status(500).send("internal server error");
    }

}
