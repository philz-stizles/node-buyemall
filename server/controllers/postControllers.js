const fs = require('fs')
const { validationResult } = require('express-validator')
const Post = require('../models/Post')
const { deletFile } = require('../utils/file-utils')

exports.createPost = (req, res) => {
    console.log(req.file)
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        return res.status(400).send({ data: errors.array() })
    }

    const { title, content, imageUrl } = req.body

    console.log(req.userId)

    const newPost = new Post({ title, content, imageUrl: req.file.path.replace("\\" ,"/"), creator: req.userId })
    newPost.save()
        .then((result) => {
            res.status(201).send({ status: true, data: result, message: 'Created' })
        })
        .catch(error => console.log(error))
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

exports.getAllPosts = async (req, res) => {
    Post.find()
        .then((posts) => {
            res.status(200).send({ status: true, data: {
                posts,
                count: posts.length
            }, message: 'Retrieved' })
        })
        .catch(error => {
            console.log(error)
            if(!error) {
                error.statusCode = 500
            }
            next(error)
        })
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
        imageUrl = req.file.path
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
            res.status(200).send({ status: true, data:updatedPost, message: 'Updated' })
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
            console.log(post)
            deletFile(post.imageUrl)
            return Post.findByIdAndRemove(req.params.id)
        })
        .then((post) => {
            console.log(post)
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