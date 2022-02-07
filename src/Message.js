import React from 'react';
import { auth } from './firebase';
import './Message.css'

function Message({uid, message, name}) {
    const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

    return (
        <div className={`message${messageClass}`}>
            <div className='message_box'>
                <p className='message_sender'>{name}</p>
                <p className='message_msg'>{message}</p>
            </div>
            
        </div>
    )
}

export default Message;
