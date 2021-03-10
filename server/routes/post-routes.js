const express = require('express');
const { body } = require('express-validator')
const { createPost, getAllPosts, getPost, updatePost, deletePost } = require('../controllers/postControllers');

const router = express.Router();

router.route('/')
    .post([
        body('title').trim().isLength({ min: 5 }),
        body('content').trim().isLength({ min: 5 })
    ], createPost)
    .get(getAllPosts)

router.route('/:id')
    .put(updatePost)
    .get(getPost)
    .delete(deletePost)

module.exports = router;