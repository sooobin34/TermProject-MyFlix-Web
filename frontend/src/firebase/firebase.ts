import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBiIJWtjSFb4LMKU8FPVUPKMja0IBhmJI8",
    authDomain: "termproject-myflix.firebaseapp.com",
    projectId: "termproject-myflix",
    storageBucket: "termproject-myflix.firebasestorage.app",
    messagingSenderId: "73089780960",
    appId: "1:73089780960:web:dea47804e1d53830475485"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
