const fs = require('fs')
const { validationResult } = require('express-validator')
const Post = require('../models/Post')
const { deletFile } = require('../utils/file-utils')
const io = require('../socket')

exports.createPost = async (req, res) => {
    console.log(req.file)
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        return res.status(400).send({ data: errors.array() })
    }

    const { title, content, imageUrl } = req.body

    console.log(req.userId)

    const newPost = new Post({ title, content, imageUrl: req.file.path.replace("\\" ,"/"), creator: req.userId })
    
    try {
        const post = await newPost.save()

        const user = await User.findById(req.userId)
        user.posts.unshift(post)
        await user.save()
        
        // io.getIO().broadcast() // This will send to all connected users accept the emitter
        io.getIO().emit('posts', { action: 'create', post }) // This will send to all connected users. 
        // You can pass any object with any data you want
        res.status(201).send({ status: true, data: {
            post,
            creator: { _id: user._id, username: user.username }
        }, message: 'Created' })

    } catch (error) {
        console.log(error)
    }
}

exports.getPost = (req, res) => {
    Post.findById(req.params.id).populate('creator', 'username')
        .then((post) => {
            if(!post) {
                const error = new Error('Post not found')
                error.statusCode = 404
                throw error
            }
            console.log(post)
            res.status(200).send({ status: true, data: post, message: 'Retrieved' })
        })
        .catch(error => {
            console.log(error)
            if(!error) {
                error.statusCode = 500
            }
            next(error)
        })
}

exports.getAllPosts = async (req, res, next) => {
    console.log(req.query)
    const page = +req.query.currentPage || 1  // Ensure to convert req.query.currentPage from string to number using +
    const limit = +req.query.limit || 5 // Ensure to convert req.query.limit from string to number using +
    const skip = (page - 1) * limit
    try {
        const count = await Post.countDocuments()
        const posts = await Post.find()
            .populate('creator', 'username')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
        
        res.status(200).send({ status: true, data: { posts, count }, message: 'Retrieved' })

    } catch (error) {
        console.log(error)
        if(!error) {
            error.statusCode = 500
        }
        next(error)
    }
}

exports.updatePost = (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        return res.status(400).send({ data: errors.array() })
    }

    const { title, content, image } = req.body
    console.log('image', image)
    let imageUrl = image
    
    if(req.file) {
        imageUrl = req.file.path.replace('\\', '/')
        console.log('filePath', req.file.path)
    }
    console.log(req.params.id, req.userId )
    console.log('IMAGEUrl', imageUrl)
    Post.findOne({ _id: req.params.id, creator: req.userId })
        .then((existingPost) => {
            if(!existingPost) {
                const error = new Error('Post not found')
                error.statusCode = 404
                throw error
            }
            console.log('existing', existingPost.imageUrl)
            if(imageUrl && imageUrl !== existingPost.imageUrl) {
                deletFile(existingPost.imageUrl) 
                existingPost.imageUrl = imageUrl
            }

            existingPost.title = title
            existingPost.content = content
            return existingPost.save()
        })
        .then(updatedPost  => {
            console.log(updatedPost)
            // io.getIO().broadcast() // This will send to all connected users accept the emitter
            io.getIO().emit('posts', { action: 'update', post: updatedPost }) // This will send to all connected users. 
            // You can pass any object with any data you want

            res.status(200).send({ status: true, data: updatedPost, message: 'Updated' })
        })
        .catch(error => {
            console.log(error)
            if(!error) {
                error.statusCode = 500
            }
            next(error)
        })
}

exports.deletePost = (req, res) => {
    console.log(req.params.id)
    Post.findOne({ _id: req.params.id, creator: req.userId })
        .then((post) => {
            if(!post) {
                const error = new Error('Post not found')
                error.statusCode = 404
                throw error
            }

            deletFile(post.imageUrl)
            return Post.findByIdAndRemove(req.params.id)
        })
        .then((deletedPost) => {
            // io.getIO().broadcast() // This will send to all connected users accept the emitter
            io.getIO().emit('posts', { action: 'delete', post: deletedPost }) // This will send to all connected users. 
            // You can pass any object with any data you want

            res.status(200).send({ status: true, data: post, message: 'Deleted' })
        })
        .catch(error => {
            console.log(error)
            if(!error) {
                error.statusCode = 500
            }
            next(error)
        })
}