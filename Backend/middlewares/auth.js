const jwt = require('jsonwebtoken');
require('dotenv').config()
const auth = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    // console.log(token)
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log(decoded)
        if (!decoded) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        req.user = decoded;
        console.log(decoded)
        next();
    } catch (error) {
        console.error(error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        return res.status(403).json({ message: 'Please Login' });
    }
}
module.exports = auth;