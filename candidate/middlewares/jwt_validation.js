const jwt = require('jsonwebtoken');

exports.jwtValidation = (req, res, next) => {
    const token = (req.headers.authorization).slice(7);
    if (!token) {
        console.log('No token', req.body);
        res.status(499).json({
            errMessage: 'Authorization Failed',
        });
        return;
    }
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
            console.log('JWT Expired');
            res.status(498).json({
                errMessage: 'JWT Expired',
            });
            return;
        }
        req.body.userName = decoded.userName;
        req.body.userID = decoded.userID;
        next();
    });
};

exports.partialJwtValidation = (req, res, next) => {
    const token = (req.headers.authorization).slice(7);
    if (!token) {
        req.body.message = 'Guest User';
    } else {
        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
            if (err) {
                console.log(err);
                req.body.message = 'Guest User';
                return;
            }
            req.body.userName = decoded.userName;
            req.body.userID = decoded.userID;
        });
    }
    next();
};