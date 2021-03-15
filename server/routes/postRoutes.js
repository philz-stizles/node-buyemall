const express = require('express');
const { body } = require('express-validator')
const { createPost, getAllPosts, getPost, updatePost, deletePost } = require('../controllers/postControllers');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/')
    .post(authMiddleware, [
        body('title').trim().isLength({ min: 5 }),
        body('content').trim().isLength({ min: 5 })
    ], createPost)
    .get(authMiddleware, getAllPosts)

router.route('/:id')
    .put(authMiddleware, updatePost)
    .get(authMiddleware, getPost)
    .delete(authMiddleware, deletePost)

module.exports = router;