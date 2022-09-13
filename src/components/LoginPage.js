import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import '../App.css'
import { app, auth } from './utils/firebase'
import { doc, setDoc, getDoc} from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
//import { collection, query, where, getDocs  } from "firebase/firestore";
import bcrypt from 'bcryptjs'
import {
  MDBContainer,
  MDBTabs,
  MDBTabsItem,
  MDBTabsLink,
  MDBTabsContent,
  MDBTabsPane,
  MDBBtn,
  MDBInput
}
from 'mdb-react-ui-kit';

export default function LoginPage() {
    const navigate = useNavigate();
    const loginEmailInputRef = useRef();
    const loginPasswdInputRef = useRef();
    const emailInputRef = useRef();
    const passwdInputRef = useRef();
    const fNameInputRef = useRef();
    const lNameInputRef = useRef();
    const addressInputRef = useRef();
    const dobInputRef = useRef();
    const [loginStatus, setLoginStatus] = useState("");
    const db = getFirestore(app);

    const SignUpForm = async (e)=>{
        e.preventDefault();
        const email = emailInputRef.current.value;
        const password = passwdInputRef.current.value;
        const firstName = fNameInputRef.current.value;
        const lastName = lNameInputRef.current.value;
        const address = addressInputRef.current.value;
        const dob = dobInputRef.current.value;

        try {
          const docRef = doc(db, "users", email);
          const docSnap = await getDoc(docRef);

          if (!docSnap.exists()) {
            const hashedPass = await bcrypt.hash(password, 10);
            setDoc(docRef, {
              email: email,
              password: hashedPass,
              firstname: firstName,
              lastname: lastName,
              address: address,
              dob: dob,
              role: "request"
            });
            setLoginStatus("Registration Successful!")
            await createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
              // Signed in 
              auth.signOut();
              // Signed Out
            })
          }
          else {
            setLoginStatus("Username already in use!")
          }
        } 
        catch (error) {
          setLoginStatus(error.message);
        }


    }

    const LoginForm = async (e)=>{
        e.preventDefault();
        const email = loginEmailInputRef.current.value;
        const password = loginPasswdInputRef.current.value;
        
        try {
                    
          const docRef = doc(db, "users", email);
          const docSnap = await getDoc(docRef);

          if(docSnap.data() !== undefined) {
            if(await bcrypt.compare(password, docSnap.data().password)) {
              setLoginStatus("Successfully Logged In!");
              await signInWithEmailAndPassword(auth, email, password)
              navigate("/home");
            } else {
              setLoginStatus("Incorrect Password!")
            }
          } else {
              setLoginStatus("The username does not exist!");
          } 
      
        } catch (error) {
          setLoginStatus(error.message);
        }

        
    }


          /*
      const GetRequests = async (e)=>{
        try {
          const usersRef = collection(db, "users");

          const q = query(usersRef, where("role", "==", "request"));
          
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            console.log(doc.id, " => ", doc.data());
          });

          } catch (error) {
            setLoginStatus(error.message);
          }
        
    }
    */
    const ResetNav = (e)=>{
      e.preventDefault();
      navigate("/reset");
  }

    const [justifyActive, setJustifyActive] = useState('tab1');;

    const handleJustifyClick = (value) => {
      if (value === justifyActive) {
        return;
      }
  
      setJustifyActive(value);
    };
  
    return (
          <MDBContainer className="p-3 my-5 d-flex flex-column w-50">
      
            <MDBTabs pills justify className='mb-3 d-flex flex-row justify-content-between'>
              <MDBTabsItem>
                <MDBTabsLink onClick={() => handleJustifyClick('tab1')} active={justifyActive === 'tab1'}>
                  Login
                </MDBTabsLink>
              </MDBTabsItem>
              <MDBTabsItem>
                <MDBTabsLink onClick={() => handleJustifyClick('tab2')} active={justifyActive === 'tab2'}>
                  Register
                </MDBTabsLink>
              </MDBTabsItem>
            </MDBTabs>
      
            <MDBTabsContent>
      
              <MDBTabsPane show={justifyActive === 'tab1'}>
      
                <MDBInput wrapperClass='mb-4' label='Email address' id='loginEmail' type='email' inputRef={loginEmailInputRef}/>
                <MDBInput wrapperClass='mb-4' label='Password' id='loginPassword' type='password' inputRef={loginPasswdInputRef}/>
                <a onClick={ResetNav} href="!#" >Forgot password?</a>
                <div className="d-flex justify-content-between mx-4 mb-4"></div>
      
                <MDBBtn onClick={LoginForm} className="mb-4 w-100">Sign in</MDBBtn>
                <p className="text-center">Message: {loginStatus}</p>
                
      
              </MDBTabsPane>
      
              <MDBTabsPane show={justifyActive === 'tab2'}>
      
                <MDBInput wrapperClass='mb-4' label='Email' id='regEmail' type='email' inputRef={emailInputRef}/>
                <MDBInput wrapperClass='mb-4' label='Password' id='regPassword' type='password' inputRef={passwdInputRef}/>
                <MDBInput wrapperClass='mb-4' label='First Name' id='regFirst' type='text' inputRef={fNameInputRef}/>
                <MDBInput wrapperClass='mb-4' label='Last Name' id='regLast' type='text' inputRef={lNameInputRef}/>
                <MDBInput wrapperClass='mb-4' label='Address' id='regAddress' type='text' inputRef={addressInputRef}/>
                <MDBInput wrapperClass='mb-4' label='Date of Birth' id='regDoB' type='date' inputRef={dobInputRef}/>
      
                <MDBBtn onClick={SignUpForm} className="mb-4 w-100">Sign up</MDBBtn>

                <p className="text-center">Message: {loginStatus}</p>
      
              </MDBTabsPane>
      
            </MDBTabsContent>
      
          </MDBContainer>
    )
}