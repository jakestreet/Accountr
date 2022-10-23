import { auth, app } from '../components/utils/firebase';
import { useState, useEffect, useRef } from 'react'
import { collection, query, where, getDocs, getFirestore, doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import bcrypt from 'bcryptjs'
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MDBBadge, MDBBtn, MDBTextArea, MDBCardText } from 'mdb-react-ui-kit';
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

export default function AccountsPage() {
    const db = getFirestore(app);

    const [rows, setRows] = useState([]);

    const {currentUser, setCurrentUserInfo} = useAuth();

    // const 

    const [openNewAccount, setOpenNewAccount] = useState(false);
    const handleOpenNewAccount = () => setOpenNewAccount(true);
    const handleCloseNewAccount = () => setOpenNewAccount(false);

    const [loginStatus, setLoginStatus] = useState("");
    const [openAlert, setOpenAlert] = useState(true);

    const categoryInputRef = useRef();
    const commentInputRef = useRef();
    const descriptionInputRef = useRef();
    const initialBalInputRef = useRef();
    const nameInputRef = useRef();
    const normalSideInputRef = useRef();
    const orderInputRef = useRef();
    const statementInputRef = useRef();
    const subCategoryInputRef = useRef();
    //Maybe generate an UUID???
    const accountNumberInputRef = useRef();


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

    const GetRole = async (e)=>{

            const docRef = doc(db, "users", auth.currentUser.displayName);
            const docSnap = await getDoc(docRef);
            const userInfo = {
                firstName: docSnap.data().firstname,
                lastName: docSnap.data().lastname,
                address: docSnap.data().address,
                dob: docSnap.data().dob
            }
            setCurrentUserInfo(userInfo)

    }

    const NewAccountForm = async (e)=> {
        // e.preventDefault();
        const category = categoryInputRef.current.value;
        const comment = commentInputRef.current.value;
        const description = descriptionInputRef.current.value;
        const initialBal = initialBalInputRef.current.value;
        const accountName = nameInputRef.current.value;
        const normalSide = normalSideInputRef.current.value;
        const order = orderInputRef.current.value;
        const statement = statementInputRef.current.value;
        const subCategory = subCategoryInputRef.current.value;
        const accountNumber = accountNumberInputRef.current.value;

        try{
            const MyDate = new Date();
            const currentYear = String(MyDate.getFullYear());
            const currentMonth = ('0' + (MyDate.getMonth()+1)).slice(-2);
            const currentDay = ('0' + (MyDate.getDate())).slice(-2);
            const currentDate = currentYear + "-" + currentMonth + "-" + currentDay;
            const userID = currentUser.displayName;

            const docRef = doc(db, "accounts", accountNumber)
            
            setDoc(docRef, {
                category: category,
                comment: comment,
                dateAdded: currentDate,
                description: description,
                initialBal: initialBal,
                name: accountName,
                normalSide: normalSide,
                order: order,
                statement: statement,
                subCategory: subCategory,
                userID: userID
            });
            setLoginStatus("Account succesfully created! An email with the username has been sent to the new account.")
            setOpenAlert(true);
        }
        catch (error){
            setLoginStatus(error.message);
            setOpenAlert(true);
        }
    }

    async function GetRequests(){
        try{
            const accountsRef = collection(db, "accounts");

            const q = query(accountsRef);

            const querySnapshotExpiration = await getDocs(q);

            const rowsArray = [];

            console.log("got accounts");
            
            const querySnapshot = await getDocs(q);

            querySnapshot.forEach(async (doc) => {
                console.log(doc.id)
                rowsArray.push({
                    id: doc.id,
                    category: doc.data().category,
                    comment: doc.data().comment,
                    dateAdded: doc.data().dateAdded,
                    description: doc.data().description,
                    initialBal: doc.data().initialBal,
                    name: doc.data().name,
                    normalSide: doc.data().normalSide,
                    order: doc.data().order,
                    statement: doc.data().statement,
                    subCategory: doc.data().subCategory,
                    userID: doc.data().userID
                })
            });

            

            setRows(rowsArray);
        } 
        catch (error) {}
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
    
    const columns = [
        {
            field: "category",
            headerName: "Category",
            flex: 1
        },
        {
            field: "comment",
            headerName: "Comment",
            flex: 1
        },
        {
            field: "dateAdded",
            headerName: "Date Added",
            flex: 1
        },
        {
            field: "initialBal",
            headerName: "Initial Balance",
            flex: 1
        },
        {
            field: "name",
            headerName: "Name",
            flex: 1
        },
        {
            field: "normalSide",
            headerName: "Normal Side",
            flex: 1
        },
        {
            field: "order",
            headerName: "Order",
            flex: 1
        },
        {
            field: "statement",
            headerName: "Statement",
            flex: 1
        },
        {
            field: "subCategory",
            headerName: "Sub-Category",
            flex: 1
        },
        {
            field: "userID",
            headerName: "User ID",
            flex: 1
        }
    ];
    useEffect(() => {
        let ignore = false;
        
        if (!ignore)  GetRequests()
        return () => { ignore = true; }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        },[]);
    return(
        <div style={{ height: 1160, marginLeft:"auto", marginRight:"auto", minWidth:900, maxWidth:1800, padding:25 }}>
            <h1 className="text-center mt-3">Accounts</h1>
            <div className="d-md-flex m-auto mb-3 gap-2">
                <MDBBtn onClick={() => {GetRequests()}} style={{background: 'rgba(41,121,255,1)'}}>Refresh</MDBBtn>
                <MDBBtn onClick={() => {handleOpenNewAccount()}} style={{background: 'rgba(41,121,255,1)'}}>Create New Account</MDBBtn>
            </div>
            <Modal
                open={openNewAccount}
                onClose={handleCloseNewAccount}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    {SendAlert()}
                    <MDBInput wrapperClass='mb-4' label='Category' id='regCategory' type='text' inputRef={categoryInputRef}/>
                    <MDBInput wrapperClass='mb-4' label='Comment' id='regComment' type='text' inputRef={commentInputRef}/>
                    <MDBInput wrapperClass='mb-4' label='Description' id='regDescription' type='text' inputRef={descriptionInputRef}/>
                    <MDBInput wrapperClass='mb-4' label='Initial Balance' id='regInitialBal' type='text'  inputRef={initialBalInputRef}/>
                    <MDBInput wrapperClass='mb-4' label='Account Name' id='regAccountName' type='text' inputRef={nameInputRef}/>
                    <MDBInput wrapperClass='mb-4' label='Normal Side' id='regNormalSide' type='text' inputRef={normalSideInputRef}/>
                    <MDBInput wrapperClass='mb-4' label='Order' id='regOrder' type='text' inputRef={orderInputRef}/>
                    <MDBInput wrapperClass='mb-4' label='Statement' id='regStatement' type='text' inputRef={statementInputRef}/>
                    <MDBInput wrapperClass='mb-4' label='Sub-Category' id='regSubCategory' type='text' inputRef={subCategoryInputRef}/>
                    <MDBInput wrapperClass='mb-4' label='Account Number' id='accountNumberbCategory' type='text' inputRef={accountNumberInputRef}/>
                    <MDBBtn onClick={() => {NewAccountForm()}} className="d-md-flex mb-2 m-auto" style={{background: 'rgba(41,121,255,1)'}}>Create Account</MDBBtn>
                    <MDBBtn onClick={() => {handleCloseNewAccount()}} className="d-md-flex m-auto" style={{background: 'rgba(41,121,255,1)'}}>Close</MDBBtn>
                </Box>
            </Modal>
            <div style={{ height: 1160, marginLeft:"auto", marginRight:"auto", minWidth:900, maxWidth:1800}}>            
                <DataGrid
                    sx={{ "& .MuiDataGrid-columnHeaders": {
                        backgroundColor: "rgba(41,121,255,1)",
                        color: "rgba(255,255,255,1)",
                        fontSize: 16,
                    }, 
                    '&.MuiDataGrid-root .MuiDataGrid-columnHeader:focus, &.MuiDataGrid-root .MuiDataGrid-cell:focus': {
                        outline: 'none', }
                    }}
                rowHeight={160}
                rows={rows}
                columns={columns}
                pageSize={10}
                getRowId={(row) => row.id}
                components={{ 
                    Pagination: CustomPagination
                    }}
                    hideFooterRowCount={true}
                    hideFooterSelectedRowCount={true}
                />
            </div>
        </div> 
    )
}