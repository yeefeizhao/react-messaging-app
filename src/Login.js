import React, { useEffect } from 'react';
import { auth, signInWithGoogle } from './firebase'
import { useNavigate } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth';
import './Login.css'

function Login() {
    const navigate = useNavigate()
    const [user] = useAuthState(auth)
  
    useEffect(() => {
      if (user) {
        navigate('/chat')
      } 
    })

    return (
        <div className='login'>
            <div className='container'>
                <h2 className='login_title'>&#123; Log In &#125;</h2>
                <button className='button-28' onClick={signInWithGoogle}>Log In With Google</button>
            </div>
        </div>
    )
}

export default Login;
