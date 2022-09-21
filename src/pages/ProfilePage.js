import { useAuth } from '../contexts/AuthContext';
import { useRef, useState, useEffect } from 'react'
import Avatar from '@mui/material/Avatar';
import { MDBBtn, MDBCol, MDBInput, MDBRow, MDBCard, MDBCardBody, MDBCardImage, MDBCardText } from 'mdb-react-ui-kit';

export default function ProfilePage() {

    const { currentUser, currentRole } = useAuth();
  
    return (
        <div>
            <MDBRow className='mt-5'>
              <MDBCol lg="5" className='m-auto'>
                <MDBCard className="mb-4">
                  <MDBCardBody className="text-center">
                    <Avatar src={currentUser.photoURL} sx={{width: 250, height: 250, margin: "auto"}} />
                    <p className="text-muted mb-1 mt-4">{currentUser.email}</p>
                    <p className="text-muted mb-0">{currentRole}</p>
                  </MDBCardBody>

                  <MDBCardBody>
                    <MDBRow>
                      <MDBCol sm="3">
                        <MDBCardText>Full Name</MDBCardText>
                      </MDBCol>
                      <MDBCol sm="9">
                        <MDBCardText className="text-muted">Placeholder</MDBCardText>
                      </MDBCol>
                    </MDBRow>
                    <hr />
                    <MDBRow>
                      <MDBCol sm="3">
                        <MDBCardText>Email</MDBCardText>
                      </MDBCol>
                      <MDBCol sm="9">
                        <MDBCardText className="text-muted">Placeholder</MDBCardText>
                      </MDBCol>
                    </MDBRow>
                    <hr />
                    <MDBRow>
                      <MDBCol sm="3">
                        <MDBCardText>Phone</MDBCardText>
                      </MDBCol>
                      <MDBCol sm="9">
                        <MDBCardText className="text-muted">Placeholder</MDBCardText>
                      </MDBCol>
                    </MDBRow>
                    <hr />
                    <MDBRow>
                      <MDBCol sm="3">
                        <MDBCardText>Mobile</MDBCardText>
                      </MDBCol>
                      <MDBCol sm="9">
                        <MDBCardText className="text-muted">Placeholder</MDBCardText>
                      </MDBCol>
                    </MDBRow>
                    <hr />
                    <MDBRow>
                      <MDBCol sm="3">
                        <MDBCardText>Address</MDBCardText>
                      </MDBCol>
                      <MDBCol sm="9">
                        <MDBCardText className="text-muted">Placeholder</MDBCardText>
                      </MDBCol>
                    </MDBRow>
                  </MDBCardBody>
                  </MDBCard>
              </MDBCol>
            </MDBRow>
        </div> 
    )   
}
