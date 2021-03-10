const { validationResult } = require('express-validator')
const Post = require('../db/models/Post')
const db = require('../db')

exports.createPost = (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        return res.status(400).send({ data: errors.array() })
    }
    
    const { title, content, imageUrl } = req.body
    const post = new Post({title, content, imageUrl, creator: 1})
    post.save()
        .then((result) => {
            if(result.affectedRows <= 0) return res.status(500).send({ status: false, message: 'Could not create user, try again later' })
            res.status(201).send({ status: true, data: result.insertId, message: 'Post created successfully' })
            // or in the case of MVC, redirect to list view route
        })  
        .catch(error => {
            console.error(error)
            return res.status(500).send({ status: false, message: 'Could not create user, try again later' })
        })
}

exports.getPost = (req, res, next) => {
    Post.getById(req.params.id)
        .then((result) => {
            if(result.length <= 0) return res.status(404).send({ status: false, message: 'Could not find post' })
            res.status(201).send({ status: true, data: result[0], message: 'Post retrieved successfully' })
            // or in the case of MVC, redirect to list view route
        })  
        .catch(error => {
            console.error(error)
            return res.status(500).send({ status: false, message: 'Could not retrieve post, try again later' })
        })
}

exports.getAllPosts = async (req, res, next) => {
    Post.getAll()
        .then(([results, fields]) => {
            // console.log(fields); // fields contains extra meta data about results, if available
        
            // If you execute same statement again, it will be picked from a LRU cache
            // which will save query preparation time and give better performance
            res.status(200).send({ status: true, data: results, message: 'Retrieved' })
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

}

exports.deletePost = (req, res) => {
    Post.findByIdAndDelete(req.params.id)
        .then((post) => {
            if(!post) {
                const error = new Error('Post not found')
                error.statusCode = 404
                throw error
            }
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