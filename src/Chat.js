import React, { useEffect, useState } from 'react';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { db } from './firebase';
import Message from './Message';
import firebase from 'firebase/compat/app';
import './Chat.css'


function Chat() {
    const messagesRef = db.collection('messages');
    const q = messagesRef.orderBy('createdAt')
    const [message, setMessage] = useState('')
    const [messages] = useCollectionData(q, {idField: 'id'});

    //const [messages, setMessages] = useState([]);

    /*useEffect(() => {
        db
        .collection('messages')
        .orderBy('createdAt', 'ascending')
        .onSnapshot(snapshot => (
            setMessages(snapshot.docs.map(doc => ({
                data: doc.data()
            })))
        ))
    }, []) */
        

    const sendMessage = async (e) => {
        e.preventDefault()
        const user = firebase.auth().currentUser;
        await messagesRef.add({
            user: user.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            author: user.displayName,
            message
        });
        setMessage('')
    }

    return (
        <div className='chat'>
            <div className='chat_container'>
                <div className='messages'>
                    {messages?.map(msg => (
                        <Message 
                            uid={msg.user} 
                            message={msg.message} 
                            name={msg.author}
                        />
                    ))}
                </div>
                <div className='chat_form'>
                    <form onSubmit={sendMessage}>
                        <input type='text' className='input-text' value={message} onChange={e => setMessage(e.target.value)} placeholder='type message here'/>

                        <button type='submit' className='button-5' disabled={!message}>
                            Send
                        </button>
                    </form>
                </div>
                
            </div>
        </div>
    )
}

export default Chat;
