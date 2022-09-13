import { useRef, useState } from 'react'
import '../App.css'
import { app } from './utils/firebase'
import { doc, setDoc, getDoc} from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
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
  MDBInput,
  MDBCheckbox
}
from 'mdb-react-ui-kit';

export default function LoginPage() {
    const loginEmailInputRef = useRef();
    const loginPasswdInputRef = useRef();
    const emailInputRef = useRef();
    const passwdInputRef = useRef();
    const fNameInputRef = useRef();
    const lNameInputRef = useRef();
    const addressInputRef = useRef();
    const dobInputRef = useRef();
    
    const [currentUser, setUser] = useState("");

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
        const email = loginEmailInputRef.current.value;
        const password = loginPasswdInputRef.current.value;
        
        try {
          const docRef = doc(db, "users", email);
          const docSnap = await getDoc(docRef);

          if(docSnap.data() !== undefined) {
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

    /*
    const LogoutForm = async (e)=>{
      
  }
      
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
      
                <MDBInput wrapperClass='mb-4' label='Email address' id='form1' type='email' inputRef={loginEmailInputRef}/>
                <MDBInput wrapperClass='mb-4' label='Password' id='form2' type='password' inputRef={loginPasswdInputRef}/>
      
                <div className="d-flex justify-content-between mx-4 mb-4">
                  <MDBCheckbox name='flexCheck' value='' id='flexCheckDefault' label='Remember me' />
                  <a href="!#">Forgot password?</a>
                </div>
      
                <MDBBtn onClick={LoginForm} className="mb-4 w-100">Sign in</MDBBtn>
                <p className="text-center">Response: {loginStatus}</p>
                <p className="text-center">Current User: {currentUser}</p>
      
              </MDBTabsPane>
      
              <MDBTabsPane show={justifyActive === 'tab2'}>
      
                <MDBInput wrapperClass='mb-4' label='Email' id='form1' type='email' inputRef={emailInputRef}/>
                <MDBInput wrapperClass='mb-4' label='Password' id='form1' type='password' inputRef={passwdInputRef}/>
                <MDBInput wrapperClass='mb-4' label='First Name' id='form1' type='text' inputRef={fNameInputRef}/>
                <MDBInput wrapperClass='mb-4' label='Last Name' id='form1' type='text' inputRef={lNameInputRef}/>
                <MDBInput wrapperClass='mb-4' label='Address' id='form1' type='text' inputRef={addressInputRef}/>
                <MDBInput wrapperClass='mb-4' label='Date of Birth' id='form1' type='date' inputRef={dobInputRef}/>
                
      
                <p className="text-center">Response: {loginStatus}</p>
      
                <MDBBtn onClick={SignUpForm} className="mb-4 w-100">Sign up</MDBBtn>
      
              </MDBTabsPane>
      
            </MDBTabsContent>
      
          </MDBContainer>
    )
}