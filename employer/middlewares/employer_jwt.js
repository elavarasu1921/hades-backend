const jwt = require('jsonwebtoken');

exports.jwtValidation = (req, res, next) => {
    headerToken = (req.headers.authorization).slice(7);
    if (!headerToken) {
        console.log('No token', req.body);
        res.status(499).json({
            errMessage: 'User Not Authorized..'
        })
        return;
    }
    jwt.verify(headerToken, process.env.JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
            console.log(err);
            res.status(499).json({
                errMessage: 'JWT Expired..'
            })
            return;
        }
        req.body.userName = decoded.userName;
        req.body.userID = decoded.userID;
        next();
    });
}