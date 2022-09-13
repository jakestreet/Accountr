import { useRef, useState } from 'react'
import '../App.css'
import { auth, app } from './utils/firebase'
import { doc, setDoc, getDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { createUserWithEmailAndPassword, onAuthStateChanged, signOut, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth';
import bcrypt from 'bcryptjs'

export default function LoginForm() {
    const emailInputRef = useRef();
    const passwdInputRef = useRef();
    const fNameInputRef = useRef();
    const lNameInputRef = useRef();
    
    const [localUser, setUser] = useState({});

    const [loginStatus, setLoginStatus] = useState("");

    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    })

    bcrypt.hash(passwdInputRef.current.value, 10);

    const db = getFirestore(app);

    const SignUpForm = async (e)=>{
        e.preventDefault();
        const email = emailInputRef.current.value;
        const password = passwdInputRef.current.value;
        const firstName = fNameInputRef.current.value;
        const lastName = lNameInputRef.current.value;

        try {
        const user = await createUserWithEmailAndPassword(auth, email, password);
        console.log(user);
        await sendEmailVerification(user.user);
        const docRef = doc(db, "users", user.user.uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          setDoc(doc(db, "users", user.user.uid), {
            email: email,
            firstname: firstName,
            lastname: lastName,
            role: "user"
          });
          setLoginStatus("Registration Successful!")
        }
        else {
          setLoginStatus("Username already in use!")
        }
        } catch (error) {
          setLoginStatus(error.message);
        }


    }

    const LoginForm = async (e)=>{
        e.preventDefault();
        const email = emailInputRef.current.value;
        const password = passwdInputRef.current.value;
        
        try {
          await signInWithEmailAndPassword(auth, email, password)
          setLoginStatus("Successfully Logged In!")
        } catch (error) {
          setLoginStatus(error.message);
        }
    }

    const LogoutForm = async (e)=>{
      await signOut(auth);
  }

      const ResetForm = async (e)=>{
        try {
          await sendPasswordResetEmail(auth, emailInputRef.current.value);
          setLoginStatus("A password reset email has been sent.")
          } catch (error) {
            setLoginStatus(error.message);
          }
        
    }

    return (
        <div>
            <form className='loginBox'>
                <label htmlFor="uname">Email:</label>
                <input type="text" id="uname" name="uname" ref={emailInputRef}/>
                <label htmlFor="passwd">Password:</label>
                <input type="password" id="passwd" name="passwd" ref={passwdInputRef}/>
                <label htmlFor="fname">First Name:</label>
                <input type="text" id="fname" name="fname" ref={fNameInputRef}/>
                <label htmlFor="lname">Last Name:</label>
                <input type="text" id="lname" name="lname" ref={lNameInputRef}/>
                <button type="submit" onClick={LoginForm}>Log In</button>
                <button type="submit" onClick={LogoutForm}>Log Out</button>
                <button type="button" onClick={SignUpForm}>Register</button>
                <button type="button" onClick={ResetForm}>Reset Password</button>
            </form>
            <h1>Response: {loginStatus}</h1>
            <h1>Current User: {localUser?.email}</h1>
        </div>
    )
}