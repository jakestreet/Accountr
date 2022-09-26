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

export default function QuestionsPage() {
  const answerOneInputRef = useRef();
  const answerTwoInputRef = useRef();
  const [message, setMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");
  const [open, setOpen] = useState(false);
  const { forgotPassword, resetEmail, resetUser, questionOne, questionOneAnswer, questionTwo, questionTwoAnswer } = useAuth();
  const db = getFirestore(app);
  const navigate = useNavigate();
  
  const NavigateToReset = (e)=>{
    navigate("/reset-password-questions")
  }

  const SendResetEmail = async (e)=>{
    await forgotPassword(resetEmail)
    .then(response => {
      setMessage("Reset Link Succesfully Sent!")
      setAlertSeverity("success")
      setOpen(true)
    }).catch(e => {
      console.log(e.message)
      setAlertSeverity("warning")
      setOpen(true)
    })
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

  function CompareAnswers() {
    if(questionOneAnswer === answerOneInputRef.current.value && questionTwoAnswer === answerTwoInputRef.current.value) {
      SendResetEmail();
    }
    else {
      console.log(questionOneAnswer)
      console.log(answerOneInputRef.current.value)
      console.log(questionTwoAnswer)
      console.log(answerTwoInputRef.current.value)
      setOpen(true)
    }
  }
  

    return (
      <div>
        {SendAlert()}
        <MDBContainer className="p-3 my-5 d-flex flex-column w-50">
          <h1>Answer Security Questions</h1>
          <MDBCardText className='mt-4 m-auto'>{questionOne}</MDBCardText>
          <MDBInput wrapperClass='mb-2 w-50 m-auto mt-2' label='Question 1 Answer' id='resetEmail' type='text' inputRef={answerOneInputRef}/>
          <MDBCardText className='mt-4 m-auto'>{questionTwo}</MDBCardText>
          <MDBInput wrapperClass='mb-4 w-50 m-auto mt-2' label='Question 2 Answer' id='resetEmail' type='text' inputRef={answerTwoInputRef}/>
          <MDBBtn onClick={CompareAnswers} className="mb-4 w-25 m-auto mt-2">Answer Questions</MDBBtn>
          <MDBBtn className="mb-4 w-25 m-auto" href="/" color="link">Return to Log In</MDBBtn>
        </MDBContainer>
      </div>
        
    )
    
}