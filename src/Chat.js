import React, { useEffect, useRef, useState } from "react";
import { db } from "./firebase";
import Message from "./Message";
import firebase from "firebase/compat/app";
import "./Chat.css";

function Chat() {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [roomId, setRoomId] = useState("");
    const [roomPassword, setRoomPassword] = useState("");
    const [currentRoom, setCurrentRoom] = useState(null);
    const [userRoomId, setUserRoomId] = useState("");
    const [userRoomPassword, setUserRoomPassword] = useState("");
    const [rooms, setRooms] = useState([]);
    const [lastRoomId, setLastRoomId] = useState(null);
    const [showCreateRoom, setShowCreateRoom] = useState(false);
    const [showJoinRoom, setShowJoinRoom] = useState(false);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [roomToDelete, setRoomToDelete] = useState(null);

    const endOfMessages = useRef(null);

    useEffect(() => {
        const fetchRooms = async () => {
            const user = firebase.auth().currentUser;
            if (user) {
                const roomsRef = db
                    .collection("users")
                    .doc(user.uid)
                    .collection("rooms");
                roomsRef.onSnapshot((snapshot) => {
                    setRooms(
                        snapshot.docs.map((doc) => ({
                            id: doc.id,
                            ...doc.data(),
                        }))
                    );
                });
            }
        };
        fetchRooms();
    }, []);

    useEffect(() => {
        if (currentRoom && currentRoom.id !== lastRoomId) {
            // Check if the room has changed
            const messagesRef = db
                .collection("rooms")
                .doc(currentRoom.id)
                .collection("messages")
                .orderBy("createdAt");
            messagesRef.onSnapshot((snapshot) => {
                setMessages(
                    snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
                );
            });
            setLastRoomId(currentRoom.id); // Update the last room ID
            console.log("roomed changed to: ", currentRoom);
        }
    }, [currentRoom, lastRoomId]);

    useEffect(() => {
        if (endOfMessages.current) {
            endOfMessages.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const toggleCreateRoom = () => {
        setShowCreateRoom(!showCreateRoom);
        setShowJoinRoom(false);
    };

    const toggleJoinRoom = () => {
        setShowJoinRoom(!showJoinRoom);
        setShowCreateRoom(false);
    };

    const createRoom = async () => {
        if (roomId && roomPassword) {
            const roomRef = db.collection("rooms").doc(roomId);
            const roomDoc = await roomRef.get();
            if (roomDoc.exists) {
                alert("Room ID already exists. Please choose another.");
                return;
            }

            await db
                .collection("rooms")
                .doc(roomId)
                .set({ password: roomPassword });
            const user = firebase.auth().currentUser;
            await db
                .collection("users")
                .doc(user.uid)
                .collection("rooms")
                .doc(roomId)
                .set({ roomId });
            setRoomId(roomId);
            setCurrentRoom({ id: roomId });

            db.collection("rooms")
                .doc(roomId)
                .collection("messages")
                .add({
                    user: user.uid,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    author: user.displayName,
                    message: `${user.displayName} has created the room`,
                });
            setRoomId("");
            setRoomPassword("");
        }
    };

    const openDeleteModal = (room) => {
        setRoomToDelete(room);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setRoomToDelete(null);
        setShowDeleteModal(false);
    };

    const confirmDeleteRoom = async () => {
        if (roomToDelete) {
            const user = firebase.auth().currentUser;

            const room = rooms.find((room) => room.id === roomToDelete.id);
            if (room && user) {
                db.collection("rooms")
                    .doc(roomToDelete.id)
                    .collection("messages")
                    .add({
                        user: user.uid,
                        createdAt:
                            firebase.firestore.FieldValue.serverTimestamp(),
                        author: user.displayName,
                        message: `${user.displayName} has left the room`,
                    });
            }

            await db
                .collection("users")
                .doc(user.uid)
                .collection("rooms")
                .doc(roomToDelete.id)
                .delete();
            setRooms(rooms.filter((room) => room.id !== roomToDelete.id));

            if (currentRoom && currentRoom.id === roomToDelete.id) {
                setCurrentRoom(null);
            }

            setShowDeleteModal(false);
        }
    };

    const joinRoom = async () => {
        const roomRef = db.collection("rooms").doc(userRoomId);
        const roomDoc = await roomRef.get();
        if (roomDoc.exists && roomDoc.data().password === userRoomPassword) {
            const user = firebase.auth().currentUser;
            await db
                .collection("users")
                .doc(user.uid)
                .collection("rooms")
                .doc(userRoomId)
                .set({ roomId: userRoomId });
            db.collection("rooms")
                .doc(userRoomId)
                .collection("messages")
                .add({
                    user: user.uid,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    author: user.displayName,
                    message: `${user.displayName} has joined the room`,
                });
            setCurrentRoom({ id: userRoomId });
            setUserRoomId("");
            setUserRoomPassword("");
        } else {
            alert("Invalid room ID or password");
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (currentRoom) {
            const user = firebase.auth().currentUser;
            const newMessage = {
                user: user.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                author: user.displayName,
                message,
            };
            await db
                .collection("rooms")
                .doc(currentRoom.id)
                .collection("messages")
                .add(newMessage);
            setMessages((prevMessages) => [
                ...prevMessages,
                { ...newMessage, createdAt: new Date() },
            ]);
            setMessage("");
        } else {
            alert("Please join a room first");
        }
    };

    const mapMessages = messages.map((msg, index) => {
        if (index === messages.length - 1) {
            return (
                <div ref={endOfMessages}>
                    <Message
                        key={msg.id}
                        uid={msg.user}
                        message={msg.message}
                        name={msg.author}
                    />
                </div>
            );
        } else {
            return (
                <div>
                    <Message
                        key={msg.id}
                        uid={msg.user}
                        message={msg.message}
                        name={msg.author}
                    />
                </div>
            );
        }
    });

    return (
        <div className="chat">
            <div className="sidebar">
                <div className="sidebar-buttons">
                    <div>
                        <button
                            onClick={toggleCreateRoom}
                            className="button-create"
                        >
                            Create Room
                        </button>
                        {showCreateRoom && (
                            <div className="room-selection">
                                <input
                                    type="text"
                                    placeholder="Room ID"
                                    value={roomId}
                                    onChange={(e) => setRoomId(e.target.value)}
                                />
                                <input
                                    type="password"
                                    placeholder="Room Password"
                                    value={roomPassword}
                                    onChange={(e) =>
                                        setRoomPassword(e.target.value)
                                    }
                                />
                                <button
                                    onClick={createRoom}
                                    disabled={!roomPassword || !roomId}
                                    className="button-submit"
                                >
                                    Create
                                </button>
                            </div>
                        )}
                    </div>
                    <div>
                        <button
                            onClick={toggleJoinRoom}
                            className="button-join"
                        >
                            Join Room
                        </button>
                        {showJoinRoom && (
                            <div className="room-selection">
                                <input
                                    type="text"
                                    placeholder="Room ID"
                                    value={userRoomId}
                                    onChange={(e) =>
                                        setUserRoomId(e.target.value)
                                    }
                                />
                                <input
                                    type="password"
                                    placeholder="Room Password"
                                    value={userRoomPassword}
                                    onChange={(e) =>
                                        setUserRoomPassword(e.target.value)
                                    }
                                />
                                <button
                                    onClick={joinRoom}
                                    disabled={!userRoomPassword || !userRoomId}
                                    className="button-submit"
                                >
                                    Join
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="room-list">
                    {rooms.map((room) => (
                        <div
                            onClick={() => setCurrentRoom(room)}
                            key={room.id}
                            className={`room-item ${
                                currentRoom && currentRoom.id === room.id
                                    ? "active"
                                    : ""
                            }`}
                        >
                            <div className="room-name">{room.roomId}</div>
                            <button
                                onClick={() => openDeleteModal(room)}
                                className="button-delete"
                            >
                                Leave
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            {currentRoom ? (
                <div className="chat-container">
                    <div className="room-header">
                        <h2>{currentRoom.id}</h2>
                    </div>
                    <div className="messages">{mapMessages}</div>
                    <div className="chat-form">
                        <form onSubmit={sendMessage}>
                            <input
                                type="text"
                                className="input-text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type message here"
                            />
                            <button
                                type="submit"
                                className="button-send"
                                disabled={!message}
                            >
                                Send
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="welcome-message">
                    Welcome! Join or create a room to start chatting.
                </div>
            )}
            {showDeleteModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>
                            Are you sure you want to leave {roomToDelete.roomId}
                            ?
                        </h3>
                        <div className="modal-buttons">
                            <button
                                onClick={confirmDeleteRoom}
                                className="button-delete-yes"
                            >
                                Yes
                            </button>
                            <button
                                onClick={closeDeleteModal}
                                className="button-delete-no"
                            >
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Chat;
