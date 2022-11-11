import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext';
import Avatar from '@mui/material/Avatar';
import { MDBCol, MDBRow, MDBCard, MDBCardBody, MDBCardText, MDBBtn, MDBTooltip } from 'mdb-react-ui-kit';
import { useNavigate } from 'react-router-dom';
import Modal from '@mui/material/Modal';
export default function ProfilePage() {
  const [openHelp, setOpenHelp] = useState(false);
  const handleOpenHelp = () => setOpenHelp(true);
  const handleCloseHelp = () => setOpenHelp(false);

  const { currentUser, currentRole, passExpirationDays, currentUserInfo, StyledTooltip } = useAuth();
  const navigate = useNavigate();

  const EditProfileNavigate = async (e) => {
    e.preventDefault();
    navigate("/edit-profile");
  }



  return (
    <div>
      <MDBRow className='mt-5'>
        <MDBCol lg="5" className='m-auto'>
          <MDBCard className="mb-4">
            <MDBCardBody className="text-center">
              <Avatar src={currentUser.photoURL} sx={{ width: 250, height: 250, margin: "auto" }} />
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
              <MDBCardBody className="text-center mt-4">
                <StyledTooltip
                  title="Edit your profile information"
                  placement='top'
                  arrow
                >
                  <MDBBtn onClick={(e) => { EditProfileNavigate(e) }} className=''>Edit Profile</MDBBtn>
                </StyledTooltip>

              </MDBCardBody>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
      </MDBRow>
      <div class="fixed-bottom">
        <MDBTooltip tag='a' placement="auto" title="Help">
          <button type="button" class="btn btn-primary btn-floating" onClick={() => { handleOpenHelp() }}>?</button>
        </MDBTooltip>

        <Modal
          open={openHelp}
          onClose={handleOpenHelp}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <div class="card">
            <div class="card-body">
              <dl class="row">
                <dt class="col-sm-3">View personal account information:</dt>
                <dd class="col-sm-9">Profile picture, full name, email, address, date of birth, and password expiration date are displayed.</dd>
              </dl>
            </div>
            <MDBBtn onClick={handleCloseHelp} className="d-md-flex m-auto mt-4" style={{ background: 'rgba(41,121,255,1)' }}>Close</MDBBtn>
          </div>
        </Modal>
      </div>
    </div>
  )
}
