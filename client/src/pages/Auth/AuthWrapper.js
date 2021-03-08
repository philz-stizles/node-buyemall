import React from 'react';

import './AuthWrapper.css';

const authWrapper = props => <section className="auth-form">{props.children}</section>;

export default authWrapper;