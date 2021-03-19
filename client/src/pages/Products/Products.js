import React, { Component, Fragment } from 'react'
import openSocket from 'socket.io-client'
import PostEdit from './ProductEdit/ProductEdit'
import PostItem from './ProductItem/ProductItem'
import Loader from '../../components/Loader/Loader'
import Paginator from '../../components/Paginator/Paginator'
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import './Products.css'

class Posts extends Component {
    state = {
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
        editLoading: false,
        socket: null
    }

    componentDidMount() {
        fetch('http://localhost:5000/api/v1/posts', { 
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.props.userCredentials.token}`
            }
        })
            .then(response => response.json())
            .then(responseData => {
                console.log(responseData)
                if(responseData.status === true) {
                  const { posts, count } = responseData.data
                  this.setState({ 
                    posts: { 
                      ...this.state.posts,
                      items: posts.map(post => {
                          return { ...post, imagePath: post.imageUrl }
                      }), 
                      count
                    }, 
                    postsLoading: false 
                  }, () => {
                    console.log(this.state)
                  })
                } else {
                  this.setState({ postsLoading: false, error: responseData.message })
                }
                
            })
            .catch(error => {
                console.log(error)
                this.setState({ postsLoading: false, error: error })
            })

            const socket = openSocket('http://localhost:5000')
            socket.on('posts', (data) => {
              console.log(data)
              if(data.action === 'create') {
                this.addPost(data.post)
              } else {
                this.updatePost(data.post)
              }
            })

            this.setState({ socket })
    }

    componentWillUnmount() {
      this.state.socket.close()
    }

    addPost = (post) => {
      this.setState(prevState => {
        const { items, count, currentPage, limit } = prevState.posts
        console.log('prevState', prevState)
        console.log(post)
        const updatedPosts = [...items];
        if (currentPage === 1) {
          if (items.length >= limit) {
            updatedPosts.pop();
          }
          updatedPosts.unshift(post);
        }
        return {
          posts: { ...prevState.posts, items: updatedPosts, count: count + 1 }
        };
      });
      
    }

    updatePost = (post) => {
      this.setState(prevState => {
        const updatedPosts = [...prevState.posts.items];
        const updatedPostIndex = updatedPosts.findIndex(p => p._id === post._id);
        if (updatedPostIndex > -1) {
          updatedPosts[updatedPostIndex] = post;
        }
        return {
          posts: {
            ...prevState.posts,
            items: updatedPosts
          }
        };
      });
    }


    loadPosts = direction => {
        if (direction) {
          this.setState({ postsLoading: true, posts: [] });
        }
        let page = this.state.posts.currentPage;
        if (direction === 'next') {
          page++;
          this.setState({ posts: page });
        }
        if (direction === 'previous') {
          page--;
          this.setState({ postPage: page });
        }
        
        fetch(`http://localhost:5000/api/v1/posts?page=${page}`)
          .then(res => {
            if (res.status !== 200) {
              throw new Error('Failed to fetch posts.');
            }
            return res.json();
          })
          .then(({ status, data, message }) => {
            if(status === true) {
              this.setState({ 
                posts: { items: data.posts, count: data.count },
                postsLoading: false
              });
            } else {
              this.setState({ postsLoading: false, error: message });
            }
          })
          .catch(this.catchError);
      };
    
      statusUpdateHandler = event => {
        event.preventDefault();
        fetch('URL')
          .then(res => {
            if (res.status !== 200 && res.status !== 201) {
              throw new Error("Can't update status!");
            }
            return res.json();
          })
          .then(resData => {
            console.log(resData);
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
        const formData = new FormData()
        formData.append('title', postData.title)
        formData.append('content', postData.content)
        formData.append('image', postData.image)
        
        const { editPost } = this.state

        let url = 'http://localhost:5000/api/v1/posts'
        let method = 'POST'
        
        if(editPost) {
          url = `http://localhost:5000/api/v1/posts/${editPost._id}`
          method = 'PUT'
        }

        this.setState({ editLoading: true });

        // Set up data (with image!)
        fetch(url , {
          method,
          headers: {
            'Authorization': `Bearer ${this.props.userCredentials.token}`
          },
          body: formData
        })
          .then(response => response.json())
          .then(({ status, data, message }) => {
            console.log(status, data, message)
            if(status === true) {
              const { _id, title, content, createdAt, imageUrl } = data.post;
              const post = { _id, title, content, creator: data.creator, createdAt, imageUrl };

              this.setState(prevState => {
                const { posts, editPost } = prevState
                const { items, count, limit, currentpage  } = posts
                let updatedItems = [...items];
                let itemCount = count
                if (editPost) {
                  const postIndex = items.findIndex(p => p._id === editPost._id);
                  updatedItems[postIndex] = post;
                // } else if (posts.length < 2) {
                } else {
                // itemCount = ()
                //   updatedItems = items.concat(post);
                }
                
                return { 
                  posts: { 
                    ...posts, 
                    items: updatedItems,
                  }, 
                  isEditing: false, 
                  editPost: null, 
                  editLoading: false 
                };
              });
            } else {
              this.setState({ isEditing: false, editPost: null, editLoading: false, error: message });
            }
            
          })
          .catch(err => {
            console.log(err);
            this.setState({ isEditing: false, editPost: null, editLoading: false, error: err });
          });
      };
    
      statusInputChangeHandler = (input, value) => {
        this.setState({ status: value });
      };
    
      deletePostHandler = postId => {
        this.setState({ postsLoading: true });
        fetch(`http://localhost:5000/api/v1/posts/${postId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.props.userCredentials.token}`
          }
        })
          .then(res => res.json())
          .then(responseData => {
            console.log(responseData);
            if(responseData.status === true) {
              this.setState(prevState => {
                const updatedPosts = prevState.posts.items.filter(p => p._id !== postId);
                return { posts: { 
                  ...prevState.posts,
                  items:  updatedPosts
                }, postsLoading: false };
              });
            } else {
              this.setState({ postsLoading: false, error: responseData.message });
            }
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
        const { postsLoading, posts, error, isEditing, editLoading, editPost } = this.state
        console.log('render', this.state)

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
                      value={this.state.status}/>
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