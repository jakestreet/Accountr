import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import '../App.css'
import { app, auth } from '../components/utils/firebase'
import { doc, setDoc, getDoc, updateDoc, increment, collection, query, where, getDocs } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { updateProfile } from 'firebase/auth';
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
  MDBInput,
  MDBTooltip
}
from 'mdb-react-ui-kit';
import { Alert } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import CloseIcon from '@mui/icons-material/Close'
import PasswordChecklist from "react-password-checklist"
import Select from 'react-select'

export default function LoginPage() {
    const navigate = useNavigate();
    const usernameInputRef = useRef();
    const loginPasswdInputRef = useRef();
    const emailInputRef = useRef();
    const roleInputRef = useRef()
    const passwdInputRef = useRef();
    const conPasswdInputRef = useRef();
    const fNameInputRef = useRef();
    const lNameInputRef = useRef();
    const addressInputRef = useRef();
    const dobInputRef = useRef();
    const secQuestionOneInputRef = useRef();
    const secQuestionTwoInputRef = useRef();
    const [loginStatus, setLoginStatus] = useState("");
    const [justifyActive, setJustifyActive] = useState('tab1');
    const [open, setOpen] = useState(true);
    const db = getFirestore(app);
    const { signupAdmin, login, logoutAdmin, currentUser, sendEmail, setCurrentRole, setCurrentUserInfo, setPassExpirationDays, passExpirationDays } = useAuth();
    const [password, setPassword] = useState("")
    const [passwordAgain, setPasswordAgain] = useState("")
    const [validPass, setValidPass] = useState("invalid")
    const [haveInfo, setHaveInfo] = useState(false);
    const [choiceOne, setChoiceOne] = useState("");
    const [choiceTwo, setChoiceTwo] = useState("");
    
    
    useEffect(() => {
      if(currentUser !== null)
      {
        navigate("/home");
      }
    })

    async function getRegisteredEmail() {
      try{
        const usersRef = collection(db, "users");
        
        const q = query(usersRef, where("email", "==", emailInputRef.current.value));
      
        const querySnapshot = await getDocs(q);

        if(querySnapshot.docs[0]) {
          return querySnapshot.docs[0].data().email;
        }
        else {
          return "none"
        }
      }
      catch (error) {
        console.log(error)
      }
    }

    const SignUpForm = async (e)=>{
        e.preventDefault();
        const email = emailInputRef.current.value;
        const password = passwdInputRef.current.value;
        const firstName = fNameInputRef.current.value;
        const lastName = lNameInputRef.current.value;
        const address = addressInputRef.current.value;
        const dob = dobInputRef.current.value;
        const role = roleInputRef.current.value;
        const questionOneAnswer = secQuestionOneInputRef.current.value;
        const questionTwoAnswer = secQuestionTwoInputRef.current.value;
        const questionOne = choiceOne;
        const questionTwo = choiceTwo;

        try {
          const MyDate = new Date();
          const currentYear = String(MyDate.getFullYear());
          const expirationYear = String(MyDate.getFullYear() + 1);
          const currentMonth = ('0' + (MyDate.getMonth()+1)).slice(-2);
          const currentDay = ('0' + (MyDate.getDate())).slice(-2);
          const username = firstName.toLowerCase().substring(0,1) + lastName.toLowerCase() + currentMonth + currentYear.slice(-2)
          const passwordExpiration = expirationYear + "-" + currentMonth + "-" + currentDay;

          const docRef = doc(db, "users", username);
          const docSnap = await getDoc(docRef);
          const registeredEmail = await getRegisteredEmail();
          

          if(validPass === true) {
            if (!docSnap.exists() && registeredEmail === "none") {
              const hashedPass = await bcrypt.hash(password, 10);
              setDoc(docRef, {
                username: username,
                email: email,
                password: hashedPass,
                firstname: firstName,
                lastname: lastName,
                address: address,
                dob: dob,
                role: role,
                status: "Requested",
                passwordExpiration: passwordExpiration,
                passwordAttempts: 1,
                suspensionStartDate: "none",
                suspensionEndDate: "none",
                questionOne: questionOne,
                questionOneAnswer: questionOneAnswer,
                questionTwo: questionTwo,
                questionTwoAnswer: questionTwoAnswer,
              });
              setLoginStatus("Registration Successful!")
              setOpen(true)
              sendEmail("teamjest4713@gmail.com", "Accountr Registration Request", email + " has requested an account. Please login to approve or reject the request.")
              await signupAdmin(email, password, username)
              .then((userCredential) => {
                logoutAdmin();
              })
            }
            else if(registeredEmail !== "none") {
              setOpen(true);
              setLoginStatus("Email already in use!")
            }
            else if(docSnap.exists()) {
              setOpen(true);
              setLoginStatus("Generated username already exists!")
            }
          }
          else {
            setOpen(true);
            setLoginStatus("Check Password Requirements!")
          }
       
        } 
        catch (error) {
          setLoginStatus(error.message);
        }
    }

    const GetRole = async (e)=>{
      if(auth.currentUser && haveInfo === false) {
          const docRef = doc(db, "users", auth.currentUser.displayName);
          const docSnap = await getDoc(docRef);
          const userInfo = {
              firstName: docSnap.data().firstname,
              lastName: docSnap.data().lastname,
              address: docSnap.data().address,
              dob: docSnap.data().dob
          }
          const days = await GetPasswordExpiration(docSnap.data().passwordExpiration);
          setPassExpirationDays(days);
          setCurrentUserInfo(userInfo)
          setCurrentRole(docSnap.data().role);
          setHaveInfo(true)
      }   
  }
  
  function GetPasswordExpiration(passwordExpiration) {
      const MyDate = new Date();
      const currentYear = String(MyDate.getFullYear());
      const currentMonth = ('0' + (MyDate.getMonth()+1)).slice(-2);
      const currentDay = ('0' + (MyDate.getDate())).slice(-2);
      const currentDate = new Date(currentYear + "-" + currentMonth + "-" + currentDay);
      const passwordExpirationDate = new Date(passwordExpiration);
              
      const oneDay = 1000 * 60 * 60 * 24;
      const diffInTime = passwordExpirationDate.getTime() - currentDate.getTime();
      
      return Math.round(diffInTime / oneDay);
    }

    const LoginForm = async (e)=>{
        e.preventDefault();
        const username = usernameInputRef.current.value;
        const password = loginPasswdInputRef.current.value;
        
        try {
                    
          const docRef = doc(db, "users", username);
          const docSnap = await getDoc(docRef);

          if(docSnap.data() !== undefined) {
            if(await bcrypt.compare(password, docSnap.data().password)) {
              if(docSnap.data().status === "Approved") {
                await login(docSnap.data().email, password)
                await updateDoc(docRef, {
                  passwordAttempts: 1
                });
                if(auth.currentUser.displayName === null) {
                    await updateProfile(auth.currentUser, {
                      displayName: username
                  })
                  console.log(auth.currentUser.displayName);
                }
                const getInfo = await GetRole();
                navigate("/home");
              }
              else if(docSnap.data().status === "Requested") {
                setOpen(true);
                setLoginStatus("Your registration request is awaiting approval.");
              }
              else if(docSnap.data().status === "Rejected") {
                setOpen(true);
                setLoginStatus("Your request for registration has been rejected.")
              }
              else if(docSnap.data().status === "Disabled") {
                setOpen(true);
                setLoginStatus("Your account is currently disabled.")
              }
              else if(docSnap.data().status === "Suspended") {
                setOpen(true);
                setLoginStatus("Your account is currently suspended.")
              }
              else if(docSnap.data().status === "Expired") {
                setOpen(true);
                setLoginStatus("Your password has expired. Please reset your password by clicking 'Forgot Password?'")
              }
              
            } else {
                if(docSnap.data().status === "Suspended") {
                  setOpen(true);
                  return setLoginStatus("Your account is currently suspended.")
                }
                await updateDoc(docRef, {
                  passwordAttempts: increment(1)
                });
                console.log(docSnap.data().passwordAttempts);
                if(docSnap.data().passwordAttempts === 3) {
                  await updateDoc(docRef, {
                      status: "Suspended"
                  });
                  setLoginStatus("Your account has been suspended for too many incorrect attempts!")
                  await updateDoc(docRef, {
                    passwordAttempts: 1
                  });
                }
              else {
                setLoginStatus("Incorrect Password!")
              }
              setOpen(true);
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
      navigate("/forgot-password");
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

    const optionsQuestionOne = [
      { value: "What is your mother's maiden name?", label: "What is your mother's maiden name?" },
      { value: "In what city were you born?", label: "In what city were you born?" },
      { value: "What high school did you attend?", label: "What high school did you attend?" },
    ]
    const optionsQuestionTwo = [
      { value: "What was the name of your elementary school?", label: "What was the name of your elementary school?" },
      { value: "What was the make of your first car?", label: "What was the make of your first car?" },
      { value: "What year was your father born?", label: "What year was your father born?" },
    ]

    return (
          <div>
            {SendAlert()}
            <MDBContainer className="p-3 my-5 d-flex flex-column w-50">
        
              <MDBTabs pills justify className='mb-3 d-flex flex-row justify-content-between'>
                <MDBTabsItem>
                <MDBTooltip tag='a' placement="auto" title="Login to a previous account">
                  <MDBTabsLink onClick={() => handleJustifyClick('tab1')} active={justifyActive === 'tab1'}>
                    Login
                  </MDBTabsLink>
                </MDBTooltip>
                  
                </MDBTabsItem>
                <MDBTabsItem>
                <MDBTooltip tag='a' placement="auto" title="Create an account">
                  <MDBTabsLink onClick={() => handleJustifyClick('tab2')} active={justifyActive === 'tab2'}>
                    Register
                  </MDBTabsLink>
                </MDBTooltip>
                  
                </MDBTabsItem>
              </MDBTabs>
        
              <MDBTabsContent>
        
                <MDBTabsPane show={justifyActive === 'tab1'}>
        
                  <MDBInput wrapperClass='mb-4' label='Username' id='username' type='text' inputRef={usernameInputRef}/>
                  <MDBInput wrapperClass='mb-4' label='Password' id='loginPassword' type='password' inputRef={loginPasswdInputRef}/>
                  <MDBTooltip tag='a' placement="auto" title="Follow link to reset password">
                    <a onClick={ResetNav} href="!#" >Forgot password?</a>
                  </MDBTooltip>
                  
                  <div className="d-flex justify-content-between mx-4 mb-4"></div>
                  <MDBTooltip tag='a' placement="auto" title="Finish sign in process">
                    <MDBBtn onClick={LoginForm} className="mb-4 w-100">Sign in</MDBBtn>
                  </MDBTooltip>
                  
                  
        
                </MDBTabsPane>
        
                <MDBTabsPane show={justifyActive === 'tab2'}>
                  <MDBInput wrapperClass='mb-4' label='Email' id='regEmail' type='email' inputRef={emailInputRef}/>
                  <MDBInput wrapperClass='mb-4' label='Role (User, Manager, Admin)' id='regFirst' type='text' inputRef={roleInputRef}/>
                  <MDBInput wrapperClass='mb-4' label='Password' id='regPassword' type='password' onChange={e => setPassword(e.target.value)} inputRef={passwdInputRef}/>
                  <MDBInput wrapperClass='mb-2' label='Confirm Password' id='regPassword' type='password' onChange={e => setPasswordAgain(e.target.value)} inputRef={conPasswdInputRef}/>
                  <PasswordChecklist className='mb-3'
                  rules={["minLength","specialChar","number","letter","match"]}
                  minLength={8}
                  value={password}
                  valueAgain={passwordAgain}
                  messages={{
                    minLength: "Password has at least 8 characters.",
                    specialChar: "Password has a special character.",
                  }}
                  onChange={(isValid) => {setValidPass(isValid)}}
                  />
                  <Select
                  className="mb-2"
                  classNamePrefix="select"
                  name="color"
                  options={optionsQuestionOne}
                  placeholder="Select Security Question 1"
                  onChange={(choice) => setChoiceOne(choice.value)}
                  />
                  <MDBInput wrapperClass='mb-4' label='Security Question 1 Answer' id='regSec1' type='text' inputRef={secQuestionOneInputRef}/>
                  <Select
                  className="mb-2"
                  classNamePrefix="select"
                  name="color"
                  options={optionsQuestionTwo}
                  placeholder="Select Security Question 2"
                  onChange={(choice) => setChoiceTwo(choice.value)}
                  />
                  <MDBInput wrapperClass='mb-4' label='Security Question 2 Answer' id='regSec2' type='text' inputRef={secQuestionTwoInputRef}/>
                  <MDBInput wrapperClass='mb-4' label='First Name' id='regFirst' type='text' inputRef={fNameInputRef}/>
                  <MDBInput wrapperClass='mb-4' label='Last Name' id='regLast' type='text' inputRef={lNameInputRef}/>
                  <MDBInput wrapperClass='mb-4' label='Address' id='regAddress' type='text' inputRef={addressInputRef}/>
                  <MDBInput wrapperClass='mb-4' label='Date of Birth' id='regDoB' type='date' inputRef={dobInputRef}/>
                  <MDBTooltip tag='a' placement="auto" title="Finish sign up process">
                    <MDBBtn onClick={SignUpForm} className="mb-4 w-100">Sign up</MDBBtn>
                  </MDBTooltip>
                  
        
                </MDBTabsPane>
        
              </MDBTabsContent>
        
            </MDBContainer>
          </div>
    )
}