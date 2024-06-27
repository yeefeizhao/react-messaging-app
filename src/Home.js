import React from "react";
import "./Home.css";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";
import { Link } from "react-router-dom";

function Home() {
    const [user] = useAuthState(auth);
    return (
        <div className="home">
            <div className="home-container">
                <h2 className="home-title">
                    Welcome to &#123; Express Chat &#125;
                </h2>
                <p className="home-desc">Quick and easy chatting</p>
                <Link to={user ? "/chat" : "/login"}>
                    <button className="button-home">Start here</button>
                </Link>
            </div>
        </div>
    );
}

export default Home;
