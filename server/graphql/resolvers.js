const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { isEmail, isEmpty, isLength } = require('validator')
const User = require('../models/User')
const Post = require('../models/Post')
const { clearImage } = require('../utils/file-utils')

module.exports = {
    register: async (args, request) => {
        // Destructure input fields
        const { email, password, username } = args.user

        // Validate input fields
        const errors = []
        if(!isEmail(email)) {
            errors.push('E-mail is invalid')
        }

        if(isEmpty(password) || isLength(password, { min: 6 })) {
            errors.push('Password with more than 6 characters is required')
        }

        if(errors.length > 0) {
            throw new Error('Invalid input fields')
        }

        // Check is User already exists
        const existingUser = await User.findOne({email})
        if(existingUser) {
            throw new Error('User already exists')
        }

        // Hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // Create User
        const newUser = new User({ username, email, hashedPassword})
        const createdUser = await newUser.save()

        return { ...createdUser._doc, _id: createdUser._id.toString() }
    },
    login: async (args, request) => {
        // Destructure input fields
        const { email, password } = args.credentials
        console.log(email, password )
        // Check is User exists
        const existingUser = await User.findOne({email})
        if(!existingUser) {
            const error = new Error('User email/password invalid')
            error.code = 401
            throw error
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, existingUser.password)
        if(!isMatch) {
            const error = new Error('User email/password invalid')
            error.code = 401
            throw error
        }

        // Generate token
        const token = jwt.sign({ userId: existingUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' })
        console.log(existingUser._id)
        return { userId: existingUser._id, token }
    },
    createUser: async (args, request) => {
        // Destructure input fields
        const { email, password, username } = args.user

        // Validate input fields
        const errors = []
        if(!isEmail(email)) {
            errors.push('E-mail is invalid')
        }

        if(isEmpty(password) || !isLength(password, { min: 6 })) {
            errors.push('Password with more than 6 characters is required')
        }

        if(errors.length > 0) {
            const error = new Error('Invalid input fields')
            error.data = errors
            error.code = 422
            throw error
        }

        // Check is User already exists
        const existingUser = await User.findOne({email})
        if(existingUser) {
            throw new Error('User already exists')
        }

        // Hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // Create User
        const newUser = new User({ username, email, password: hashedPassword })
        const createdUser = await newUser.save()

        return { ...createdUser._doc, _id: createdUser._id.toString() }
    },
    createPost: async (args, request) => {
        if(!request.isAuthenticated) {
            const error = new Error('You are not authenticated')
            error.code = 401
            throw error
        }

        const { title, content, imageUrl } = args.post

        // Validate input fields
        const errors = []
        if(isEmpty(title) || !isLength(content, { min: 5 })) {
            errors.push('Title is invalid')
        }

        if(isEmpty(content) || !isLength(content, { min: 5 })) {
            errors.push('Content is invalid')
        }

        if(errors.length > 0) {
            const error = new Error('Invalid input fields')
            error.data = errors
            error.code = 422
            throw error
        }

        // Validate authenticated user
        const existingUser = User.findById()
        if(!existingUser) {
            const error = new Error('Invalid user.')
            error.code = 401
            throw error
        }

        // Create Post
        const newPost = new Post({ title, content, imageUrl: 'fhjg', creator: request.userId })
        const createdPost = await newPost.save()

        // Add post to users posts
        existingUser.posts.push(newPost)
        await existingUser.save()

        return { 
            ...createdPost._doc, 
            _id: createdPost._id.toString(), 
            createdAt: createdPost.createdAt.toISOString(),
            updatedAt: createdPost.updatedAt.toISOString(),
        }
    },
    updatePost: async (args, request) => {
        // Authenticate User
        if(!request.isAuthenticated) {
            const error = new Error('You are not authenticated')
            error.code = 401
            throw error
        }

        // Check if post exists
        const existingPost = await Post.findById(args.postId)
        if(!existingPost) {
            const error = new Error('Post not found.')
            error.code = 404
            throw error
        }

        // Validate post creator
        if(existingPost.creator !== request.userId) {
            const error = new Error('Not authorized.')
            error.code = 403
            throw error
        }

        const { title, content } = args.post

        // Validate input fields
        const errors = []
        if(isEmpty(title) || !isLength(content, { min: 5 })) {
            errors.push('Title is invalid')
        }

        if(isEmpty(content) || !isLength(content, { min: 5 })) {
            errors.push('Content is invalid')
        }

        if(errors.length > 0) {
            const error = new Error('Invalid input fields')
            error.data = errors
            error.code = 422
            throw error
        }

        // Update Post
        existingPost.title = title
        existingPost.content = content
        if(imageUrl || imageUrl !== 'undefined') {
            existingPost.imageUrl = imageUrl 
        }
        const updatedPost = await existingPost.save()

        return updatedPost
    },
    deletePost: async (args, request) => {
        if(!request.isAuthenticated) {
            const error = new Error('You are not authenticated')
            error.code = 401
            throw error
        }

        // Check if post exists
        const existingPost = await Post.findById(args.postId)
        if(!existingPost) {
            const error = new Error('Post not found.')
            error.code = 404
            throw error
        }

        // Validate post creator
        if(existingPost.creator !== request.userId) {
            const error = new Error('Not authorized.')
            error.code = 403
            throw error
        }

        // Delete the attached image
        clearImage(existingPost.imageUrl)

        // Delete post
        await Post.findByIdAndRemove(args.postId)

        // Remove post from user
        await Post.findByIdAndRemove(args.postId)

        return true
    },
    posts: async (args, request) => {
        if(!request.isAuthenticated) {
            const error = new Error('You are not authenticated')
            error.code = 401
            throw error
        }

        const count = await Post.find().countDocuments()
        const posts = await Post.find().sort({ createdAt: -1 }).populate('creator', 'username')

        return { posts, count }
    },
    post: async (args, request) => {
        if(!request.isAuthenticated) {
            const error = new Error('You are not authenticated')
            error.code = 401
            throw error
        }

        const post = await Post.findById(args.postId).populate('creator', 'username')
        if(!post) {
            const error = new Error('Post was not found')
            error.code = 404
            throw error
        }

        return post
    }
}