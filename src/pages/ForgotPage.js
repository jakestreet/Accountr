import { useRef, useState } from 'react';
import {
    MDBContainer,
    MDBInput,
    MDBBtn,
  }
from 'mdb-react-ui-kit';
import { useAuth } from '../contexts/AuthContext';
import { Alert } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import CloseIcon from '@mui/icons-material/Close'

export default function ForgotPage() {
    const emailInputRef = useRef();
    const [message, setMessage] = useState("");
    const [alertSeverity, setAlertSeverity] = useState("success");
    const [open, setOpen] = useState(false);
    const { forgotPassword } = useAuth();
    
    const SendResetEmail = async (e)=>{
        await forgotPassword(emailInputRef.current.value)
        .then(response => {
          setMessage("Reset Link Succesfully Sent!")
          setAlertSeverity("success")
          setOpen(true)
        }).catch(e => {
          setMessage(e.message)
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
  

    return (
      <div>
        {SendAlert()}
        <MDBContainer className="p-3 my-5 d-flex flex-column w-50">
          <h1>Forgot Password</h1>
          <MDBInput wrapperClass='mb-4 w-50 m-auto mt-4' label='Email address' id='resetEmail' type='email' inputRef={emailInputRef}/>
          <MDBBtn onClick={SendResetEmail}className="mb-4 w-25 m-auto mt-2">Send Reset Link</MDBBtn>
          <MDBBtn className="mb-4 w-25 m-auto" href="/" color="link">Return to Log In</MDBBtn>
        </MDBContainer>
      </div>
        
    )
    
}