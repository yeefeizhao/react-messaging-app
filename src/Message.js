import React from 'react';
import './Message.css';
import { auth } from './firebase.js'

function Message({ uid, message, name }) {
    const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

    return (
        <div className={`message ${messageClass}`}>
            <div className="author">{name}</div>
            <div className="content">{message}</div>
        </div>
    );
}

export default Message;
