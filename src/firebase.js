import firebase from "firebase/compat/app";
import { collection, addDoc, where, query, getDocs } from "firebase/firestore";

import "firebase/compat/auth";
import "firebase/compat/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyA18nRbag6vfqaMdHVpsSsLSD9QzaZu95Q",
    authDomain: "expchats.firebaseapp.com",
    projectId: "expchats",
    storageBucket: "expchats.appspot.com",
    messagingSenderId: "700603528702",
    appId: "1:700603528702:web:f02b695324facbf1f37caf",
    measurementId: "G-7LGZK4N73G",
};

const app = firebase.initializeApp(firebaseConfig);
const auth = app.auth();
const db = app.firestore();
const provider = new firebase.auth.GoogleAuthProvider();

provider.setCustomParameters({ prompt: "select_account" });

const signInWithGoogle = async () => {
    const res = await auth.signInWithPopup(provider);
    const user = res.user;
    const userRef = collection(db, "users");
    const result = await getDocs(query(userRef, where("uid", "==", user.uid)));
    if (result.empty) {
        await addDoc(collection(db, "users"), {
            uid: user.uid,
            name: user.displayName,
            email: user.email,
        });
    }
};

const signOut = () => {
    auth.signOut();
};

export { signInWithGoogle, signOut, auth, db };
export default firebase;
