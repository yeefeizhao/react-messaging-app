import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Link } from 'react-router-dom';
import { auth, signOut } from './firebase'
import './Header.css'

function Header() {
    const [user] = useAuthState(auth)

    return (
        <div className='header'>
            <div className='nav'>
                <h2 className='header_title'>&#123; Express Chat &#125;</h2>
                <div className='header_text'>
                    <Link className='nav_link' to='/'>
                        <p>
                            Home
                        </p>
                    </Link>
                    <Link className='nav_link' to={user ? '/chat' : '/login'}>
                        <p>
                            Chat
                        </p>
                    </Link>
                    <Link className='nav_link' to={!user && '/login'} onClick={signOut}>
                        <p>
                            {user ? 'Sign Out' : 'Login'}
                        </p>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Header;

