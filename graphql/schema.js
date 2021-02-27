const { buildSchema } = require('graphql')

module.exports = buildSchema(`
    type RootQuery {
        posts: [Post]!
    }

    type RootMutation {
        createUser(user: CreateUserInput): User!
    }

    type User {
        _id: ID!
        username: String!
        email: String!
        password: String!
        status: String!
        posts: [Post]!
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

    input CreateUserInput {
        username: String!
        email: String!
        password: String!
    }

    schema {
        query: RootQuery,
        mutation: RootMutation
    }
`)