import React, { useContext, useEffect, useState } from 'react'
import { app, auth, authAdmin, storage } from '../components/utils/firebase'
import { confirmPasswordReset, createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getDownloadURL, ref, uploadBytes, uploadString } from "firebase/storage";
import { collection, getFirestore, addDoc } from 'firebase/firestore';
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import html2canvas from 'html2canvas';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';

const AuthContext = React.createContext();

export function useAuth() {
    return useContext(AuthContext)
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState();
    const [currentUserInfo, setCurrentUserInfo] = useState();
    const [currentRole, setCurrentRole] = useState();
    const [currentPage, setCurrentPage] = useState("Home");
    const [emailMessage, setEmailMessage] = useState();
    const [passExpirationDays, setPassExpirationDays] = useState();
    const [loading, setLoading] = useState(true);
    const [resetUser, setResetUser] = useState();
    const [resetEmail, setResetEmail] = useState();
    const [questionOne, setQuestionOne] = useState("");
    const [questionTwo, setQuestionTwo] = useState("");
    const [questionOneAnswer, setQuestionOneAnswer] = useState("");
    const [questionTwoAnswer, setQuestionTwoAnswer] = useState("");
    const [filterProvidedEntry, setFilterProvidedEntry] = useState();
    const [ledgerRows, setLedgerRows] = useState();
    const [width, setWidth] = useState();
    const [pendingEntries, setPendingEntries] = useState(false);
    const db = getFirestore(app);
    const serverStamp = firebase.firestore.Timestamp

    const ToBeStyledTooltip = ({ className, ...props }) => (
        <Tooltip {...props} classes={{ tooltip: className }} />
      );
      const StyledTooltip = styled(ToBeStyledTooltip)(({ theme }) => ({
        backgroundColor: 'rgba(41,121,255,1)',
        boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.4), 0 6px 20px 0 rgba(0, 0, 0, 0.4);",
        fontSize: theme.typography.pxToRem(16),
        color: 'rgba(255, 255, 255, 0.87)',
        '& .MuiTooltip-arrow': {
            color: 'rgba(41,121,255,1)',
          },
      }));

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

        updateProfile(currentUser, { photoURL });

        setLoading(false);
        alert("Uploaded file!");
    }

    async function uploadEntryDoc(file, id, filename, setLoading) {
        // eslint-disable-next-line
        const fileRef = ref(storage, "entry docs/" + "journal-entry-" + id + '/' + filename);

        setLoading(true);

        // eslint-disable-next-line
        const uploadResult = await uploadBytes(fileRef, file);

        setLoading(false);
        alert("Uploaded File!");

        return fileRef;
    }

    function sendEmail(emailTo, subject, body, fromName) {
        return window.Email.send({
            SecureToken: "ce629ac7-e05d-45c6-b41e-943099ad36ef",
            To: emailTo,
            From: `${fromName} <teamjest4713@gmail.com>`,
            Subject: subject,
            Body: body
        }).then(
            message => {
                if (message === "OK") {
                    setEmailMessage("Email Sent!")
                }
                else {
                    setEmailMessage(message);
                }
            }
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

    async function captureEvent(id, when) {
        html2canvas(document.getElementById('capture')).then(async (canvas) => {
            var base64URL = canvas.toDataURL('image/jpeg').replace('image/jpeg', 'image/octet-stream');
            const imageRef = ref(storage, `/events/${id}/${when}.jpg`)
            // eslint-disable-next-line
            const uploading = await uploadString(imageRef, base64URL, 'data_url');
        });
    }

    function setEntryFilter(id) {
        setFilterProvidedEntry({
            filter: {
                filterModel: {
                    items: [{ columnField: 'id', operatorValue: 'equals', value: id }],
                },
            },
        })
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
        filterProvidedEntry,
        ledgerRows,
        pendingEntries,
        currentPage,
        width,
        StyledTooltip,
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
        storeEvent,
        setEntryFilter,
        uploadEntryDoc,
        setFilterProvidedEntry,
        setLedgerRows,
        setPendingEntries,
        setCurrentPage,
        setWidth,
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}
