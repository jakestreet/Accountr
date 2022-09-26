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
                <MDBCol sm="4">
                  <MDBCardText className='ms-4'>Full Name:</MDBCardText>
                </MDBCol>
                <MDBCol sm="8">
                  <MDBCardText className="text-end me-4 text-muted">{currentUserInfo && currentUserInfo.firstName + " " + currentUserInfo.lastName}</MDBCardText>
                </MDBCol>
              </MDBRow>
              <hr />
              <MDBRow>
                <MDBCol sm="4">
                  <MDBCardText className='ms-4'>Email:</MDBCardText>
                </MDBCol>
                <MDBCol sm="8">
                  <MDBCardText className="text-end me-4 text-muted">{currentUserInfo && currentUser.email}</MDBCardText>
                </MDBCol>
              </MDBRow>
              <hr />
              <MDBRow>
                <MDBCol sm="4">
                  <MDBCardText className='ms-4'>Address:</MDBCardText>
                </MDBCol>
                <MDBCol sm="8">
                  <MDBCardText className="text-end me-4 text-muted">{currentUserInfo && currentUserInfo.address}</MDBCardText>
                </MDBCol>
              </MDBRow>
              <hr />
              <MDBRow>
                <MDBCol sm="4">
                  <MDBCardText className='ms-4'>Date of Birth:</MDBCardText>
                </MDBCol>
                <MDBCol sm="8">
                  <MDBCardText className="text-end me-4 text-muted">{currentUserInfo && currentUserInfo.dob}</MDBCardText>
                </MDBCol>
              </MDBRow>
              <hr />
              <MDBRow>
                <MDBCol sm="4">
                  <MDBCardText className='ms-4'>Password Expiration:</MDBCardText>
                </MDBCol>
                <MDBCol sm="8">
                  <MDBCardText className="text-end me-4 text-muted">Password expires in {currentUserInfo && passExpirationDays} days</MDBCardText>
                </MDBCol>
              </MDBRow>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
      </MDBRow>
  </div> 
    )   
}
