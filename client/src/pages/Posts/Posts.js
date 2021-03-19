import React, { Component, Fragment } from 'react'
import PostEdit from './PostEdit/PostEdit'
import PostItem from './PostItem/PostItem'
import Loader from '../../components/Loader/Loader'
import Paginator from '../../components/Paginator/Paginator'
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import './Posts.css'

class Posts extends Component {
    state = {
      status: '',
      posts: {
          items: [],
          count: 0,
          currentPage: 1,
          limit: 5
      },
      postsLoading: true,
      error: null,
      isEditing: false,
      editPost: null,
      editLoading: false
    }

    componentDidMount() {
      const graphqlQuery = {
        query: `
          query {
            user {
              status
            }
          }
        `
      };
      fetch('http://localhost:5000/graphql', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.props.userCredentials.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(graphqlQuery)
      })
        .then(res => res.json())
        .then(responseData => {
          console.log(responseData)
          if (responseData.errors) {
            throw new Error('Fetching status failed!');
          }
          this.setState({ status: responseData.data.user.status });
        })
        .catch(this.catchError);

      this.loadPosts();
    }

    loadPosts = direction => {
      const { posts } = this.state
      const { limit } = posts
        if (direction) {
          this.setState({ postsLoading: true, posts: { ...posts, items: [] } });
        }

        let page = posts.currentPage;

        if (direction === 'next') {
          page++;
          this.setState({ posts: { ...posts, items: [], currentPage: page } });
        }

        if (direction === 'previous') {
          page--;
          this.setState({ posts: { ...posts, currentPage: page } });
        }

        console.log(page)

        const graphqlQuery = {
          query: `
            query {
              posts(page: ${page}, limit: ${limit}) {
                posts {
                  _id
                  title
                  content
                  imageUrl
                  creator {
                    username
                  }
                  createdAt
                }
                count
              }
            }
          `
        }

        fetch(`http://localhost:5000/graphql`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.props.userCredentials.token}`
          },
          body: JSON.stringify(graphqlQuery)
        })
          .then(res => res.json())
          .then(responseData => {
            if(responseData.errors) {
              throw new Error('Fetching posts failed')
            } 

            this.setState({ 
              posts: { 
                ...posts, 
                items: responseData.data.posts.posts.map(post => {
                  return { ...post, imagePath: post.imageUrl }
                }), 
                count: responseData.data.posts.count, 
                currentPage: page 
              },
              postsLoading: false
            });
          })
          .catch(this.catchError);
      };
    
      statusUpdateHandler = event => {
        event.preventDefault();

        const graphqlQuery = {
          query: `
            mutation {
              updateStatus(status: "${this.state.status}") {
                status
              }
            }
          `
        }

        fetch('http://localhost:5000/graphql', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.props.userCredentials.token}`
              },
              body: JSON.stringify(graphqlQuery)
            })
          .then(res => res.json())
          .then(responseData => {
            if (responseData.errors) {
              throw new Error('Create post failed!');
            }
            console.log(responseData);
          })
          .catch(this.catchError);
      };

    newPostHandler = () => {
        this.setState({ isEditing: true });
    };
    
    startEditPostHandler = postId => {
      this.setState(prevState => {
        const loadedPost = { ...prevState.posts.items.find(p => p._id === postId) };
  
        return { isEditing: true, editPost: loadedPost };
      });
    };
    
      cancelEditHandler = () => {
        this.setState({ isEditing: false, editPost: null });
      };
    
      finishEditHandler = postData => {
        console.log(postData)
        const { title, content, image } = postData

        const formData = new FormData()
        formData.append('image', image)
        
        const { editPost } = this.state
        if(editPost) {
          formData.append('oldPath', editPost.imagePath)
        }

        this.setState({ editLoading: true });

        fetch('http://localhost:5000/upload', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${this.props.userCredentials.token}`
          },
          body: formData
        })
          .then(res => res.json())
          .then(fileResponseData => {
            const imageUrl = fileResponseData.filePath || 'undefined';
            let graphqlQuery = {
              query: `
              mutation CreatePost($title: String!, $content: String!, $imageUrl: String!) {
                createPost(post: {title: $title, content: $content, imageUrl: $imageUrl}) {
                  _id
                  title
                  content
                  imageUrl
                  creator {
                    username
                  }
                  createdAt
                }
              }
            `,
              variables: { title, content, imageUrl }
            };
            
            if (editPost) {
              graphqlQuery = {
                query: `
                  mutation UpdatePost($postId: ID!, $title: String!, $content: String!, $imageUrl: String!) {
                    updatePost(postId: $postId, post: {title: $title, content: $content, imageUrl: $imageUrl}) {
                      _id
                      title
                      content
                      imageUrl
                      creator {
                        username
                      }
                      createdAt
                    }
                  }
                `,
                variables: { postId: editPost._id, title, content, imageUrl }
              };
            }

            // Set up data (with image!)
            fetch('http://localhost:5000/graphql', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.props.userCredentials.token}`
              },
              body: JSON.stringify(graphqlQuery)
            })
              .then(response => response.json())
              .then((responseData) => {
                if (responseData.errors && responseData.errors[0].status === 422) {
                  throw new Error(
                    "Validation failed. Make sure the email address isn't used yet!"
                  );
                }

                if (responseData.errors) {
                  throw new Error('Create post failed!');
                }

                let responseDataField = 'createPost';
                if (editPost) {
                  responseDataField = 'updatePost';
                }

                const { _id, title, content, createdAt, imageUrl, creator } = responseData.data[responseDataField];
                const post = { _id, title, content, creator, createdAt, imagePath: imageUrl };

                this.setState(prevState => {
                  const { posts, editPost } = prevState
                  const { items, count } = posts
                  let updatedPosts = [...items];
                  let updatedCount = count;

                  if (editPost) {
                    const postIndex = items.findIndex(p => p._id === editPost._id);
                    updatedPosts[postIndex] = post;
                  } else {
                    updatedCount++;
                    if (prevState.posts.length >= 2) {
                      updatedPosts.pop();
                    }
                    updatedPosts.unshift(post);
                  }

                  return { posts: {
                    ...posts,
                    items: updatedPosts,
                    count: updatedCount
                  }, isEditing: false, editPost: null, editLoading: false };
                });
              })
              .catch(err => {
                console.log(err);
                this.setState({ isEditing: false, editPost: null, editLoading: false, error: err });
              });
          });
      }
    
      statusInputChangeHandler = (input, value) => {
        this.setState({ status: value });
      };
    
      deletePostHandler = postId => {
        this.setState({ postsLoading: true });

        const graphqlQuery = {
          query: `
            mutation DeletePost($postId: ID!) {
              deletePost(postId: $postId)
            }
          `,
          variables: { postId }
        };

        fetch(`http://localhost:5000/graphql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.props.userCredentials.token}`
          },
          body: JSON.stringify(graphqlQuery)
        })
          .then(res => res.json())
          .then(responseData => {
            if (responseData.errors) {
              throw new Error('Deleting the post failed!');
            }
            
            this.loadPosts()
              // this.setState(prevState => {
              //   const updatedPosts = prevState.posts.items.filter(p => p._id !== postId);
              //   return { posts: { 
              //     ...prevState.posts,
              //     items:  updatedPosts
              //   }, postsLoading: false };
              // });
          })
          .catch(err => {
            console.log(err);
            this.setState({ postsLoading: false, error: err });
          });
      };
    
      errorHandler = () => {
        this.setState({ error: null });
      };
    
      catchError = error => {
        this.setState({ error: error });
      };

    render() {
        const { status, postsLoading, posts, error, isEditing, editLoading, editPost } = this.state
  
        if(error) {
          return <h1>An error occured</h1>
        }

        return (
            <Fragment>
                <PostEdit editing={isEditing} selectedPost={editPost} loading={editLoading}
                  onCancelEdit={this.cancelEditHandler}
                  onFinishEdit={this.finishEditHandler}/>
                  
                <section className="feed__status">
                  <form onSubmit={this.statusUpdateHandler}>
                    <Input type="text" placeholder="Your status" control="input" 
                      onChange={this.statusInputChangeHandler}
                      value={status}/>
                    <Button mode="flat" type="submit">Update</Button>
                  </form>
                </section>

                <section className="feed__control">
                  <Button mode="raised" design="accent" onClick={this.newPostHandler}>New Post</Button>
                </section>

                <section className="feed">
                    {postsLoading && <div style={{ textAlign: 'center', marginTop: '2rem' }}><Loader /></div>}
                    {posts.items.length <= 0 && !postsLoading ? (<p style={{ textAlign: 'center' }}>No posts found.</p>) : null}
                    {!postsLoading && (
                        <Paginator
                            onPrevious={this.loadPosts.bind(this, 'previous')}
                            onNext={this.loadPosts.bind(this, 'next')}
                            lastPage={Math.ceil(posts.count / 5)}
                            currentPage={posts.currentPage}>
                            {posts.items.map(post => (
                                <PostItem key={post._id} post={post}
                                    onStartEdit={this.startEditPostHandler.bind(this, post._id)}
                                    onDelete={this.deletePostHandler.bind(this, post._id)}
                                />
                            ))}
                        </Paginator>
                    )}
                </section>
            </Fragment>
        )
    }
}

export default Posts