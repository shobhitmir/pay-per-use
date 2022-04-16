import React, { useRef } from 'react'
import { auth } from '../firebase'
import './SignupScreen.css'
import firebase from 'firebase/compat/app';

function SignupScreen() {
 const emailRef = useRef(null)
 const passwordRef = useRef(null)

  const register = (e) => {
      e.preventDefault()
      auth.createUserWithEmailAndPassword(
          emailRef.current.value,
          passwordRef.current.value
      ).then((authUser) => {
        
      })
      .catch((error) => {
          alert(error.message)
      })
  }

  const signIn = (e) => {
        e.preventDefault()

        auth.signInWithEmailAndPassword(
            emailRef.current.value,
            passwordRef.current.value
        ).then((authUser) => {
            
        }).catch((error) => alert(error.message))
  }

  const resetPassword = (e) => 
  {
    e.preventDefault()
    const email = emailRef.current.value
    firebase.auth().sendPasswordResetEmail(email)
        .then(function () {
            alert('Please check your email to reset password...')
        }).catch(function (error) {
            alert(error)
        }) 
    }

  return (
    <div className='signupScreen'>
        <form>
            <h1>Sign In</h1>
            <input ref = {emailRef} placeholder='Email' type="email" />
            <input ref = {passwordRef} placeholder='Password' type="password" />
            <button type="submit" onClick={signIn}>Sign In</button>
            <button type="submit" onClick={register}>Register</button>
            <h4>
            <span className="signupScreen__gray">Forgot Password? </span>
            <span className='signupScreen__link' onClick={resetPassword}>Reset Now.</span></h4>
        </form>
    </div>
  )
}

export default SignupScreen