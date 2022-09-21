import { useRef, useState } from 'react';
import {
    MDBContainer,
    MDBInput,
    MDBBtn,
  }
  from 'mdb-react-ui-kit';

export default function ForgotPage() {
    const emailInputRef = useRef();
    const [message, setMessage] = useState("");
    
    const SendResetEmail = async (e)=>{
        setMessage("Reset email sent")
    }

    return (
        <MDBContainer className="p-3 my-5 d-flex flex-column w-50">
        <h1>Forgot Password</h1>
        <MDBInput wrapperClass='mb-4 w-50 m-auto mt-4' label='Email address' id='resetEmail' type='email' inputRef={emailInputRef}/>
  
        <MDBBtn onClick={SendResetEmail}className="mb-4 w-25 m-auto mt-2">Send Reset Link</MDBBtn>
        <MDBBtn className="mb-4 w-25 m-auto" href="/" color="link">Return to Log In</MDBBtn>
      </MDBContainer>
        
    )
    
}