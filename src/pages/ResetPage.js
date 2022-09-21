import { useRef, useState, useEffect } from 'react';
import {
    MDBContainer,
    MDBInput,
    MDBBtn,
  }
from 'mdb-react-ui-kit';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { verifyPasswordResetCode } from 'firebase/auth' 
import { auth } from '../components/utils/firebase'
import { app } from '../components/utils/firebase'
import { doc, updateDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import bcrypt from 'bcryptjs';
import { Alert } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import CloseIcon from '@mui/icons-material/Close';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ResetPage() {
    const passwordInputRef = useRef();
    const confirmPasswordInputRef = useRef();
    const [message, setMessage] = useState("");
    const [alertSeverity, setAlertSeverity] = useState("success");
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState("");
    const { resetPassword } = useAuth();
    const query = useQuery();
    const db = getFirestore(app);
    const oobCode = query.get('oobCode')

    useEffect(() => {
      const verifyCode = async () => {
        await verifyPasswordResetCode(auth, oobCode).then((email) => {
          setEmail(email);
        })
      }
      verifyCode();
    })

    const ResetPassword = async (e)=>{
        const password = passwordInputRef.current.value;
        const conPassword = confirmPasswordInputRef.current.value;

        if(password !== "" && password === conPassword) {
          
          const hashedPass = await bcrypt.hash(password, 10);

          console.log(hashedPass)
          try{
            const userRef = doc(db, "users", email)

            await updateDoc(userRef, {
                password: hashedPass
            });

            return resetPassword(oobCode, password).then(
              setMessage("Password Succesfully Reset!"),
              setAlertSeverity("success"),
              setOpen(true)
              ).catch(e => {
                setMessage(e.message)
                setAlertSeverity("warning")
                setOpen(true)
              })
        }
        catch (error) {
          setMessage(error)
          setAlertSeverity("warning");
          setOpen(true);
        }
          
        }
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
          <h1>Reset Password</h1>
          <MDBInput wrapperClass='mb-4 w-50 m-auto mt-4' label='New Password' id='resetPassword' type='password' inputRef={passwordInputRef}/>
          <MDBInput wrapperClass='mb-4 w-50 m-auto' label='Confirm New Password' id='resetConfirmPassword' type='password' inputRef={confirmPasswordInputRef}/>
          <MDBBtn onClick={ResetPassword}className="mb-4 w-25 m-auto mt-2">Reset Password</MDBBtn>
          <MDBBtn className="mb-4 w-25 m-auto" href="/" color="link">Return to Log In</MDBBtn>
        </MDBContainer>
      </div>
    )
    
}