import React, { useContext, useEffect, useState } from 'react'
import { app, auth, authAdmin, storage } from '../components/utils/firebase'
import { confirmPasswordReset, createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getDownloadURL, ref, uploadBytes, uploadString } from "firebase/storage";
import { useScreenshot } from 'use-react-screenshot';
import { collection, getFirestore, addDoc } from 'firebase/firestore';
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

const AuthContext = React.createContext();

export function useAuth() {
    return useContext(AuthContext)
}

export function AuthProvider({children}) {
    const [currentUser, setCurrentUser] = useState();
    const [currentUserInfo, setCurrentUserInfo] = useState();
    const [currentRole, setCurrentRole] = useState();
    const [emailMessage, setEmailMessage] = useState();
    const [passExpirationDays, setPassExpirationDays] = useState();
    const [loading, setLoading] = useState(true);
    const [resetUser, setResetUser] = useState();
    const [resetEmail, setResetEmail] = useState();
    const [questionOne, setQuestionOne] = useState("");
    const [questionTwo, setQuestionTwo] = useState("");
    const [questionOneAnswer, setQuestionOneAnswer] = useState("");
    const [questionTwoAnswer, setQuestionTwoAnswer] = useState("");
    const [image, takeScreenShot] = useScreenshot({type: "image/jpeg", quality: 1.0});
    const db = getFirestore(app);
    const serverStamp = firebase.firestore.Timestamp
    

    function signup(email, password) {
        return createUserWithEmailAndPassword(auth, email, password)
    }

    function signupAdmin(email, password) {
        return createUserWithEmailAndPassword(authAdmin, email, password)
    }

    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password)
    }

    function logout() {
        return auth.signOut();
    }

    function logoutAdmin() {
        return authAdmin.signOut();
    }

    function forgotPassword(email) {
        return sendPasswordResetEmail(auth, email)
    }

    function resetPassword(oobCode, newPassword) {
        return confirmPasswordReset(auth, oobCode, newPassword)
    }

    async function upload(file, currentUser, setLoading) {
        // eslint-disable-next-line
        const fileRef = ref(storage, currentUser.displayName + '/' + 'ProfilePicture.png');
      
        setLoading(true);
        
        await uploadBytes(fileRef, file);
        const photoURL = await getDownloadURL(fileRef);
      
        updateProfile(currentUser, {photoURL});
        
        setLoading(false);
        alert("Uploaded file!");
      }
    
    function sendEmail(emailTo, subject, body) { 
        return window.Email.send({
            SecureToken : "ce629ac7-e05d-45c6-b41e-943099ad36ef",
            To : emailTo,
            From : "teamjest4713@gmail.com",
            Subject : subject,
            Body : body
        }).then(
            message => {if(message === "OK") {
                setEmailMessage("Email Sent!")
            }
        else{
            setEmailMessage(message);
        }}
        );
      
    }

    async function storeEvent(username) {
        const newEventAdded = await addDoc(collection(db, "events"), {
            timeStamp: serverStamp.now(),
            username: username
        });
        console.log("Added event with ID: ", newEventAdded.id);
        return newEventAdded.id;

    }

    function captureEvent(locRef, id, when) {
        takeScreenShot(locRef.current)
        const imageRef = ref(storage, `/events/${id}/${when}.jpg`)
        uploadString(imageRef, image, 'data_url').then((snapshot) => {
            alert('Uploaded an event image');
        });
    }


    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setCurrentUser(user)
            setLoading(false)
        })

        return unsubscribe;
    })

    const value = {
        currentUser,
        currentRole,
        emailMessage,
        passExpirationDays,
        currentUserInfo,
        resetEmail,
        resetUser,
        questionOne,
        questionTwo,
        questionOneAnswer,
        questionTwoAnswer,
        setCurrentRole,
        signup,
        signupAdmin,
        login,
        logout,
        logoutAdmin,
        forgotPassword,
        resetPassword,
        upload,
        sendEmail,
        setPassExpirationDays,
        setCurrentUserInfo,
        setResetEmail,
        setResetUser,
        setQuestionOne,
        setQuestionTwo,
        setQuestionOneAnswer,
        setQuestionTwoAnswer,
        captureEvent,
        storeEvent
    }

  return (
    <AuthContext.Provider value={value}>
        {!loading && children}
    </AuthContext.Provider>
  )
}
