import React, { Component, Fragment } from 'react'
import PostEdit from '../../components/Feed/PostEdit/PostEdit'
import PostItem from '../../components/Feed/PostItem/PostItem'
import Loader from '../../components/Loader/Loader'
import Paginator from '../../components/Paginator/Paginator'
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import './Posts.css'

class Posts extends Component {
    state = {
        posts: {
            items: [],
            count: 0,
            currentPage: 1
        },
        currentPage: 1,
        postsLoading: true
    }

    componentDidMount() {
        const graphqlQuery = {
            query: `
                query {
                    posts {
                        posts {
                            _id
                            title
                            content
                            createdAt
                            creator {
                                username
                            }
                            imageUrl
                        }
                        count
                    }
                }
            `
        }

        fetch('http://localhost:8009/api/v1/posts', { 
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${this.props.userCredentials.token}`
            }
        })
            .then(response => response.json())
            .then(responseData => {
                console.log(responseData)
                if(responseData.errors) {
                    
                }
                
                const { posts, count } = responseData.data
                this.setState({ posts: { items: posts, count  }, postsLoading: false })
            })
            .catch(error => {
                console.log(error)
                this.setState({ postsLoading: false })
            })
    }

    loadPosts = direction => {
        if (direction) {
          this.setState({ postsLoading: true, posts: [] });
        }
        let page = this.state.postPage;
        if (direction === 'next') {
          page++;
          this.setState({ postPage: page });
        }
        if (direction === 'previous') {
          page--;
          this.setState({ postPage: page });
        }
        fetch('URL')
          .then(res => {
            if (res.status !== 200) {
              throw new Error('Failed to fetch posts.');
            }
            return res.json();
          })
          .then(resData => {
            this.setState({
              posts: resData.posts,
              totalPosts: resData.totalItems,
              postsLoading: false
            });
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
          const loadedPost = { ...prevState.posts.find(p => p._id === postId) };
    
          return {
            isEditing: true,
            editPost: loadedPost
          };
        });
      };
    
      cancelEditHandler = () => {
        this.setState({ isEditing: false, editPost: null });
      };
    
      finishEditHandler = postData => {
        this.setState({
          editLoading: true
        });
        // Set up data (with image!)
        let url = 'URL';
        if (this.state.editPost) {
          url = 'URL';
        }
    
        fetch(url)
          .then(res => {
            if (res.status !== 200 && res.status !== 201) {
              throw new Error('Creating or editing a post failed!');
            }
            return res.json();
          })
          .then(resData => {
            const post = {
              _id: resData.post._id,
              title: resData.post.title,
              content: resData.post.content,
              creator: resData.post.creator,
              createdAt: resData.post.createdAt
            };
            this.setState(prevState => {
              let updatedPosts = [...prevState.posts];
              if (prevState.editPost) {
                const postIndex = prevState.posts.findIndex(
                  p => p._id === prevState.editPost._id
                );
                updatedPosts[postIndex] = post;
              } else if (prevState.posts.length < 2) {
                updatedPosts = prevState.posts.concat(post);
              }
              return {
                posts: updatedPosts,
                isEditing: false,
                editPost: null,
                editLoading: false
              };
            });
          })
          .catch(err => {
            console.log(err);
            this.setState({
              isEditing: false,
              editPost: null,
              editLoading: false,
              error: err
            });
          });
      };
    
      statusInputChangeHandler = (input, value) => {
        this.setState({ status: value });
      };
    
      deletePostHandler = postId => {
        this.setState({ postsLoading: true });
        fetch('URL')
          .then(res => {
            if (res.status !== 200 && res.status !== 201) {
              throw new Error('Deleting a post failed!');
            }
            return res.json();
          })
          .then(resData => {
            console.log(resData);
            this.setState(prevState => {
              const updatedPosts = prevState.posts.filter(p => p._id !== postId);
              return { posts: updatedPosts, postsLoading: false };
            });
          })
          .catch(err => {
            console.log(err);
            this.setState({ postsLoading: false });
          });
      };
    
      errorHandler = () => {
        this.setState({ error: null });
      };
    
      catchError = error => {
        this.setState({ error: error });
      };

    render() {
        const { postsLoading, posts, currentPage } = this.state
        return (
            <Fragment>
                <PostEdit
                  editing={this.state.isEditing}
                  selectedPost={this.state.editPost}
                  loading={this.state.editLoading}
                  onCancelEdit={this.cancelEditHandler}
                  onFinishEdit={this.finishEditHandler}/>
                  
            <section className="feed__status">
              <form onSubmit={this.statusUpdateHandler}>
                <Input
                  type="text"
                  placeholder="Your status"
                  control="input"
                  onChange={this.statusInputChangeHandler}
                  value={this.state.status}
                />
                <Button mode="flat" type="submit">
                  Update
                </Button>
              </form>
            </section>
            <section className="feed__control">
              <Button mode="raised" design="accent" onClick={this.newPostHandler}>
                New Post
              </Button>
            </section>
                <section className="feed">
                    {postsLoading && <div style={{ textAlign: 'center', marginTop: '2rem' }}><Loader /></div>}
                    {posts.items.length <= 0 && !postsLoading ? (<p style={{ textAlign: 'center' }}>No posts found.</p>) : null}
                    {!postsLoading && (
                        <Paginator
                            onPrevious={this.loadPosts.bind(this, 'previous')}
                            onNext={this.loadPosts.bind(this, 'next')}
                            lastPage={Math.ceil(posts.count / 2)}
                            currentPage={currentPage}>
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