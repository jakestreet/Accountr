import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react'
import Avatar from '@mui/material/Avatar';
import { MDBBtn, MDBCol, MDBInput, MDBRow, MDBCard } from 'mdb-react-ui-kit';

export default function EditProfilePage() {

    const { currentUser, upload } = useAuth();
    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(false);

    function handleChange(e) {
        if (e.target.files[0]) {
          setPhoto(e.target.files[0])
        }
      }
    
      function handleClick() {
        upload(photo, currentUser, setLoading);
      }
    

    return (
        <MDBRow className='mt-5'>
            <MDBCol lg="5" className='m-auto'>
                <MDBCard className="mb-4">
                    <h1 className="text-center mt-3">Edit Profile</h1>
                    <div>
                        <Avatar className = "m-auto"src={currentUser.photoURL} sx={{ width: 250, height: 250}} />
                        <MDBRow >
                            <MDBCol className='d-flex align-items-center justify-content-center gap-2 mt-2'>
                                <MDBInput type="file" onChange={handleChange} />
                                <MDBBtn disabled={loading || !photo} onClick={handleClick}>Upload</MDBBtn>
                            </MDBCol>
                        </MDBRow>
                    </div>
                </MDBCard> 
            </MDBCol>
        </MDBRow>
    )   
}
