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
import bcrypt from 'bcryptjs';
import { Alert } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import CloseIcon from '@mui/icons-material/Close';
import PasswordChecklist from "react-password-checklist"
import { collection, query, where, getDocs, getFirestore, doc, updateDoc, getDoc} from "firebase/firestore";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ResetPage() {
    const passwdInputRef = useRef();
    const conPasswdInputRef = useRef();
    const [message, setMessage] = useState("");
    const [alertSeverity, setAlertSeverity] = useState("success");
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("not loaded");
    const { resetPassword } = useAuth();
    const queryURL = useQuery();
    const db = getFirestore(app);
    const oobCode = queryURL.get('oobCode')
    const [password, setPassword] = useState("")
    const [passwordAgain, setPasswordAgain] = useState("")
    const [validPass, setValidPass] = useState("invalid")

    useEffect(() => {
      const verifyCode = async () => {
        await verifyPasswordResetCode(auth, oobCode).then((email) => {
          setEmail(email);
        })
      }
      const getUsername = async () => {
        if(username === "not loaded") {
          const usersRef = collection(db, "users");

          const q = query(usersRef, where("email", "==", email));
        
          const querySnapshot = await getDocs(q);
          
          querySnapshot.forEach(async (doc) => {
            setUsername(doc.data().username)
          });
        }
      }
      verifyCode();
      getUsername();
    })

    const ResetPassword = async (e)=>{
        const password = passwdInputRef.current.value;
        
        const MyDate = new Date();
        const expirationYear = String(MyDate.getFullYear() + 1);
        const currentMonth = ('0' + (MyDate.getMonth()+1)).slice(-2);
        const currentDay = ('0' + (MyDate.getDate())).slice(-2);
        const passwordExpiration = expirationYear + "-" + currentMonth + "-" + currentDay;
        
        const docRef = doc(db, "users", username);
        const docSnap = await getDoc(docRef);

        if(validPass === true) {
          
          const hashedPass = await bcrypt.hash(password, 10);

          if(await bcrypt.compare(password, docSnap.data().password)) {
            setAlertSeverity("warning")
            setMessage("Your new password must be different than your previous password.")
            return setOpen(true)
          }
          try{
            const userRef = doc(db, "users", username)

            await updateDoc(userRef, {
                password: hashedPass,
                status: "Approved",
                passwordExpiration: passwordExpiration
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
          <MDBBtn onClick={ResetPassword}className="mb-4 w-25 m-auto mt-2">Reset Password</MDBBtn>
          <MDBBtn className="mb-4 w-25 m-auto" href="/" color="link">Return to Log In</MDBBtn>
        </MDBContainer>
      </div>
    )
    
}