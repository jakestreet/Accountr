import { useRef, useState } from 'react'
import '../App.css'
import { app } from './utils/firebase'
import { doc, setDoc, getDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import bcrypt from 'bcryptjs'

export default function LoginForm() {
    const emailInputRef = useRef();
    const passwdInputRef = useRef();
    const fNameInputRef = useRef();
    const lNameInputRef = useRef();
    
    const [currentUser, setUser] = useState("");

    const [loginStatus, setLoginStatus] = useState("");

    const db = getFirestore(app);

    const SignUpForm = async (e)=>{
        e.preventDefault();
        const email = emailInputRef.current.value;
        const password = passwdInputRef.current.value;
        const firstName = fNameInputRef.current.value;
        const lastName = lNameInputRef.current.value;

        try {
        const docRef = doc(db, "users", email);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          const hashedPass = await bcrypt.hash(password, 10);
          console.log(hashedPass);
          setDoc(docRef, {
            email: email,
            password: hashedPass,
            firstname: firstName,
            lastname: lastName,
            role: "request"
          });
          setLoginStatus("Registration Successful!")
          setUser(email);
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
          const docRef = doc(db, "users", email);
          const docSnap = await getDoc(docRef);

          if(docSnap.exists) {
            if(await bcrypt.compare(password, docSnap.data().password)) {
              setLoginStatus("Successfully Logged In!");
              setUser(email);
            } else {
              setLoginStatus("Incorrect Password!");
            }
          } else {
              setLoginStatus("The username does not exist!");
          }       
        } catch (error) {
          setLoginStatus(error.message);
        }
    }

    const LogoutForm = async (e)=>{
      
  }

      const ResetForm = async (e)=>{
        try {
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
            <h1>Current User: {currentUser}</h1>
        </div>
    )
}