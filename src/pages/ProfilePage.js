import { useAuth } from '../contexts/AuthContext';
import Avatar from '@mui/material/Avatar';
import { MDBCol, MDBRow, MDBCard, MDBCardBody, MDBCardText } from 'mdb-react-ui-kit';

export default function ProfilePage() {
  

    const { currentUser, currentRole, passExpirationDays, currentUserInfo } = useAuth();


    return (
      <div>
      <MDBRow className='mt-5'>
        <MDBCol lg="5" className='m-auto'>
          <MDBCard className="mb-4">
            <MDBCardBody className="text-center">
              <Avatar src={currentUser.photoURL} sx={{width: 250, height: 250, margin: "auto"}} />
              <p className="text-muted mb-1 mt-4">{currentUser.displayName}</p>
              <p className="text-muted mb-0">{currentRole}</p>
            </MDBCardBody>
            <MDBCardBody>
                <MDBRow>
                <MDBCol sm="3">
                  <MDBCardText>Full Name</MDBCardText>
                </MDBCol>
                <MDBCol sm="9">
                  <MDBCardText className="text-muted">{currentUserInfo.firstName}</MDBCardText>
                </MDBCol>
              </MDBRow>
              <hr />
              <MDBRow>
                <MDBCol sm="3">
                  <MDBCardText>Email</MDBCardText>
                </MDBCol>
                <MDBCol sm="9">
                  <MDBCardText className="text-muted">{currentUser.email}</MDBCardText>
                </MDBCol>
              </MDBRow>
              <hr />
              <MDBRow>
                <MDBCol sm="3">
                  <MDBCardText>Address</MDBCardText>
                </MDBCol>
                <MDBCol sm="9">
                  <MDBCardText className="text-muted">{currentUserInfo.address}</MDBCardText>
                </MDBCol>
              </MDBRow>
              <hr />
              <MDBRow>
                <MDBCol sm="3">
                  <MDBCardText>Date of Birth</MDBCardText>
                </MDBCol>
                <MDBCol sm="9">
                  <MDBCardText className="text-muted">{currentUserInfo.dob}</MDBCardText>
                </MDBCol>
              </MDBRow>
              <hr />
              <MDBRow>
                <MDBCol sm="3">
                  <MDBCardText>Password Expiration</MDBCardText>
                </MDBCol>
                <MDBCol sm="9">
                  <MDBCardText className="text-muted">Password expires in {passExpirationDays} days</MDBCardText>
                </MDBCol>
              </MDBRow>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
      </MDBRow>
  </div> 
    )   
}
