import React, { Component } from 'react';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { required, length, email } from '../../utils/validators';
import AuthWrapper from './AuthWrapper';

class Signup extends Component {
    state = {
        signupForm: {
            email: {
                value: '',
                valid: false,
                touched: false,
                validators: [required, email]
            },
            password: {
                value: '',
                valid: false,
                touched: false,
                validators: [required, length({ min: 5 })]
            },
            username: {
                value: '',
                valid: false,
                touched: false,
                validators: [required]
            },
            formIsValid: false
        }
    }

    inputChangeHandler = (input, value) => {
        this.setState(prevState => {
        let isValid = true;
        for (const validator of prevState.signupForm[input].validators) {
            isValid = isValid && validator(value);
        }
        const updatedForm = {
            ...prevState.signupForm,
            [input]: {
            ...prevState.signupForm[input],
            valid: isValid,
            value: value
            }
        };
        let formIsValid = true;
        for (const inputName in updatedForm) {
            formIsValid = formIsValid && updatedForm[inputName].valid;
        }
        return {
            signupForm: updatedForm,
            formIsValid: formIsValid
        };
        });
    };

    inputBlurHandler = input => {
        this.setState(prevState => {
        return {
            signupForm: {
            ...prevState.signupForm,
            [input]: {
                ...prevState.signupForm[input],
                touched: true
            }
            }
        };
        });
    }

    render() {
        const { loading, onSignup } = this.props
        const { username, email, password } = this.state.signupForm

        return (
            <AuthWrapper>
                <form onSubmit={e => onSignup(e, this.state)}>
                    <Input
                        id="email"
                        label="Your E-Mail"
                        type="email"
                        control="input"
                        onChange={this.inputChangeHandler}
                        onBlur={this.inputBlurHandler.bind(this, 'email')}
                        value={email.value}
                        valid={email.valid}
                        touched={email.touched} />

                    <Input
                        id="username"
                        label="Your Name"
                        type="text"
                        control="input"
                        onChange={this.inputChangeHandler}
                        onBlur={this.inputBlurHandler.bind(this, 'username')}
                        value={username.value}
                        valid={username.valid}
                        touched={username.touched} />

                    <Input
                        id="password"
                        label="Password"
                        type="password"
                        control="input"
                        onChange={this.inputChangeHandler}
                        onBlur={this.inputBlurHandler.bind(this, 'password')}
                        value={password.value}
                        valid={password.valid}
                        touched={password.touched} />
                        
                    <Button design="raised" type="submit" loading={loading}>Signup</Button>
                </form>
            </AuthWrapper>
        )
    }
}

export default Signup;
