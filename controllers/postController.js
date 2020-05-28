const { validationResult } = require('express-validator');
const debug = require('debug')('app:post')

const Post = require('../models/Post');
const User = require('../models/User');

exports.createPost = async(req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    }
    try {
        const user = await User.findById(req.user.id).select('-password');
        const post = new Post({
            user: req.user.id,
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
        })
        const savedPost = await post.save();
        res.json(savedPost);
    } catch (err) {
        debug(err);
        return res.status(500).send("internal server error")
    }
}

exports.getPosts = async(req, res) => {
    try {
        const posts = await Post.find().sort({ date: -1 });
        res.send(posts);
    } catch (err) {
        debug(err);
        res.status(500).send('internal server error')
    }
}
