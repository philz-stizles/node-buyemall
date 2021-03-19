const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { isEmail, isEmpty, isLength } = require('validator')
const User = require('../models/User')
const Post = require('../models/Post')
const { clearImage, deletFile } = require('../utils/file-utils')

module.exports = {
    register: async (args, request) => {
        // Destructure input fields
        const { email, password, username } = args.credentials

        // Validate input fields
        const errors = []
        if(!isEmail(email)) {
            errors.push('E-mail is invalid')
        }

        if(isEmpty(password) || !isLength(password, { min: 6 })) {
            errors.push('Password with more than 6 characters is required')
        }

        if(errors.length > 0) {
            const error = new Error('Invalid input.');
            error.data = errors;
            error.code = 422;
            throw error;
        }

        // Check is User already exists
        const existingUser = await User.findOne({email})
        if(existingUser) {
            const error = new Error('User already exists')
            throw error
        }

        // Hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // Create User
        const newUser = new User({ username, email, password: hashedPassword})
        const createdUser = await newUser.save()

        return { ...createdUser._doc, _id: createdUser._id.toString() }
    },
    login: async (args, request) => {
        // Destructure input fields
        const { email, password } = args.credentials

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
        const token = jwt.sign(
            { userId: existingUser._id, email: existingUser.email, username: existingUser.username }, 
            process.env.JWT_AUTH_SECRET, 
            { expiresIn: +process.env.JWT_AUTH_EXPIRESIN }
        )

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
    user: async (args, req) => {
        console.log(req.userId)
        if (!req.isAuth) {
            const error = new Error('Not authenticated!');
            error.code = 401;
            throw error;
        }
        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error('No user found!');
            error.code = 404;
            throw error;
        }
        return { ...user._doc, _id: user._id.toString() };
    },
    updateStatus: async (args, req) => {
        if (!req.isAuth) {
            const error = new Error('Not authenticated!');
            error.code = 401;
            throw error;
        }
        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error('No user found!');
            error.code = 404;
            throw error;
        }
        user.status = args.status;
        await user.save();
        return { ...user._doc, _id: user._id.toString() };
    },
    createPost: async (args, req) => {
        if(!req.isAuth) {
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
        const existingUser = await User.findById(req.userId)
        if(!existingUser) {
            const error = new Error('Invalid user.')
            error.code = 401
            throw error
        }

        // Create Post
        const newPost = new Post({ title, content, imageUrl: imageUrl.replace('\\', '/'), creator: existingUser })
        const createdPost = await newPost.save()

        // Add post to users posts
        existingUser.posts.unshift(newPost)
        await existingUser.save()

        return { 
            ...createdPost._doc, 
            _id: createdPost._id.toString(), 
            createdAt: createdPost.createdAt.toISOString(),
            updatedAt: createdPost.updatedAt.toISOString(),
        }
    },
    updatePost: async (args, req) => {
        // Authenticate User
        if(!req.isAuth) {
            const error = new Error('You are not authenticated')
            error.code = 401
            throw error
        }

        // Check if post exists
        const existingPost = await Post.findById(args.postId).populate('creator', 'username')
        if(!existingPost) {
            const error = new Error('Post not found.')
            error.code = 404
            throw error
        }

        // Validate post creator
        if(existingPost.creator._id.toString() !== req.userId.toString()) {
            const error = new Error('Not authorized.')
            error.code = 403
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

        // Update Post
        existingPost.title = title
        existingPost.content = content
        if(imageUrl && imageUrl !== 'undefined') {
            existingPost.imageUrl = imageUrl 
        }
        const updatedPost = await existingPost.save()

        return {
            ...updatedPost._doc,
            _id: updatedPost._id.toString(),
            createdAt: updatedPost.createdAt.toISOString(),
            updatedAt: updatedPost.updatedAt.toISOString()
        };
    },
    deletePost: async (args, req) => {
        if(!req.isAuth) {
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
        if(existingPost.creator._id.toString() !== req.userId.toString()) {
            const error = new Error('Not authorized.')
            error.code = 403
            throw error
        }

        // Delete the attached image
        deletFile(existingPost.imageUrl)

        // Delete post
        await Post.findByIdAndRemove(args.postId)

        // Remove post from user
        const user = await User.findById(req.userId)
        user.posts.pull(args.postId)
        await user.save()

        return true
    },
    posts: async (args, req) => {
        if(!req.isAuth) {
            const error = new Error('You are not authenticated')
            error.code = 401
            throw error
        }

        const page = args.page || 1
        const limit = args.limit || 5
        const skip = (page - 1) * limit

        const count = await Post.find().countDocuments()
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('creator', 'username')

        return { 
            posts: posts.map(p => {
                return {
                    ...p._doc,
                    _id: p._id.toString(),
                    createdAt: p.createdAt.toISOString(),
                    updatedAt: p.updatedAt.toISOString()
                };
            }), 
            count 
        }
    },
    post: async (args, req) => {
        if(!req.isAuth) {
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

        return {
            ...post._doc,
            _id: post._id.toString(),
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString()
        }
    }
}