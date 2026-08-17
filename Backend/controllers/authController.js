const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'replace-me-in-prod';
const SALT_ROUNDS = 6;

exports.register = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ error: 'Username already taken' });
    const hashed = bcrypt.hashSync(password, bcrypt.genSaltSync(SALT_ROUNDS));
    const userDoc = await User.create({ username, password: hashed });
    const user = userDoc.toObject();
    delete user.password;
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const userDoc = await User.findOne({ username });
    if (!userDoc) return res.status(400).json({ error: 'User not found' });
    const passok = bcrypt.compareSync(password, userDoc.password);
    if (!passok) return res.status(400).json({ error: 'Wrong credentials' });
    const token = jwt.sign({ username, id: userDoc._id }, SECRET, { expiresIn: '1h' });
    const cookieOptions = {
      httpOnly: true,
      // secure: true, // enable in production
    };
    res.cookie('token', token, cookieOptions).json({ id: userDoc._id, username });
  } catch (err) {
    next(err);
  }
};

exports.profile = (req, res) => {
  // auth middleware can also be used, but keep compatibility
  const token = req.cookies && req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Unauthorized' });
    res.json(decoded);
  });
};

exports.logout = (req, res) => {
  res.cookie('token', '').json('ok');
};
