const { buildSchema } = require('graphql')

module.exports = buildSchema(`
    type RootQuery {
        login(credentials: LoginInput): LoggedInUser!
        posts(page: Int, limit: Int): PostData!
        post(postId: ID!): Post
        hello: String
        user: User!
    }

    type RootMutation {
        register(credentials: CreateUserInput): User!
        createUser(user: CreateUserInput): User!
        createPost(post: PostInput): Post!
        updatePost(postId: ID!, post: PostInput): Post!
        deletePost(postId: ID!): Boolean
        updateStatus(status: String!): User!
    }

    type User {
        _id: ID!
        username: String!
        email: String!
        password: String!
        status: String!
        posts: [Post]!
    }

    type LoggedInUser {
        token: String!
        userId: ID!
    }

    type Post {
        _id: ID!
        title: String!
        content: String!
        createdAt: String!
        updatedAt: String
        creator: User!
        imageUrl: String!
    }

    type PostData {
        posts: [Post]!
        count: Int!
    }

    input CreateUserInput {
        username: String!
        email: String!
        password: String!
    }

    input PostInput {
        title: String!
        content: String!
        imageUrl: String!
    }

    input RegisterInput {
        username: String!
        email: String!
        password: String!
    }

    input LoginInput {
        email: String!
        password: String!
    }

    schema {
        query: RootQuery,
        mutation: RootMutation
    }
`)