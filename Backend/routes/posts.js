const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/', limits: { fileSize: 5 * 1024 * 1024 } });
const { postCreateValidator } = require('../validators/postValidators');
const { validationResult } = require('express-validator');
const { createPost, listPosts, getPost } = require('../controllers/postController');
const auth = require('../middleware/auth');

const runValidation = (validators) => async (req, res, next) => {
  for (let validator of validators) {
    await validator.run(req);
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

router.post('/post', auth, upload.single('file'), runValidation(postCreateValidator), createPost);
router.get('/post', listPosts);
router.get('/post/:id', getPost);

module.exports = router;
