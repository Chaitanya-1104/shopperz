const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'replace-me-in-prod';

module.exports = function (req, res, next) {
  const token = req.cookies && req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Unauthorized' });
    req.user = decoded;
    next();
  });
};
