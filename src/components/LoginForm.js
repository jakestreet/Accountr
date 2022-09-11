import { useRef, useState } from 'react'
import '../App.css'
import app from './utils/firebase'
import bcrypt from 'bcryptjs'
import { doc, setDoc, getDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";


export default function LoginForm() {
    const userInputRef = useRef();
    const passwdInputRef = useRef();

    const [loginStatus, setLoginStatus] = useState("");

    const db = getFirestore(app);

    const SignUpForm = async (e)=>{
        e.preventDefault();
        const user = userInputRef.current.value;
        const password = passwdInputRef.current.value;
        const hashedpassword = await bcrypt.hash(password, 10);

        const docRef = doc(db, "users", user);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          setDoc(doc(db, "users", user), {
            username: user,
            hashedPassword: hashedpassword
          });
          setLoginStatus("Registration Successful!")
        }
        else {
          setLoginStatus("Username already in use!")
        }

    }

    const LoginForm = async (e)=>{
        e.preventDefault();
        const user = userInputRef.current.value;
        const password = passwdInputRef.current.value;
        const docRef = doc(db, "users", user);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const hashedPassword = docSnap.data().hashedPassword;
          const result = await bcrypt.compare(password, hashedPassword);
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
    }

    return (
        <div>
            <form className='loginBox'>
                <label for="uname">Username:</label>
                <input type="text" id="uname" name="uname" ref={userInputRef}/>
                <label for="passwd">Password:</label>
                <input type="password" id="passwd" name="passwd" ref={passwdInputRef}/>
                <button type="submit" onClick={LoginForm}>Submit</button>
                <button type="button" onClick={SignUpForm}>Register</button>
            </form>
            <h1>Response: {loginStatus}</h1>
        </div>
    )
}