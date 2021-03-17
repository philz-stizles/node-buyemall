import React from 'react';

import Button from '../../../components/Button/Button';
import './PostItem.css';

const PostItem = ({ post: { _id, title, content, imageUrl, creator, createdAt }, onDelete, onStartEdit }) => (
  <article className="post">
    <header className="post__header">
      <h3 className="post__meta">Posted by {creator.username} on {new Date(createdAt).toLocaleDateString('en-US')}</h3>
      <h1 className="post__title">{title}</h1>
    </header>
    {/* <div className="post__image">
      <Image imageUrl={image} contain />
    </div>
    <div className="post__content">{content}</div> */}
    <div className="post__actions">
      <Button mode="flat" link={_id}>View</Button>
      <Button mode="flat" onClick={onStartEdit}>Edit</Button>
      <Button mode="flat" design="danger" onClick={onDelete}>Delete</Button>
    </div>
  </article>
);

export default PostItem;
