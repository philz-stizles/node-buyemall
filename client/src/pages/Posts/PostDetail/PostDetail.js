import React, { Component } from 'react';

import Image from '../../../components/Image/Image';
import './PostDetail.css';

class PostDetail extends Component {
    state = {
        title: '',
        author: '',
        date: '',
        image: '',
        content: ''
    };

    componentDidMount() {
        const postId = this.props.match.params.postId;
        fetch(`http://localhost:5000/api/v1/posts/${postId}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${this.props.userCredentials.token}`
            }
        })
        .then(response => response.json())
        .then(responseData => {
            if (responseData.status === true) {
                this.setState({
                    title: responseData.data.title,
                    author: responseData.data.creator.username,
                    image: 'http://localhost:5000/' + responseData.data.imageUrl,
                    date: new Date(responseData.data.createdAt).toLocaleDateString('en-US'),
                    content: responseData.data.content
                });
            } else {
                throw new Error('Fetching post failed!');
            }
        })
        .catch(err => {
            console.log(err);
        });
    }

    render() {
        const { title, content, date, image, author } = this.state
        return (
            <section className="single-post">
                <h1>{title}</h1>
                <h2>Created by {author} on {date}</h2>
                <div className="single-post__image">
                    <Image contain imageUrl={image} />
                </div>
                <p>{content}</p>
            </section>
        );
    }
}

export default PostDetail;
