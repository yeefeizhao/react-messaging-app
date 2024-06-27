import firebase from "firebase/compat/app";
import { collection, addDoc, where, query, getDocs } from "firebase/firestore";

import "firebase/compat/auth";
import "firebase/compat/firestore";

const firebaseConfig = {
    
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
