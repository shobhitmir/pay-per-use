import React, { useState } from 'react'
import './LoginScreen.css'
import SignupScreen from './SignupScreen';

function LoginScreen() {
    const [signIn, setSignIn] = useState(false);

  return (
    <div className='loginScreen'>
    <div className='loginScreen__background'>
        <img
        onClick={() => setSignIn(false)}
        className='loginScreen__logo'
        src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg"
        alt="Netflix Logo" />

        <button 
        className='loginScreen__button'
        onClick={() => setSignIn(true)}
        >
            Sign In
        </button>

        <div className='loginScreen__gradient' />
    </div>

    <div className="loginScreen__body">
        {signIn ? (
            <SignupScreen />
        ) :
        (
        <>
        <h1>Unlimited films, TV programs and more.</h1>
        <h2>Watch anywhere, Cancel at any time.</h2>
        <h3>Ready to watch? Enter your email to create or restart your membership.</h3>

        <div className='loginScreen__input'>
        <form>
            <button type="button" onClick={() => setSignIn(true)}
            className="loginScreen__getStarted">GET STARTED</button>
        </form>
        </div>
        </>
        )}
    </div>
    </div>
  )
}

export default LoginScreen