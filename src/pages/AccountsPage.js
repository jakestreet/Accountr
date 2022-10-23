import { app } from '../components/utils/firebase';
import { useState, useEffect, useRef } from 'react'
import { collection, query, getDocs, getFirestore, doc, getDoc, setDoc, updateDoc, where, deleteDoc  } from "firebase/firestore";
import { useAuth } from '../contexts/AuthContext';
import { MDBBtn, MDBCardText } from 'mdb-react-ui-kit';
import { Alert, CircularProgress } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import CloseIcon from '@mui/icons-material/Close'
import {
    DataGrid,
    gridPageCountSelector,
    gridPageSelector,
    useGridApiContext,
    useGridSelector,
    GridToolbar,
  } from '@mui/x-data-grid';
import Pagination from '@mui/material/Pagination';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { MDBInput } from 'mdb-react-ui-kit';
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import { GTranslate } from '@mui/icons-material';

export default function AccountsPage() {
    const db = getFirestore(app);

    const [rows, setRows] = useState([]);

    const {currentUser, captureEvent, storeEvent} = useAuth();


    const [openNewAccount, setOpenNewAccount] = useState(false);
    const handleOpenNewAccount = () => setOpenNewAccount(true);
    const handleCloseNewAccount = () => setOpenNewAccount(false);

    const [alert, setAlert] = useState("");
    const [openAlert, setOpenAlert] = useState(true);
    const [loading, setLoading] = useState(false);

    // Edit Account
    const [openEditAcc, setEditAcc] = useState(false);
    const handleOpenEditAcc = () => setEditAcc(true);
    const handleCloseEditAcc = () => setEditAcc(false);
    const [selectedAcc, setSelectedAcc] = useState({});

    // Remove Account
    const [openRemoveConfirmation, setRemoveConfirmation] = useState(false);
    const handleOpenRemoveConfirmation = () => setRemoveConfirmation(true);
    const handleCloseRemoveConfirmation = () => setRemoveConfirmation(false);

    // Input References
    const categoryInputRef = useRef();
    const commentInputRef = useRef();
    const descriptionInputRef = useRef();
    const initialBalInputRef = useRef();
    const nameInputRef = useRef();
    const normalSideInputRef = useRef();
    const orderInputRef = useRef();
    const statementInputRef = useRef();
    const subCategoryInputRef = useRef();
    const serverStamp = firebase.firestore.Timestamp

    const editCategoryInputRef = useRef();
    const editCommentInputRef = useRef();
    const editDescriptionInputRef = useRef();
    const editInitialBalInputRef = useRef();
    const editNameInputRef = useRef();
    const editNormalSideInputRef = useRef();
    const editOrderInputRef = useRef();
    const editStatementInputRef = useRef();
    const editSubCategoryInputRef = useRef();

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
    
    const DeleteAccount = async (e)=>{
        const accountNumber = selectedAcc.id;

        console.log(`Removing ${accountNumber}`);

        try{
            const accRef = doc(db, "accounts", selectedAcc.id)

            await deleteDoc(accRef);
            GetRequests()
            setAlert("Account removed succesful!");
            setOpenAlert(true);
        }
        catch(error){
            setAlert(`Account removed succesful!\n${error.message}`);
            setOpenAlert(true);
        }
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
        var accountNumber;

        try{
            setLoading(true);
            const accountsRef = collection(db, "accounts");
        
            var lowerRange;
            if(category === "assets") {
                lowerRange = 100;
            }
            else if(category === "liabilities") {
                lowerRange = 200;
            }
            else if(category === "equity") {
                lowerRange = 300;
            }
            else if(category === "revenues") {
                lowerRange = 400;
            }
            else if(category === "expenses") {
                lowerRange = 500;
            }
            const upperRange = lowerRange + 100;
    
            const q = query(accountsRef, where('accountNumber', '>=', lowerRange), where('accountNumber', '<', upperRange));
    
            const querySnapshot = await getDocs(q);
    
            const length = querySnapshot.docs.length;

            if(length === 0) {
                accountNumber = lowerRange;
            }
            else{
                const newAccountNumber = parseInt(querySnapshot.docs[length - 1].data().accountNumber) + 1;
                accountNumber = newAccountNumber;
            }

            const userID = currentUser.displayName;

            const docRef = doc(db, "accounts", accountNumber.toString())
            console.log("reached");
            
            setDoc(docRef, {
                category: category,
                comment: comment,
                dateAdded: serverStamp.now(),
                description: description,
                initialBal: initialBal,
                name: accountName,
                normalSide: normalSide,
                order: order,
                statement: statement,
                subCategory: subCategory,
                userID: userID,
                accountNumber: accountNumber
            });
            
            const id = await storeEvent(currentUser.displayName);
            // eslint-disable-next-line no-unused-vars
            const beforeCapture = await captureEvent(id, "before");
            // eslint-disable-next-line no-unused-vars
            const refresh = await GetRequests().then(setTimeout(() => {captureEvent(id, "after")}, 1000));
            setLoading(false);
            setAlert("Account succesfully created!")
            setOpenAlert(true);
        }
        catch (error){
            setAlert(error.message);
            setOpenAlert(true);
            setLoading(false);
        }
    }

    async function GetRequests(){
        try{
            const accountsRef = collection(db, "accounts");

            const q = query(accountsRef);

            // eslint-disable-next-line no-unused-vars
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
                    dateAdded: doc.data().dateAdded.toDate(),
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
        if(alert !== "") {
          
            var alertSeverity = "warning";


            if(alert === "Account succesfully created!"){
                alertSeverity = "success";
            }
            else if(alert === "Edit Account Succesful!"){
                alertSeverity = "success";
            }
            else if(alert === "Account removed succesful!"){
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
                    {alert}
                </Alert>
            </Collapse>
            )
        } 
    }

    const RemoveConfirmation = () =>{
        return(
            <div>
                <label>Do you want to delete the account {selectedAcc.name}?</label>
            </div>
        )
    }

    const getAccRow = () =>{
        return(
            <div>
                <MDBCardText className='mb-0'>Category</MDBCardText>
                <MDBInput defaultValue={selectedAcc.category} id='regCategory' type='text' inputRef={editCategoryInputRef}/>
                
                <MDBCardText className='mb-0'>Comment</MDBCardText>
                <MDBInput defaultValue={selectedAcc.comment} id='regCategory' type='text' inputRef={editCommentInputRef}/>
                
                <MDBCardText className='mb-0'>Description</MDBCardText>
                <MDBInput defaultValue={selectedAcc.description} id='regCategory' type='text' inputRef={editDescriptionInputRef}/>
                
                <MDBCardText className='mb-0'>Initial Balance</MDBCardText>
                <MDBInput defaultValue={selectedAcc.initialBal} id='regCategory' type='text' inputRef={editInitialBalInputRef}/>
                
                <MDBCardText className='mb-0'>Account Name</MDBCardText>
                <MDBInput defaultValue={selectedAcc.name} id='regCategory' type='text' inputRef={editNameInputRef}/>

                {/* <MDBCardText className='mb-0'>Account Number</MDBCardText>
                <MDBInput defaultValue={selectedUser.category} id='regCategory' type='text' inputRef={editAccountNumberInputRef}/> */}
                
                <MDBCardText className='mb-0'>Normal Side</MDBCardText>
                <MDBInput defaultValue={selectedAcc.normalSide} id='regCategory' type='text' inputRef={editNormalSideInputRef}/>
                
                <MDBCardText className='mb-0'>Order</MDBCardText>
                <MDBInput defaultValue={selectedAcc.order} id='regCategory' type='text' inputRef={editOrderInputRef}/>
                
                <MDBCardText className='mb-0'>Statement</MDBCardText>
                <MDBInput defaultValue={selectedAcc.statement} id='regCategory' type='text' inputRef={editStatementInputRef}/>
                
                <MDBCardText className='mb-0'>Sub Category</MDBCardText>
                <MDBInput defaultValue={selectedAcc.subCategory} id='regCategory' type='text' inputRef={editSubCategoryInputRef}/>
            </div>
        )
    }

    useEffect(() => {
    }, [selectedAcc]);

    function currentlySelected(GridCellParams){
        const currentAccount = GridCellParams.row;
        setSelectedAcc(currentAccount);
    }

    const updateAccount = async(e) => {
        e.preventDefault();
        const category = editCategoryInputRef.current.value;
        const comment = editCommentInputRef.current.value;
        const description = editDescriptionInputRef.current.value;
        const initialBal = editInitialBalInputRef.current.value;
        const accountName = editNameInputRef.current.value;
        const normalSide = editNormalSideInputRef.current.value;
        const order = editOrderInputRef.current.value;
        const statement = editStatementInputRef.current.value;
        const subCategory = editSubCategoryInputRef.current.value;

        console.log(selectedAcc);

        try{
            const accRef = doc(db, "accounts", selectedAcc.id)
            
            await updateDoc(accRef, {
                category: category,
                comment: comment,
                description: description,
                initialBal: initialBal,
                accountName: accountName,
                normalSide: normalSide,
                order: order,
                statement: statement,
                subCategory: subCategory
            });

            setAlert("Edit Account Succesful!");
            setOpenAlert(true);
        }
        catch(error){
            setAlert("Something went wrong");
            setOpenAlert(true);
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
            flex: 1,
            valueFormatter: params => params?.value.toLocaleDateString('en-US'),
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
        },
        {
            field: "Actions", flex: 1,
            renderCell: (cellValues) => {
                return(
                    <div>
                        <MDBBtn onClick={() => { (handleOpenEditAcc()) }} className="d-md-flex gap-2 mt-2 btn-sm" style={{background: 'rgba(41,121,255,1)'}}>
                            Edit
                        </MDBBtn>
                        <MDBBtn onClick={() => { (handleOpenRemoveConfirmation()) }} className="d-md-flex gap-2 mt-2 btn-sm" style={{background: 'rgba(41,121,255,1)'}}>
                            Remove
                        </MDBBtn>
                    </div>
                )
            }
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
                    {loading ? <CircularProgress className='d-md-flex mb-2 m-auto'/> : <MDBBtn onClick={() => {NewAccountForm()}} className="d-md-flex mb-2 m-auto" style={{background: 'rgba(41,121,255,1)'}}>Create Account</MDBBtn>}
                    <MDBBtn onClick={() => {handleCloseNewAccount()}} className="d-md-flex m-auto" style={{background: 'rgba(41,121,255,1)'}}>Close</MDBBtn>
                </Box>
            </Modal>
            <Modal open={openEditAcc} onClose={handleCloseEditAcc} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                <Box sx={style}>
                    {SendAlert()}
                    {getAccRow()}
                    <MDBBtn onClick={updateAccount} className="d-md-flex m-auto mt-4" style={{background: 'rgba(41,121,255,1)'}}>Apply Changes</MDBBtn>
                    <MDBBtn onClick={handleCloseEditAcc} className="d-md-flex m-auto mt-4" style={{background: 'rgba(41,121,255,1)'}}>Close</MDBBtn>
                </Box>
            </Modal>
            <Modal open={openRemoveConfirmation} onClose={handleCloseRemoveConfirmation} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                <Box sx={style}>
                    {SendAlert()}
                    {RemoveConfirmation()}
                    <MDBBtn onClick={DeleteAccount} className="d-md-flex m-auto mt-4" style={{background: 'rgba(41,121,255,1)'}}>Delete</MDBBtn>
                    <MDBBtn onClick={handleCloseRemoveConfirmation} className="d-md-flex m-auto mt-4" style={{background: 'rgba(41,121,255,1)'}}>Close</MDBBtn>
                </Box>
            </Modal>
            <div style={{ height: 1160, marginLeft:"auto", marginRight:"auto", minWidth:900, maxWidth:1800}} id="capture">            
                <DataGrid
                    sx={{ "& .MuiDataGrid-columnHeaders": {
                        backgroundColor: "rgba(41,121,255,1)",
                        color: "rgba(255,255,255,1)",
                        fontSize: 16,
                    }, 
                    '&.MuiDataGrid-root .MuiDataGrid-columnHeader:focus, &.MuiDataGrid-root .MuiDataGrid-cell:focus': {
                        outline: 'none', }
                    }}
                rowHeight={80}
                rows={rows}
                columns={columns}
                pageSize={10}
                onCellClick = {currentlySelected}
                getRowId={(row) => row.id}
                components={{ 
                    Pagination: CustomPagination,
                    Toolbar: GridToolbar, 
                    }}
                hideFooterRowCount={true}
                hideFooterSelectedRowCount={true}
                componentsProps={{
                    toolbar: {
                      showQuickFilter: true,
                      quickFilterProps: { debounceMs: 500 },
                    },
                }}
                />
            </div>
        </div> 
    )
}