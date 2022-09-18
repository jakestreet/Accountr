import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import '../App.css'
import { app } from '../components/utils/firebase'
import { doc, setDoc, getDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import bcrypt from 'bcryptjs'
import { useAuth } from '../contexts/AuthContext';
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
import { Alert } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import CloseIcon from '@mui/icons-material/Close'

export default function LoginPage() {
    const navigate = useNavigate();
    const loginEmailInputRef = useRef();
    const loginPasswdInputRef = useRef();
    const emailInputRef = useRef();
    const roleInputRef = useRef()
    const passwdInputRef = useRef();
    const conPasswdInputRef = useRef();
    const fNameInputRef = useRef();
    const lNameInputRef = useRef();
    const addressInputRef = useRef();
    const dobInputRef = useRef();
    const [loginStatus, setLoginStatus] = useState("");
    const [justifyActive, setJustifyActive] = useState('tab1');
    const [open, setOpen] = useState(true);
    const db = getFirestore(app);
    const { signup, login, logout, currentUser } = useAuth();

    
    useEffect(() => {
      if(currentUser !== null)
      {
        navigate("/home");
      }
    })
    

    const SignUpForm = async (e)=>{
        e.preventDefault();
        const email = emailInputRef.current.value;
        const password = passwdInputRef.current.value;
        const conPassword = conPasswdInputRef.current.value;
        const firstName = fNameInputRef.current.value;
        const lastName = lNameInputRef.current.value;
        const address = addressInputRef.current.value;
        const dob = dobInputRef.current.value;
        const role = roleInputRef.current.value;

        try {
          const docRef = doc(db, "users", email);
          const docSnap = await getDoc(docRef);

          if(password === conPassword) {
            if (!docSnap.exists()) {
              const hashedPass = await bcrypt.hash(password, 10);
              setDoc(docRef, {
                email: email,
                password: hashedPass,
                firstname: firstName,
                lastname: lastName,
                address: address,
                dob: dob,
                role: role,
                status: "Requested"
              });
              setLoginStatus("Registration Successful!")
              await signup(email, password)
              .then((userCredential) => {
                logout();
              })
            }
            else {
              setOpen(true);
              setLoginStatus("Email already in use!")
            }
          }
          else {
            setOpen(true);
            setLoginStatus("Passwords do not match!")
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
              if(docSnap.data().status === "Approved") {
                await login(email, password)
                navigate("/home");
              }
              else if(docSnap.data().status === "Requested") {
                setOpen(true);
                setLoginStatus("Your registration request is awaiting approval.");
              }
              else {
                setOpen(true);
                setLoginStatus("Your request for registration has been rejected.")
              }
              
            } else {
              setOpen(true);
              setLoginStatus("Incorrect Password!")
            }
          } else {
              setOpen(true);
              setLoginStatus("The username does not exist!");
          } 
      
        } catch (error) {
          setLoginStatus(error.message);
        }

        
    }

    const ResetNav = (e)=>{
      e.preventDefault();
      navigate("/reset");
  }

  const SendAlert = (e)=>{
    if(loginStatus !== "") {
      
      var alertSeverity = "warning";
      
      if(loginStatus === "Registration Successful!"){
        alertSeverity = "success";
      }
      
      return (
        <Collapse in={open}>
          <Alert severity={alertSeverity}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => {
                  setOpen(false);
                }}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
            sx={{ mb: 2 }}
          >
            {loginStatus}
          </Alert>
        </Collapse>
      )
    } 
}

    const handleJustifyClick = (value) => {
      if (value === justifyActive) {
        return;
      }
  
      setJustifyActive(value);
    };
  
    return (
          <div>
            {SendAlert()}
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
                  
        
                </MDBTabsPane>
        
                <MDBTabsPane show={justifyActive === 'tab2'}>
        
                  <MDBInput wrapperClass='mb-4' label='Email' id='regEmail' type='email' inputRef={emailInputRef}/>
                  <MDBInput wrapperClass='mb-4' label='Role (User, Manager, Admin)' id='regFirst' type='text' inputRef={roleInputRef}/>
                  <MDBInput wrapperClass='mb-4' label='Password' id='regPassword' type='password' inputRef={passwdInputRef}/>
                  <MDBInput wrapperClass='mb-4' label='Confirm Password' id='regPassword' type='password' inputRef={conPasswdInputRef}/>
                  <MDBInput wrapperClass='mb-4' label='First Name' id='regFirst' type='text' inputRef={fNameInputRef}/>
                  <MDBInput wrapperClass='mb-4' label='Last Name' id='regLast' type='text' inputRef={lNameInputRef}/>
                  <MDBInput wrapperClass='mb-4' label='Address' id='regAddress' type='text' inputRef={addressInputRef}/>
                  <MDBInput wrapperClass='mb-4' label='Date of Birth' id='regDoB' type='date' inputRef={dobInputRef}/>
        
                  <MDBBtn onClick={SignUpForm} className="mb-4 w-100">Sign up</MDBBtn>
        
                </MDBTabsPane>
        
              </MDBTabsContent>
        
            </MDBContainer>
          </div>
    )
}