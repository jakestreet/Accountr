import { useRef, useState } from 'react';
import {
    MDBContainer,
    MDBInput,
    MDBBtn,
  }
  from 'mdb-react-ui-kit';

export default function ResetPage() {
    const emailInputRef = useRef();
    const [message, setMessage] = useState("");
    
    const SendResetEmail = async (e)=>{
        setMessage("Reset email sent")
    }

    return (
        <MDBContainer className="p-3 my-5 d-flex flex-column w-50">
        <h1>Reset Password</h1>
        <MDBInput wrapperClass='mb-4' label='Email address' id='resetEmail' type='email' inputRef={emailInputRef}/>
  
        <MDBBtn onClick={SendResetEmail}className="mb-4">Send Reset Link</MDBBtn>
        <MDBBtn className="mb-4" href="/">Return to Log In</MDBBtn>
        <p className="text-center">Message: {message}</p>
      </MDBContainer>
        
    )
    
}