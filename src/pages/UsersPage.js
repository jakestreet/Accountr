import { useState, useEffect, useRef } from 'react'
import { app } from '../components/utils/firebase'
import { collection, query, where, getDocs, getFirestore, doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import bcrypt from 'bcryptjs'
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MDBBadge, MDBBtn, MDBTextArea } from 'mdb-react-ui-kit';
import { Alert } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import CloseIcon from '@mui/icons-material/Close'
import {
    DataGrid,
    gridPageCountSelector,
    gridPageSelector,
    useGridApiContext,
    useGridSelector,
  } from '@mui/x-data-grid';
import Pagination from '@mui/material/Pagination';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { MDBInput } from 'mdb-react-ui-kit';
import PasswordChecklist from "react-password-checklist"

export default function RequestsPage() {

    const db = getFirestore(app);
    const navigate = useNavigate();
    const { currentRole, signupAdmin, logoutAdmin, sendEmail, currentUser, emailMessage } = useAuth();

    const [rows, setRows] = useState([]);

    const [openNewUser, setOpenNewUser] = useState(false);
    const handleOpenNewUser = () => setOpenNewUser(true);
    const handleCloseNewUser = () => setOpenNewUser(false);
    const [openSendEmail, setOpenSendEmail] = useState(false);
    const [openAlert, setOpenAlert] = useState(true);
    const [openEmailAlert, setOpenEmailAlert] = useState(false);
    const handleOpenSendEmail = () => setOpenSendEmail(true);
    const handleCloseSendEmail = () => {
      setOpenSendEmail(false)
      setOpenEmailAlert(false)
    }

    const emailInputRef = useRef();
    const roleInputRef = useRef()
    const passwdInputRef = useRef();
    const conPasswdInputRef = useRef();
    const fNameInputRef = useRef();
    const lNameInputRef = useRef();
    const addressInputRef = useRef();
    const dobInputRef = useRef();
    const subjectInputRef = useRef();
    const bodyInputRef = useRef();
    const [loginStatus, setLoginStatus] = useState("");
    const [emailTo, setEmailTo] = useState("");
    const [password, setPassword] = useState("")
    const [passwordAgain, setPasswordAgain] = useState("")
    const [validPass, setValidPass] = useState("invalid")

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '5px solid rgba(255,255,255,1)',
        boxShadow: 24,
        p: 4,
      };


      async function getRegisteredEmail() {
        try{
          const usersRef = collection(db, "users");
          
          const q = query(usersRef, where("email", "==", emailInputRef.current.value));
        
          const querySnapshot = await getDocs(q);
  
          if(querySnapshot.docs[0]) {
            return querySnapshot.docs[0].data().email;
          }
          else {
            return "none"
          }
        }
        catch (error) {
          console.log(error)
        }
      }


      const SignUpForm = async (e)=>{
        e.preventDefault();
        const email = emailInputRef.current.value;
        const password = passwdInputRef.current.value;
        const firstName = fNameInputRef.current.value;
        const lastName = lNameInputRef.current.value;
        const address = addressInputRef.current.value;
        const dob = dobInputRef.current.value;
        const role = roleInputRef.current.value;

        try {
          const MyDate = new Date();
          const currentYear = String(MyDate.getFullYear());
          const expirationYear = String(MyDate.getFullYear() + 1);
          const currentMonth = ('0' + (MyDate.getMonth()+1)).slice(-2);
          const currentDay = ('0' + (MyDate.getDate())).slice(-2);
          const username = firstName.toLowerCase().substring(0,1) + lastName.toLowerCase() + currentMonth + currentYear.slice(-2)
          const passwordExpiration = expirationYear + "-" + currentMonth + "-" + currentDay;

          const docRef = doc(db, "users", username);
          const docSnap = await getDoc(docRef);
          const registeredEmail = await getRegisteredEmail();

          if(validPass === true) {
            if (!docSnap.exists() && registeredEmail === "none") {
              const hashedPass = await bcrypt.hash(password, 10);
              setDoc(docRef, {
                username: username,
                email: email,
                password: hashedPass,
                firstname: firstName,
                lastname: lastName,
                address: address,
                dob: dob,
                role: role,
                status: "Approved",
                passwordExpiration: passwordExpiration,
                passwordAttempts: 1
              });
              setLoginStatus("Account succesfully created! An email with the username has been sent to the new account.")
              setOpenAlert(true);
              sendEmail(email, "Accountr Request Approved", "Your request for an account with Accountr has been approved. You may now login with the username " + username + " at https://accountr.netlify.app/");
              await signupAdmin(email, password)
              .then((userCredential) => {
                logoutAdmin();
              })
            }
            else {
              setLoginStatus("Email already in use!")
              setOpenAlert(true);
            }
          }
          else {
            setLoginStatus("Check Password Requirements!")
            setOpenAlert(true);
          }
       
        } 
        catch (error) {
          setLoginStatus(error.message);
          setOpenAlert(true);
        }


    }

    function CustomPagination() {
        const apiRef = useGridApiContext();
        const page = useGridSelector(apiRef, gridPageSelector);
        const pageCount = useGridSelector(apiRef, gridPageCountSelector);
        
        return (
            <Pagination
            color="primary"
            count={pageCount}
            page={page + 1}
            onChange={(event, value) => apiRef.current.setPage(value - 1)}
            />
        );
    }

    function UpdateStatusPill(status) {
        if(status === 'Approved')
        {
            return "success"
        }
        else if(status === 'Requested') {
            return "info"
        }
        else if(status === 'Disabled') {
            return "warning"
        }
        else if(status === 'Suspended') {
            return "secondary"
        }
        else if(status === 'Rejected') {
            return "danger"
        }
    }

    async function UpdateStatus(username, status) {
        try{
            const userRef = doc(db, "users", username)

            await updateDoc(userRef, {
                status: status
            });
            await GetRequests();
        }
        catch (error) {
        }
    }

    async function UpdateExpiration(username) {
      try{
          const userRef = doc(db, "users", username)

          await updateDoc(userRef, {
              passwordExpiration: "EXPIRED",
              status: "Expired",
          });
          console.log("Updated Expiration")
      }
      catch (error) {
      }
  }

    function UpdateStatusApprove(status, email, username) {
        if(status === "Approved") {
            return "Suspended"
        }
        else if(status === "Requested") {
          sendEmail(email, "Accountr Request Approved", "Your request for an account with Accountr has been approved. You may now login with the username " + username + " at https://accountr.netlify.app/");
          return "Approved"
        }
        else if(status === "Suspended") {
          return "Approved"
        }
        else if(status === "Rejected" || status === "Disabled") {
            return "Approved"
        }
    }

    function UpdateStatusReject(status) {
        if(status === "Approved" || status === "Suspended") {
            return "Disabled"
        }
        else if(status === "Requested") {
            return "Rejected"
        }
        else if(status === "Rejected" || status === "Disabled") {
            return "Deleted"
        }
    }

    function UpdateButtonApprove(status) {
        if(status === "Approved") {
            return "Suspend"
        }
        else if(status === "Requested") {
            return "Approve"
        }
        else if(status === "Suspended") {
            return "Resume"
        }
        else if(status === "Rejected" || status === "Disabled") {
            return "Approve"
        }
    }

    function UpdateButtonReject(status) {
        if(status === "Approved" || status === "Suspended") {
            return "Disable"
        }
        else if(status === "Requested") {
            return "Reject"
        }
        else if(status === "Rejected" || status === "Disabled") {
            return "Delete"
        }
    }

    const SendAlert = (e)=>{
        if(loginStatus !== "") {
          
          var alertSeverity = "warning";
          
          if(loginStatus === "Account succesfully created! An email with the username has been sent to the new account."){
            alertSeverity = "success";
          }
          
          return (
            <Collapse in={openAlert}>
              <Alert severity={alertSeverity}
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
                {loginStatus}
              </Alert>
            </Collapse>
          )
        } 
    }

    const SendEmailAlert = (e)=>{
        return (
          <Collapse in={openEmailAlert}>
            <Alert severity="success"
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => {
                    setOpenEmailAlert(false);
                  }}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
              sx={{ mb: 2 }}
            >
              {emailMessage}
            </Alert>
          </Collapse>
        )
  }

    async function GetRequests() {
        try {
            const usersRef = collection(db, "users");

            const q = query(usersRef, where("role", "!=", "Admin"));
          
            const querySnapshotExpiration = await getDocs(q);

            
            const MyDate = new Date();
            const currentYear = String(MyDate.getFullYear());
            const currentMonth = ('0' + (MyDate.getMonth()+1)).slice(-2);
            const currentDay = ('0' + (MyDate.getDate())).slice(-2);
            const currentDate = new Date(currentYear + "-" + currentMonth + "-" + currentDay);

            querySnapshotExpiration.forEach(async (doc) => {
              if(doc.data().passwordExpiration !== "EXPIRED") {
                const passwordExpirationDate = new Date(doc.data().passwordExpiration);  
                if(currentDate >= passwordExpirationDate) {
                  await UpdateExpiration(doc.data().username)
                  return GetRequests()
                }
              }
            });

            const querySnapshot = await getDocs(q);

            const rowsArray = [];

            querySnapshot.forEach(async (doc) => {
                rowsArray.push({
                    id: doc.data().email,
                    username: doc.data().username,
                    firstName: doc.data().firstname,
                    lastName: doc.data().lastname,
                    email: doc.data().email,
                    role: doc.data().role,
                    statusText: doc.data().status,
                    statusPill: UpdateStatusPill(doc.data().status),
                    passwordExpiration: doc.data().passwordExpiration
                })
            });

            

            setRows(rowsArray);
            } catch (error) {
            }
    }

    function EmailOnClick(email) {
      setEmailTo(email);
      handleOpenSendEmail();
    }
    
    const SendEmailOnClick = (e)=>{
        e.preventDefault();
        const subject = subjectInputRef.current.value;
        const body = bodyInputRef.current.value;
        sendEmail(emailTo, subject, body);
        //handleCloseSendEmail();
        setOpenEmailAlert(true);
    }

    function RenderActions(username, email, statusText) {
      if(statusText !== "Expired")
      {
        return (
          <div>
            <MDBBtn onClick={() => { UpdateStatus(username, UpdateStatusApprove(statusText, email, username)) }} className="d-md-flex gap-2 mb-2 btn-sm" style={{background: 'rgba(41,121,255,1)'}}>
            {UpdateButtonApprove(statusText)}
            </MDBBtn>
            <MDBBtn onClick={() => { UpdateStatus(username, UpdateStatusReject(statusText)) }} className="d-md-flex gap-2 mt-2 btn-sm" style={{background: 'rgba(41,121,255,1)'}}>
            {UpdateButtonReject(statusText)}
            </MDBBtn>
          </div>
        )
      }
    }

    useEffect(() => {
        let ignore = false;
        
        if (!ignore)  GetRequests()
        return () => { ignore = true; }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        },[]);

    //disable access for users role
    useEffect(() => {
        if(currentRole === "User")
        {
            navigate("/home");
        }
        })

        const columns = [
            {
                field: "username",
                headerName: "Username",
                flex: 1
            },
            {
                field: "firstName",
                headerName: "First Name",
                flex: 1
            },
            {
                field: "lastName",
                headerName: "Last Name",
                flex: 1
            },
            {
                field: "email",
                headerName: "Email",
                flex: 1
            },
            {
                field: "role",
                headerName: "Role",
                flex: 1
            },
            {
                field: "statusText", flex: 1, headerName: "Status",
                renderCell: (cellValues) => {
                  return (
                    <h6>
                      <MDBBadge color={cellValues.row.statusPill} pill>
                          {cellValues.row.statusText}
                      </MDBBadge>
                    </h6>
                  );
                }
            },
            {
              field: "passwordExpiration",
              headerName: "Pass Expiration",
              flex: 1
            },
            {
              field: "Actions", flex: 1,
              renderCell: (cellValues) => {
                return (
                    <div>
                        {RenderActions(cellValues.row.username, cellValues.row.email, cellValues.row.statusText)}
                        <MDBBtn onClick={() => { EmailOnClick(cellValues.row.email) }} className="d-md-flex gap-2 mt-2 btn-sm" style={{background: 'rgba(41,121,255,1)'}}>
                        Email
                        </MDBBtn>
                    </div>
                )
              }
            }
          ];

   return (
        <div style={{ height: 1160, marginLeft:"auto", marginRight:"auto", minWidth:900, maxWidth:1800, padding:25 }}>
        <div className="d-md-flex m-auto mb-3 gap-2">
            <MDBBtn onClick={GetRequests} style={{background: 'rgba(41,121,255,1)'}}>Refresh</MDBBtn>
            <MDBBtn onClick={handleOpenNewUser} style={{background: 'rgba(41,121,255,1)'}}>Create New User</MDBBtn>
        </div>
        <Modal
            open={openNewUser}
            onClose={handleCloseNewUser}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                {SendAlert()}
                <MDBInput wrapperClass='mb-4' label='Email' id='regEmail' type='email' inputRef={emailInputRef}/>
                <MDBInput wrapperClass='mb-4' label='Role (User, Manager, Admin)' id='regFirst' type='text' inputRef={roleInputRef}/>
                <MDBInput wrapperClass='mb-4' label='Password' id='regPassword' type='password' onChange={e => setPassword(e.target.value)} inputRef={passwdInputRef}/>
                  <MDBInput wrapperClass='mb-2' label='Confirm Password' id='regPassword' type='password' onChange={e => setPasswordAgain(e.target.value)} inputRef={conPasswdInputRef}/>
                  <PasswordChecklist className='mb-3'
                  rules={["minLength","specialChar","number","letter","match"]}
                  minLength={8}
                  value={password}
                  valueAgain={passwordAgain}
                  messages={{
                    minLength: "Password has at least 8 characters.",
                  }}
                  onChange={(isValid) => {setValidPass(isValid)}}
                />
                <MDBInput wrapperClass='mb-4' label='First Name' id='regFirst' type='text' inputRef={fNameInputRef}/>
                <MDBInput wrapperClass='mb-4' label='Last Name' id='regLast' type='text' inputRef={lNameInputRef}/>
                <MDBInput wrapperClass='mb-4' label='Address' id='regAddress' type='text' inputRef={addressInputRef}/>
                <MDBInput wrapperClass='mb-4' label='Date of Birth' id='regDoB' type='date' inputRef={dobInputRef}/>
                <MDBBtn onClick={SignUpForm} className="d-md-flex mb-2 m-auto" style={{background: 'rgba(41,121,255,1)'}}>Create User</MDBBtn>
                <MDBBtn onClick={handleCloseNewUser} className="d-md-flex m-auto" style={{background: 'rgba(41,121,255,1)'}}>Close</MDBBtn>
            </Box>
        </Modal>
        <Modal
            open={openSendEmail}
            onClose={handleCloseSendEmail}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                {SendEmailAlert()}
                <label>To: {emailTo}</label>
                <label>From: {currentUser.email}</label>
                <MDBInput wrapperClass='mb-4 mt-2' label='Subject' id='subject' type='text' inputRef={subjectInputRef}/>
                <MDBTextArea label="Body" id="body" type="text" rows={10} inputRef={bodyInputRef}></MDBTextArea>
                <MDBBtn onClick={SendEmailOnClick} className="d-md-flex m-auto mt-4" style={{background: 'rgba(41,121,255,1)'}}>Send Email</MDBBtn>
                <MDBBtn onClick={handleCloseSendEmail} className="d-md-flex m-auto mt-4" style={{background: 'rgba(41,121,255,1)'}}>Close</MDBBtn>
            </Box>
        </Modal>           
        <DataGrid
            sx={{ "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "rgba(41,121,255,1)",
                color: "rgba(255,255,255,1)",
                fontSize: 16,
              }, 
              '&.MuiDataGrid-root .MuiDataGrid-columnHeader:focus, &.MuiDataGrid-root .MuiDataGrid-cell:focus': {
                outline: 'none', }
            }}
          rowHeight={120}
          rows={rows}
          columns={columns}
          pageSize={10}
          components={{ 
            Pagination: CustomPagination
            }}
            hideFooterRowCount={true}
            hideFooterSelectedRowCount={true}
        />
      </div>
   )
}

