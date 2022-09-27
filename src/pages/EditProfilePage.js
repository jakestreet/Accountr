import { useAuth } from '../contexts/AuthContext';
import { useState, useRef } from 'react'
import Avatar from '@mui/material/Avatar';
import { MDBBtn, MDBCol, MDBInput, MDBRow, MDBCard, MDBCardText } from 'mdb-react-ui-kit';
import { Alert } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import CloseIcon from '@mui/icons-material/Close'
import { doc, updateDoc, getDoc, getFirestore } from "firebase/firestore";
import { app, auth } from '../components/utils/firebase'

export default function EditProfilePage() {

    const db = getFirestore(app);
    const { currentUser, upload, currentUserInfo, setCurrentUserInfo } = useAuth();
    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(false);
    const fNameInputRef = useRef();
    const lNameInputRef = useRef();
    const addressInputRef = useRef();
    const dobInputRef = useRef();
    const [openAlert, setOpenAlert] = useState(false);

    function handleChange(e) {
        if (e.target.files[0]) {
          setPhoto(e.target.files[0])
        }
      }
    
      function handleClick() {
        upload(photo, currentUser, setLoading);
      }

    async function UpdateInformation() {
        const firstName = fNameInputRef.current.value
        const lastName = lNameInputRef.current.value
        const address = addressInputRef.current.value
        const dob = dobInputRef.current.value

        const docRef = doc(db, "users", auth.currentUser.displayName);
        const docSnap = await getDoc(docRef);
        const userInfo = {
            firstName: firstName,
            lastName: lastName,
            address: address,
            dob: dob
        }
        
        const uploadInformation = await updateDoc(docRef, {
            firstName: fNameInputRef.current.value,
            lastName: lNameInputRef.current.value,
            address: addressInputRef.current.value,
            dob: dobInputRef.current.value
        }).then(setCurrentUserInfo(userInfo))
        setOpenAlert(true);
        
    }

    function RenderInformation() {
        return(
            <div>
                <hr className='mt-4'/>
                <MDBRow className="row d-flex justify-content-center">
                    <MDBCol sm="4">
                    <MDBCardText className="mt-2">First Name:</MDBCardText>
                    </MDBCol>
                    <MDBCol sm="4">
                    <MDBInput wrapperClass='mb-4 mt-2' defaultValue={currentUserInfo && currentUserInfo.firstName} id='upFirst' type='text' inputRef={fNameInputRef}/>
                    </MDBCol>
                </MDBRow>
                <MDBRow className="row d-flex justify-content-center">
                    <MDBCol sm="4">
                    <MDBCardText className="mt-2">Last Name:</MDBCardText>
                    </MDBCol>
                    <MDBCol sm="4">
                    <MDBInput wrapperClass='mb-4 mt-2' defaultValue={currentUserInfo && currentUserInfo.lastName} id='upLast' type='text' inputRef={lNameInputRef}/>
                    </MDBCol>
                </MDBRow>
                <MDBRow className="row d-flex justify-content-center">
                    <MDBCol sm="4">
                    <MDBCardText className="mt-2">Address:</MDBCardText>
                    </MDBCol>
                    <MDBCol sm="4">
                    <MDBInput wrapperClass='mb-4 mt-2' defaultValue={currentUserInfo && currentUserInfo.address} id='upAddress' type='text' inputRef={addressInputRef}/>
                    </MDBCol>
                </MDBRow>
                <MDBRow className="row d-flex justify-content-center">
                    <MDBCol sm="4">
                    <MDBCardText className="mt-2">Date of Birth:</MDBCardText>
                    </MDBCol>
                    <MDBCol sm="4">
                    <MDBInput wrapperClass='mb-4 mt-2' defaultValue={currentUserInfo && currentUserInfo.dob} id='upDOB' type='date' inputRef={dobInputRef}/>
                    </MDBCol>
                </MDBRow>
                <MDBRow className="row d-flex justify-content-center">
                    <MDBCol sm="4">
                    <MDBBtn onClick={()=>{UpdateInformation()}} className="mt-2 mb-4 ms-3">Confirm</MDBBtn>
                    </MDBCol>
                </MDBRow>
            </div>
        )
    }

    const SendAlert = (e)=>{
          return (
            <Collapse in={openAlert}>
              <Alert severity="success"
                action={
                  <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={() => {
                      setOpenAlert(false);
                    }}
                  >
                    <CloseIcon fontSize="inherit" />
                  </IconButton>
                }
                sx={{ mb: 2 }}
              >
                Information updated successfully!
              </Alert>
            </Collapse>
          )
    }
    

    return (
        <div>
            {SendAlert()}
            <MDBRow className='mt-5'>
                <MDBCol lg="5" className='m-auto'>
                    <MDBCard className="mb-4">
                        <h1 className="text-center mt-3">Edit Profile</h1>
                        <div>
                            <Avatar className = "m-auto" src={currentUser.photoURL} sx={{ width: 250, height: 250}} />
                            <MDBRow >
                                <MDBCol className='d-flex align-items-center justify-content-center gap-2 mt-2'>
                                    <MDBInput type="file" onChange={handleChange} />
                                    <MDBBtn disabled={loading || !photo} onClick={handleClick}>Upload</MDBBtn>
                                </MDBCol>
                            </MDBRow>
                            {RenderInformation()}
                        </div>
                    </MDBCard> 
                </MDBCol>
            </MDBRow>
        </div>
    )   
}
