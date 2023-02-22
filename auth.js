const jwt = require('jsonwebtoken')
require('dotenv').config()
const env = require('./env')


const authenticateToken= (req,res,next)=>{
    const token = req.cookies.token;
    if (!token) {
      return res.sendStatus(403);
    }
    try {
      const data = jwt.verify(token, env.jwt.secret);
      req.userId = data.id;
      req.userRole = data.role;
      return next();
    } catch {
      return res.sendStatus(403);
    }
}

module.exports = authenticateToken