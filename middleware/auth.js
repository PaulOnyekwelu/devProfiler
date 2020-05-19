const jwt = require('jsonwebtoken');
const config = require('config');

const authMiddleware = (req, res, next) => {
    const token = req.header('x-auth-token');

    //authenticating token
    if(!token){
        return res.status(401).json({errors: [{ msg: "No token found, authorization denied!" }]});
    }
    //validating token
    try{
        const decoded = jwt.verify(token, config.get('jwtSecret'))
        req.user = decoded.user;
    }catch(err){
        return res.status(500).json({errors: [{ msg: "auth - internal server error" }]})
    }
    next()
}

module.exports = authMiddleware;