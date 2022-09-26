import { useRef, useState } from 'react';
import {
    MDBContainer,
    MDBInput,
    MDBBtn,
    MDBCardText,
  }
from 'mdb-react-ui-kit';
import { useAuth } from '../contexts/AuthContext';
import { Alert } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import CloseIcon from '@mui/icons-material/Close'
import { useNavigate } from 'react-router-dom';
import { app } from '../components/utils/firebase'
import { doc, getDoc, getFirestore } from "firebase/firestore";

export default function ForgotPage() {
    const emailInputRef = useRef();
    const emailQuestionsInputRef = useRef();
    const userInputRef = useRef();
    const [message, setMessage] = useState("");
    const [alertSeverity, setAlertSeverity] = useState("success");
    const [open, setOpen] = useState(false);
    const { forgotPassword, setResetEmail, setResetUser, setQuestionOne, setQuestionOneAnswer, setQuestionTwo, setQuestionTwoAnswer, resetUser } = useAuth();
    const navigate = useNavigate();
    const db = getFirestore(app);
    


    const NavigateToQuestions = async (e)=>{
      setResetEmail(emailQuestionsInputRef.current.value)
      setResetUser(userInputRef.current.value)
      const questionInfo = await GetQuestions()
      navigate("/answer-questions")
    }

    async function GetQuestions() {
      const docRef = doc(db, "users", userInputRef.current.value);
      const docSnap = await getDoc(docRef);
  
      setQuestionOne(docSnap.data().questionOne)
      setQuestionTwo(docSnap.data().questionTwo)
      console.log(docSnap.data().questionTwoAnswer)
      setQuestionOneAnswer(docSnap.data().questionOneAnswer)
      setQuestionTwoAnswer(docSnap.data().questionTwoAnswer)
  
    }

    const SendAlert = (e)=>{
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
              {message}
            </Alert>
          </Collapse>
        )
      } 
  

    return (
      <div>
        {SendAlert()}
        <MDBContainer className="p-3 my-5 d-flex flex-column w-50">
          <h1>Forgot Password</h1>
          <MDBInput wrapperClass='mb-2 w-50 m-auto mt-4' label='Username' id='resetEmail' type='email' inputRef={userInputRef}/>
          <MDBInput wrapperClass='mb-4 w-50 m-auto mt-2' label='Email address' id='resetEmail' type='email' inputRef={emailQuestionsInputRef}/>
          <MDBBtn onClick={NavigateToQuestions}className="mb-4 w-25 m-auto mt-2">Get Security Questions</MDBBtn>
          <MDBBtn className="mb-4 w-25 m-auto" href="/" color="link">Return to Log In</MDBBtn>
        </MDBContainer>
      </div>
        
    )
    
}