const jwt = require('jsonwebtoken');

class AuthMiddleware {
  handler() {
    return (req, res, next) => {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).send({ error: 'Missing token' });
      }
      
      const token = authHeader.split(' ')[1];
      
      if (!token) {
        return res.status(401).send({ error: 'Missing token' });
      }
      
      try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
      } catch (err) {
        return res.status(401).send({ error: 'Invalid token' });
      }
    };
  }
}

module.exports = new AuthMiddleware();