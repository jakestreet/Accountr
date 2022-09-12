import { useRef, useState } from 'react'
import '../App.css'
import { auth, app } from './utils/firebase'
import { doc, setDoc, getDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { createUserWithEmailAndPassword, onAuthStateChanged, signOut, signInWithEmailAndPassword } from 'firebase/auth';


export default function LoginForm() {
    const emailInputRef = useRef();
    const passwdInputRef = useRef();
    
    const [user, setUser] = useState({});

    const [loginStatus, setLoginStatus] = useState("");

    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    })

    //const db = getFirestore(app);

    const SignUpForm = async (e)=>{
        e.preventDefault();
        const email = emailInputRef.current.value;
        const password = passwdInputRef.current.value;

        try {
        const user = await createUserWithEmailAndPassword(auth, email, password);
        console.log(user);
        } catch (error) {
          setLoginStatus(error.message);
        }

        /*
        const docRef = doc(db, "users", user);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          setDoc(doc(db, "users", email), {
            username: email,
            hashedPassword: hashedpassword
          });
          setLoginStatus("Registration Successful!")
        }
        else {
          setLoginStatus("Username already in use!")
        }
        */

    }

    const LoginForm = async (e)=>{
        e.preventDefault();
        const email = emailInputRef.current.value;
        const password = passwdInputRef.current.value;
        
        try {
          const user = await signInWithEmailAndPassword(auth, email, password)
          setLoginStatus("Successfully Logged In!")
        } catch (error) {
          setLoginStatus(error.message);
        }
        /*
        const docRef = doc(db, "users", email);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          if(result) {
            setLoginStatus("Logged in!");
          } 
          else {
            setLoginStatus("Incorrect password!");
          }
        } 
        else {
          // doc.data() will be undefined in this case
          setLoginStatus("This username does not exist!");
        }
        */
    }

    const LogoutForm = async (e)=>{
      await signOut(auth);
  }

    return (
        <div>
            <form className='loginBox'>
                <label htmlFor="uname">Email:</label>
                <input type="text" id="uname" name="uname" ref={emailInputRef}/>
                <label htmlFor="passwd">Password:</label>
                <input type="password" id="passwd" name="passwd" ref={passwdInputRef}/>
                <button type="submit" onClick={LoginForm}>Log In</button>
                <button type="submit" onClick={LogoutForm}>Log Out</button>
                <button type="button" onClick={SignUpForm}>Register</button>
            </form>
            <h1>Response: {loginStatus}</h1>
            <h1>Current User: {user?.email}</h1>
        </div>
    )
}