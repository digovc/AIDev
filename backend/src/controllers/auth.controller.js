const jwt = require('jsonwebtoken');

class AuthController {
  registerEndpoints(router) {
    router.post('/login', (req, res) => {
      const { email, password } = req.body;
      
      if (email !== process.env.AIDEV_USER_EMAIL || 
          password !== process.env.AIDEV_USER_PASSWORD) {
        return res.status(401).send({ error: 'Invalid credentials' });
      }
      
      const token = jwt.sign(
        { email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
      
      res.send({ token });
    });
  }
}

module.exports = new AuthController();