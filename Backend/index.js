require('dotenv').config();

const express = require('express');
const app = express();

const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/' });
const fs = require('fs');
const compression = require('compression');

const { default: mongoose } = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Post = require('./models/Post');

// config from env with sensible defaults for local dev
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/shopperz';
const SECRET = process.env.JWT_SECRET || 'replace-me-in-prod';
const COOKIE_SECRET = process.env.COOKIE_SECRET || 'replace-me-in-prod';
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
const PORT = process.env.PORT || 4000;

const salt = bcrypt.genSaltSync(6);

// Security and common middleware
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(COOKIE_SECRET));
app.use('/uploads', express.static(__dirname + '/uploads'));

app.use(cors({ credentials: true, origin: FRONTEND_ORIGIN }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
});
app.use(limiter);

// connect to DB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error', err));

// Register endpoint
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  console.log('Received username:', username);
  try {
    const userDoc = await User.create({
      username,
      password: bcrypt.hashSync(password, salt),
    });

    res.json(userDoc);
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const userDoc = await User.findOne({ username });
    if (!userDoc) {
      return res.status(400).json('User not found');
    }
    const passok = bcrypt.compareSync(password, userDoc.password);
    if (passok) {
      jwt.sign({ username, id: userDoc._id }, SECRET, {}, (err, token) => {
        if (err) {
          console.error('Error signing JWT:', err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
        // Set secure cookie options in production via env
        const cookieOptions = {
          httpOnly: true,
          // secure: true, // enable in production (HTTPS)
          // sameSite: 'none', // set as appropriate for cross-site
        };
        res.cookie('token', token, cookieOptions).json({
          id: userDoc._id,
          username,
        });
      });
    } else {
      res.status(400).json('Wrong credentials');
    }
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Profile endpoint
app.get('/profile', (req, res) => {
  const token = req.cookies && req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) {
      console.error('Error verifying token:', err);
      return res.status(401).json({ error: 'Unauthorized' });
    } else {
      res.json(decoded);
    }
  });
});

app.post('/logout', (req, res) => {
  res.cookie('token', '').json('ok');
});

// Create post with upload
app.post('/post', uploadMiddleware.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const { originalname, path } = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    const newPath = path + '.' + ext;
    fs.renameSync(path, newPath);

    const { token } = req.cookies || {};
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    jwt.verify(token, SECRET, {}, async (err, info) => {
      if (err) return next(err);
      const { title, summary, content } = req.body;
      const postDoc = await Post.create({
        title,
        summary,
        content,
        cover: newPath,
        author: info.id,
      });
      res.json(postDoc);
    });
  } catch (err) {
    next(err);
  }
});

app.get('/post', async (req, res) => {
  res.json(
    await Post.find()
      .populate('author', ['username'])
      .sort({ createdAt: -1 })
      .limit(30)
  );
});

app.get('/post/:id', async (req, res) => {
  const { id } = req.params;
  const postDoc = await Post.findById(id).populate('author', ['username']);
  res.json(postDoc);
});

// basic centralized error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log('Server is running on port', PORT);
});
