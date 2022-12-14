import { app } from "../components/utils/firebase";
import { useState, useEffect, useRef } from "react";
import {
  collection,
  query,
  getDocs,
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  where,
  deleteDoc,
  orderBy
} from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import {
  MDBBtn,
  MDBCard,
  MDBCardBody,
  MDBCardText,
  MDBRow,
  MDBCol,
  MDBTextArea,
} from "mdb-react-ui-kit";
import { Alert, CircularProgress, Link } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import CloseIcon from "@mui/icons-material/Close";
import {
  DataGrid,
  gridPageCountSelector,
  gridPageSelector,
  useGridApiContext,
  useGridSelector,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import Pagination from "@mui/material/Pagination";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { MDBInput } from "mdb-react-ui-kit";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import CurrencyTextField from "../components/CurrencyTextField";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import EmailIcon from '@mui/icons-material/Email';
import Ledger from '../components/Ledger';

export default function AccountsPage() {
  const db = getFirestore(app);

  const [rows, setRows] = useState([]);

  const { currentUser, captureEvent, storeEvent, currentRole, emailMessage, sendEmail, setLedgerRows, setLedgerLoading, StyledTooltip } = useAuth();

  const [emailTo, setEmailTo] = useState("");
  const subjectInputRef = useRef();
  const bodyInputRef = useRef();
  const handleOpenSendEmail = () => setOpenSendEmail(true);
  const [openEmailAlert, setOpenEmailAlert] = useState(false);
  const [openSendEmail, setOpenSendEmail] = useState(false);
  const [emails, setEmails] = useState();
  const handleCloseSendEmail = () => {
    setOpenSendEmail(false);
    setOpenEmailAlert(false);
  };
  const handleEmailChange = (event) => {
    setEmailTo(event.target.value);
  };
  const SendEmailAlert = (e) => {
    return (
      <Collapse in={openEmailAlert}>
        <Alert
          severity="success"
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
    );
  };

  const [openHelp, setOpenHelp] = useState(false);
  const handleOpenHelp = () => setOpenHelp(true);
  const handleCloseHelp = () => setOpenHelp(false);
  const [openNewAccount, setOpenNewAccount] = useState(false);
  const handleOpenNewAccount = () => setOpenNewAccount(true);
  const handleCloseNewAccount = () => {
    setOpenNewAccount(false);
    setOpenAlert(false);
    setChoiceNormal("");
    setChoiceCategory("");
    setValue();
  };

  const [alert, setAlert] = useState("");
  const [openAlert, setOpenAlert] = useState(true);
  const [loading, setLoading] = useState(false);

  // Edit Account
  const [openEditAcc, setEditAcc] = useState(false);
  const [openViewAcc, setViewAcc] = useState(false);
  const [openViewLedger, setViewLedger] = useState(false);
  const handleOpenEditAcc = () => {
    setChoiceCategory(selectedAcc.category);
    setChoiceNormal(selectedAcc.normalSide);
    setValue(selectedAcc.initialBal);
    setEditAcc(true);
  };
  const handleOpenViewAcc = () => setViewAcc(true);
  const handleCloseEditAcc = () => setEditAcc(false);
  const handleCloseViewAcc = () => setViewAcc(false);
  const handleCloseViewLedger = () => setViewLedger(false);
  const [selectedAcc, setSelectedAcc] = useState({});

  // Remove Account
  const [openRemoveConfirmation, setRemoveConfirmation] = useState(false);
  const handleOpenRemoveConfirmation = () => setRemoveConfirmation(true);
  const handleCloseRemoveConfirmation = () => setRemoveConfirmation(false);

  // Input References
  const commentInputRef = useRef();
  const descriptionInputRef = useRef();
  const nameInputRef = useRef();
  const orderInputRef = useRef();
  const statementInputRef = useRef();
  const subCategoryInputRef = useRef();
  const serverStamp = firebase.firestore.Timestamp;

  const editCommentInputRef = useRef();
  const editDescriptionInputRef = useRef();
  const editNameInputRef = useRef();
  const editOrderInputRef = useRef();
  const editStatementInputRef = useRef();
  const editSubCategoryInputRef = useRef();
  const [choiceCategory, setChoiceCategory] = useState("");
  const [choiceNormal, setChoiceNormal] = useState("");
  const [value, setValue] = useState();

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "5px solid rgba(255,255,255,1)",
    boxShadow: 24,
    p: 4,
  };

  const styleEmail = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 600,
    bgcolor: "background.paper",
    border: "5px solid rgba(255,255,255,1)",
    boxShadow: 24,
    p: 4,
  };

  const styleView = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 800,
    bgcolor: "background.paper",
    border: "5px solid rgba(255,255,255,1)",
    boxShadow: 24,
    p: 4,
  };

  const styleViewLedger = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 1400,
    bgcolor: 'background.paper',
    border: '5px solid rgba(255,255,255,1)',
    boxShadow: 24,
    p: 4,
    height: 900,
  };

  const SendEmailOnClick = (e) => {
    e.preventDefault();
    const subject = subjectInputRef.current.value;
    const body = bodyInputRef.current.value;
    sendEmail(emailTo, subject, body, currentUser.displayName);
    //handleCloseSendEmail();
    setOpenEmailAlert(true);
  };

  async function EmailOnClick() {
    // eslint-disable-next-line
    const getEmails = await GetEmails();
    handleOpenSendEmail();
  }

  async function GetEmails() {
    try {
      const usersRef = collection(db, "users");

      var q;
      if (currentRole === "Admin")
        q = query(usersRef, where("role", "!=", "Admin"));
      else if (currentRole === "User")
        q = query(usersRef, where("role", "!=", "User"));
      else
        q = query(usersRef)

      const emailsArray = [];

      const querySnapshot = await getDocs(q);

      var gotFirst = false;

      querySnapshot.forEach(async (doc) => {
        if (gotFirst === false) {
          setEmailTo(doc.data().email);
          gotFirst = true;
        }
        emailsArray.push(
          <MenuItem key={doc.data().username} value={doc.data().email}>
            {doc.data().email + " - " + doc.data().role}
          </MenuItem>
        );
      });

      setEmails(emailsArray);
    } catch (error) { }
  }

  async function GetEntries() {
    try {
      // setLoading(true);
      const entriesRef = collection(db, "entries");

      const q = query(entriesRef, orderBy("timeStamp", "asc"));

      const rowArray = [];


      const querySnapshot = await getDocs(q);

      querySnapshot.forEach(async (doc) => {
        rowArray.push({
          id: doc.id,
          name: doc.data().account,
          dateCreated: doc.data().timeStamp.toDate(),
          debit: doc.data().debit,
          credit: doc.data().credit,
          balance: doc.data().balance,
          status: doc.data().status,
          comment: doc.data()?.comment,
          documentName: doc.data()?.documentName,
          documentUrl: doc.data()?.documentUrl
        });
      });
      //  setArrayToFilter(rowArray);
      return rowArray;
    } catch (error) { }
  }

  async function GetAdjEntries() {
    try {
      const entriesRef = collection(db, "adjusting-entries");

      const q = query(entriesRef, orderBy("timeStamp", "asc"));

      const rowArray = [];

      const querySnapshot = await getDocs(q);


      querySnapshot.forEach(async (doc) => {
        rowArray.push({
          id: doc.id,
          name: doc.data().account,
          dateCreated: doc.data().timeStamp.toDate(),
          debit: doc.data().debit,
          credit: doc.data().credit,
          balance: doc.data().balance,
          status: doc.data().status,
          comment: doc.data()?.comment,
          documentName: doc.data()?.documentName,
          documentUrl: doc.data()?.documentUrl,
          category: doc.data().category
        });
      });

      return rowArray;
    } catch (error) { }
  }

  async function filterEntries(name, balance, entriesToFilter, entriesToFilterAdj) {
    let temp = [];
    let currentBalance = balance;
    // eslint-disable-next-line
    await entriesToFilter.map(entry => {
      // eslint-disable-next-line
      entry['name'].map((data, index) => {
        if (data['name'].name === name) {
          // currentBalance += parseFloat(entry['debit'][index]['amount']);
          // currentBalance -= parseFloat(entry['credit'][index]['amount']);
          temp.push({
            id: entry['id'],
            date: entry['dateCreated'],
            debit: parseFloat(entry['debit'][index]['amount']),
            credit: parseFloat(entry['credit'][index]['amount']),
            balance: parseFloat(entry['balance'][index]['amount']),
            description: entry['comment']
          })

        }

      })
    })
    await entriesToFilterAdj.map(entry => {
      // eslint-disable-next-line
      entry['name'].map((data, index) => {
        if (data['name'].name === name) {
          // currentBalance += parseFloat(entry['debit'][index]['amount']);
          // currentBalance -= parseFloat(entry['credit'][index]['amount']);
          temp.push({
            id: entry['id'],
            date: entry['dateCreated'],
            debit: parseFloat(entry['debit'][index]['amount']),
            credit: parseFloat(entry['credit'][index]['amount']),
            balance: parseFloat(entry['balance'][index]['amount']),
            description: entry['category']
          })

        }

      })
    })
    setLedgerRows(temp)
    setLedgerLoading(false);
  }

  async function getLedgerRows(accName, balance) {
    setLedgerRows([]);
    setLedgerLoading(true);
    var entriesToFilter = [];
    var entriesToFilterAdj = [];
    await GetEntries().then((data) => {
      console.log(data)
      data.forEach((entry) => {
        if (entry['status'] === 'Approved') {
          entry['name'].forEach((name) => {
            console.log(name['name'].name);
            console.log(accName);
            if (name['name'].name === accName) {
              entriesToFilter.push(entry);
            }
            console.log(entriesToFilter);
          })
        }
      },
      )
    })
    await GetAdjEntries().then((data) => {
      data.forEach((entry) => {
        if (entry['status'] === 'Approved') {
          entry['name'].forEach((name) => {
            if (name['name'].name === accName) {
              entriesToFilterAdj.push(entry);
            }
          })
        }
      },
      )
    })
    await filterEntries(accName, balance, entriesToFilter, entriesToFilterAdj)
  }

  function CustomToolBar() {
    return (
      <GridToolbarContainer>
        <Button
          color="primary"
          onClick={() => {
            GetRequests();
          }}
          startIcon={<RefreshIcon />}
        >
          Refresh
        </Button>
        {currentRole === "Admin" ? (
          <Button
            color="primary"
            onClick={() => {
              handleOpenNewAccount();
            }}
            startIcon={<AddIcon />}
          >
            Create New Account
          </Button>
        ) : null}
        <Button onClick={() => {
          EmailOnClick();
        }} color="primary" startIcon={<EmailIcon />}>Email</Button>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarExport />
        <GridToolbarQuickFilter className="ms-auto" />
      </GridToolbarContainer>
    );
  }
  const DeleteAccount = async (e) => {
    try {
      setLoading(true);

      const accRef = doc(db, "accounts", selectedAcc.id);

      await deleteDoc(accRef);

      const id = await storeEvent(currentUser.displayName);
      // eslint-disable-next-line no-unused-vars
      const beforeCapture = await captureEvent(id, "before");
      // eslint-disable-next-line no-unused-vars
      const refresh = await GetRequests().then(
        setTimeout(() => {
          captureEvent(id, "after");
        }, 1000)
      );
      setLoading(false);
      setAlert("Account removed successfully!");
      setOpenAlert(true);
    } catch (error) {
      setAlert(`Account removed successfully!\n${error.message}`);
      setOpenAlert(true);
    }
  };

  const NewAccountForm = async (e) => {
    // e.preventDefault();
    const category = choiceCategory;
    const comment = commentInputRef.current.value;
    const description = descriptionInputRef.current.value;
    const initialBal = value;
    const accountName = nameInputRef.current.value;
    const normalSide = choiceNormal;
    const order = orderInputRef.current.value;
    const statement = statementInputRef.current.value;
    const subCategory = subCategoryInputRef.current.value;
    var accountNumber;
    var duplicate = false;

    rows.forEach((element) => {
      if (accountName === element.name) {
        duplicate = true;
      }
    });

    try {
      if (duplicate === false) {
        setLoading(true);
        const accountsRef = collection(db, "accounts");

        var lowerRange;
        if (category === "Assets") {
          lowerRange = 100;
        } else if (category === "Liabilities") {
          lowerRange = 200;
        } else if (category === "Equity") {
          lowerRange = 300;
        } else if (category === "Revenue") {
          lowerRange = 400;
        } else if (category === "Expenses") {
          lowerRange = 500;
        }
        const upperRange = lowerRange + 100;

        const q = query(
          accountsRef,
          where("accountNumber", ">=", lowerRange),
          where("accountNumber", "<", upperRange)
        );

        const querySnapshot = await getDocs(q);

        const length = querySnapshot.docs.length;

        if (length === 0) {
          accountNumber = lowerRange;
        } else {
          const newAccountNumber =
            parseInt(querySnapshot.docs[length - 1].data().accountNumber) + 1;
          accountNumber = newAccountNumber;
        }

        const userID = currentUser.displayName;

        const docRef = doc(db, "accounts", accountNumber.toString());

        setDoc(docRef, {
          category: category,
          comment: comment,
          dateAdded: serverStamp.now(),
          description: description,
          initialBal: initialBal,
          balance: initialBal,
          name: accountName,
          normalSide: normalSide,
          order: order,
          statement: statement,
          subCategory: subCategory,
          userID: userID,
          accountNumber: accountNumber,
        });

        // const id = await storeEvent(currentUser.displayName);
        // // eslint-disable-next-line no-unused-vars
        // const beforeCapture = await captureEvent(id, "before");
        // // eslint-disable-next-line no-unused-vars
        // const refresh = await GetRequests().then(
        //   setTimeout(() => {
        //     captureEvent(id, "after");
        //   }, 1000)
        // );
        // eslint-disable-next-line
        const refresh = await GetRequests();
        setLoading(false);
        setAlert("Account succesfully created!");
        setOpenAlert(true);
      } else {
        setAlert("Account name already exists!");
        setOpenAlert(true);
      }
    } catch (error) {
      setAlert(error.message);
      setOpenAlert(true);
      setLoading(false);
    }
  };

  async function GetRequests() {
    try {
      const accountsRef = collection(db, "accounts");

      const q = query(accountsRef);

      // eslint-disable-next-line no-unused-vars
      const querySnapshotExpiration = await getDocs(q);

      const rowsArray = [];


      const querySnapshot = await getDocs(q);

      querySnapshot.forEach(async (doc) => {
        rowsArray.push({
          id: doc.id,
          category: doc.data().category,
          comment: doc.data().comment,
          dateAdded: doc.data().dateAdded.toDate(),
          description: doc.data().description,
          initialBal: doc.data().initialBal,
          balance: doc.data().balance,
          name: doc.data().name,
          normalSide: doc.data().normalSide,
          order: doc.data().order,
          statement: doc.data().statement,
          subCategory: doc.data().subCategory,
          userID: doc.data().userID,
          accountNumber: doc.data().accountNumber,
        });
      });



      setRows(rowsArray);
    } catch (error) { }
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

  const SendAlert = (e) => {
    if (alert !== "") {
      var alertSeverity = "warning";

      if (alert === "Account successfully created!") {
        alertSeverity = "success";
      } else if (alert === "Account successfully edited!") {
        alertSeverity = "success";
      } else if (alert === "Account removed successfully!") {
        alertSeverity = "success";
      }
      else if (alert === "Account successfully updated!") {
        alertSeverity = "success"
      }

      return (
        <Collapse in={openAlert}>
          <Alert
            severity={alertSeverity}
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
      );
    }
  };

  const RemoveConfirmation = () => {
    return (
      <div>
        <label>Do you want to delete the account {selectedAcc.name}?</label>
      </div>
    );
  };

  const getAccRow = () => {
    return (
      <div>
        <MDBInput
          className="mb-4"
          defaultValue={selectedAcc.name}
          id="regCategory"
          label="Account Name"
          type="text"
          inputRef={editNameInputRef}
        />
        <FormControl fullWidth className="mb-4" size="small">
          <InputLabel id="category-select-label">Category</InputLabel>
          <Select
            labelId="category-select-label"
            id="category-select"
            value={choiceCategory}
            label="Category"
            onChange={(event) => {
              setChoiceCategory(event.target.value);
            }}
          >
            <MenuItem value={"Assets"}>Assets</MenuItem>
            <MenuItem value={"Liabilities"}>Liabilities</MenuItem>
            <MenuItem value={"Equity"}>Equity</MenuItem>
            <MenuItem value={"Revenue"}>Revenue</MenuItem>
            <MenuItem value={"Expenses"}>Expenses</MenuItem>
          </Select>
        </FormControl>
        <MDBInput
          className="mb-4"
          defaultValue={selectedAcc.subCategory}
          id="regCategory"
          label="Sub Category"
          type="text"
          inputRef={editSubCategoryInputRef}
        />
        <FormControl fullWidth className="mb-4" size="small">
          <InputLabel id="normal-select-label">Normal Side</InputLabel>
          <Select
            labelId="normal-select-label"
            id="normal-select"
            value={choiceNormal}
            label="Normal Side"
            onChange={(event) => {
              setChoiceNormal(event.target.value);
            }}
          >
            <MenuItem value={"Debit"}>Debit</MenuItem>
            <MenuItem value={"Credit"}>Credit</MenuItem>
          </Select>
        </FormControl>
        <CurrencyTextField
          label="Initial Balance"
          placeholder="0.00"
          variant="outlined"
          value={value}
          currencySymbol="$"
          fixedDecimalLength="2"
          outputFormat="number"
          decimalCharacter="."
          digitGroupSeparator=","
          onChange={(event, value) => setValue(value)}
          className="mb-4"
          size="small"
          fullWidth
        />
        <MDBInput
          className="mb-4"
          defaultValue={selectedAcc.order}
          id="regCategory"
          label="Order"
          type="text"
          inputRef={editOrderInputRef}
        />
        <MDBInput
          className="mb-4"
          defaultValue={selectedAcc.statement}
          id="regCategory"
          label="Statement"
          type="text"
          inputRef={editStatementInputRef}
        />
        <MDBInput
          className="mb-4"
          defaultValue={selectedAcc.description}
          id="regCategory"
          label="Description"
          type="text"
          inputRef={editDescriptionInputRef}
        />
        <MDBInput
          className="mb-4"
          defaultValue={selectedAcc.comment}
          id="regCategory"
          label="Comment"
          type="text"
          inputRef={editCommentInputRef}
        />
      </div>
    );
  };

  const getViewAccRow = () => {
    return (
      <div>
        <MDBCard className="mb-4">
          <MDBCardBody>
            <MDBRow>
              <MDBCol sm="4">
                <MDBCardText className="ms-4">Account Name:</MDBCardText>
              </MDBCol>
              <MDBCol sm="8">
                <MDBCardText className="text-end me-4 text-muted">
                  {selectedAcc.name}
                </MDBCardText>
              </MDBCol>
            </MDBRow>
            <hr />
            <MDBRow>
              <MDBCol sm="4">
                <MDBCardText className="ms-4">Category:</MDBCardText>
              </MDBCol>
              <MDBCol sm="8">
                <MDBCardText className="text-end me-4 text-muted">
                  {selectedAcc.category}
                </MDBCardText>
              </MDBCol>
            </MDBRow>
            <hr />
            <MDBRow>
              <MDBCol sm="4">
                <MDBCardText className="ms-4">Sub-Category:</MDBCardText>
              </MDBCol>
              <MDBCol sm="8">
                <MDBCardText className="text-end me-4 text-muted">
                  {selectedAcc.subCategory}
                </MDBCardText>
              </MDBCol>
            </MDBRow>
            <hr />
            <MDBRow>
              <MDBCol sm="4">
                <MDBCardText className="ms-4">Normal Side:</MDBCardText>
              </MDBCol>
              <MDBCol sm="8">
                <MDBCardText className="text-end me-4 text-muted">
                  {selectedAcc.normalSide}
                </MDBCardText>
              </MDBCol>
            </MDBRow>
            <hr />
            <MDBRow>
              <MDBCol sm="4">
                <MDBCardText className="ms-4">Initial Balance:</MDBCardText>
              </MDBCol>
              <MDBCol sm="8">
                <MDBCardText className="text-end me-4 text-muted">
                  {selectedAcc.initialBal?.toLocaleString("en-us", {
                    style: "currency",
                    currency: "USD",
                  })}
                </MDBCardText>
              </MDBCol>
            </MDBRow>
            <hr />
            <MDBRow>
              <MDBCol sm="4">
                <MDBCardText className="ms-4">Current Balance:</MDBCardText>
              </MDBCol>
              <MDBCol sm="8">
                <MDBCardText className="text-end me-4 text-muted">
                  {selectedAcc.balance?.toLocaleString("en-us", {
                    style: "currency",
                    currency: "USD",
                  })}
                </MDBCardText>
              </MDBCol>
            </MDBRow>
            <hr />
            <MDBRow>
              <MDBCol sm="4">
                <MDBCardText className="ms-4">Order:</MDBCardText>
              </MDBCol>
              <MDBCol sm="8">
                <MDBCardText className="text-end me-4 text-muted">
                  {selectedAcc.order}
                </MDBCardText>
              </MDBCol>
            </MDBRow>
            <hr />
            <MDBRow>
              <MDBCol sm="4">
                <MDBCardText className="ms-4">Statement:</MDBCardText>
              </MDBCol>
              <MDBCol sm="8">
                <MDBCardText className="text-end me-4 text-muted">
                  {selectedAcc.statement}
                </MDBCardText>
              </MDBCol>
            </MDBRow>
            <hr />
            <MDBRow>
              <MDBCol sm="4">
                <MDBCardText className="ms-4">Description:</MDBCardText>
              </MDBCol>
              <MDBCol sm="8">
                <MDBCardText className="text-end me-4 text-muted">
                  {selectedAcc.description}
                </MDBCardText>
              </MDBCol>
            </MDBRow>
            <hr />
            <MDBRow>
              <MDBCol sm="4">
                <MDBCardText className="ms-4">Comment:</MDBCardText>
              </MDBCol>
              <MDBCol sm="8">
                <MDBCardText className="text-end me-4 text-muted">
                  {selectedAcc.comment}
                </MDBCardText>
              </MDBCol>
            </MDBRow>
            <hr />
            <MDBRow>
              <MDBCol sm="4">
                <MDBCardText className="ms-4">Date Added:</MDBCardText>
              </MDBCol>
              <MDBCol sm="8">
                <MDBCardText className="text-end me-4 text-muted">
                  {selectedAcc.dateAdded?.toLocaleDateString()}
                </MDBCardText>
              </MDBCol>
            </MDBRow>
          </MDBCardBody>
        </MDBCard>
      </div>
    );
  };

  useEffect(() => { }, [selectedAcc]);

  function currentlySelected(GridCellParams) {
    const currentAccount = GridCellParams.row;
    setSelectedAcc(currentAccount);
  }

  const updateAccount = async (e) => {
    e.preventDefault();
    const category = choiceCategory;
    const comment = editCommentInputRef.current.value;
    const description = editDescriptionInputRef.current.value;
    const initialBal = value;
    const accountName = editNameInputRef.current.value;
    const normalSide = choiceNormal;
    const order = editOrderInputRef.current.value;
    const statement = editStatementInputRef.current.value;
    const subCategory = editSubCategoryInputRef.current.value;
    var duplicate = false;

    rows.forEach((element) => {
      if (accountName === element.name) {
        duplicate = true;
      }
    });
    if (accountName === selectedAcc.name) {
      duplicate = false;
    }

    try {
      if (duplicate === false) {
        setLoading(true);
        const accRef = doc(db, "accounts", selectedAcc.id);

        await updateDoc(accRef, {
          category: category,
          comment: comment,
          description: description,
          initialBal: initialBal,
          name: accountName,
          normalSide: normalSide,
          order: order,
          statement: statement,
          subCategory: subCategory,
        });

        const id = await storeEvent(currentUser.displayName);
        // eslint-disable-next-line no-unused-vars
        const beforeCapture = await captureEvent(id, "before");
        // eslint-disable-next-line no-unused-vars
        const refresh = await GetRequests().then(
          setTimeout(() => {
            captureEvent(id, "after");
          }, 1000)
        );
        setLoading(false);
        setAlert("Account successfully updated!");
        setOpenAlert(true);
      } else {
        setAlert("Account name already exists!");
        setOpenAlert(true);
      }
    } catch (error) {
      setAlert(error.message);
      setOpenAlert(true);
    }
  };

  const columns = [
    {
      field: "accountNumber",
      headerName: "Account Number",
      flex: 1,
      renderCell: (params) => {
        return <StyledTooltip
          title="View ledger"
          placement='right'
          arrow
        >
          <Link component="button" underline="none"
            onClick={async () => {
              await getLedgerRows(params.row.name, params.row.balance).then(setViewLedger(true));
            }}
          >{params.row.accountNumber}</Link>
        </StyledTooltip>
      }
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      renderCell: (params) => {
        return <StyledTooltip
          title="View ledger"
          placement='left'
          arrow
        >
          <Link component="button" underline="none"
            onClick={async () => {
              await getLedgerRows(params.row.name, params.row.balance).then(setViewLedger(true));
            }}
          >{params.row.name}</Link>
        </StyledTooltip>
      }
    },
    {
      field: "category",
      headerName: "Category",
      flex: 1,
    },
    {
      field: "subCategory",
      headerName: "Sub-Category",
      flex: 1,
    },
    {
      field: "balance",
      headerName: "Balance",
      flex: 1,
      valueFormatter: (params) =>
        params?.value.toLocaleString("en-us", {
          style: "currency",
          currency: "USD",
        }),
    },
    {
      field: "dateAdded",
      headerName: "Date Added",
      type: "date",
      flex: 1,
      renderCell: (params) => params?.value.toLocaleDateString("en-US"),
    },
    {
      field: "Actions",
      flex: 1,
      renderCell: (cellValues) => {
        return currentRole === "Admin" ? (
          <div className="d-flex gap-2">
            <StyledTooltip
              title="View this account"
              placement='top'
              arrow
            >
              <MDBBtn
                onClick={async () => {
                  handleOpenViewAcc();
                  await getLedgerRows(cellValues.row.name, cellValues.row.initialBal);
                }}
                className="d-md-flex gap-2 mt-2 btn-sm"
                style={{ background: "rgba(41,121,255,1)" }}
              >
                View
              </MDBBtn>
            </StyledTooltip>
            <StyledTooltip
              title="Edit this account"
              placement='top'
              arrow
            >
              <MDBBtn
                onClick={() => {
                  handleOpenEditAcc();
                }}
                className="d-md-flex gap-2 mt-2 btn-sm"
                style={{ background: "rgba(41,121,255,1)" }}
              >
                Edit
              </MDBBtn>
            </StyledTooltip>

            {cellValues.row.balance === 0 ? (
              <StyledTooltip
                title="Remove this account"
                placement='top'
                arrow
              >
                <MDBBtn
                  onClick={() => {
                    handleOpenRemoveConfirmation();
                  }}
                  className="d-md-flex gap-2 mt-2 btn-sm"
                  style={{ background: "rgba(255,0,0,1)" }}
                >
                  Remove
                </MDBBtn>
              </StyledTooltip>
            ) : null}
          </div>
        ) : (
          <div>
            <StyledTooltip
              title="View this account"
              placement='right'
              arrow
            >
              <MDBBtn
                onClick={async () => {
                  handleOpenViewAcc();
                  await getLedgerRows(cellValues.row.name, cellValues.row.initialBal);
                }}
                className="d-md-flex gap-2 mt-2 btn-sm"
                style={{ background: "rgba(41,121,255,1)" }}
              >
                View
              </MDBBtn>
            </StyledTooltip>
          </div>
        );
      },
    },
  ];
  useEffect(() => {
    let ignore = false;

    if (!ignore) GetRequests();
    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div
      style={{
        height: "89vh",
        marginLeft: "auto",
        marginRight: "auto",
        minWidth: 900,
        maxWidth: 1900,
        paddingLeft: 25,
        paddingRight: 25,
        paddingTop: 10
      }}
    >
      <Modal
        open={openSendEmail}
        onClose={handleCloseSendEmail}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={styleEmail}>
          {SendEmailAlert()}
          <label>To:</label>
          <Select className="ms-2 mb-2" size="small" autoWidth value={emailTo} onChange={handleEmailChange}>
            {emails}
          </Select>
          <MDBCol>
            <label>From: {currentUser.email}</label>
          </MDBCol>
          <MDBInput
            wrapperClass="mb-4 mt-2"
            label="Subject"
            id="subject"
            type="text"
            inputRef={subjectInputRef}
          />
          <MDBTextArea
            label="Body"
            id="body"
            type="text"
            rows={10}
            inputRef={bodyInputRef}
          ></MDBTextArea>
          <StyledTooltip
            title="Finish sending email"
            placement='top'
            arrow
          >
            <MDBBtn
              onClick={SendEmailOnClick}
              className="d-md-flex m-auto mt-4"
              style={{ background: "rgba(41,121,255,1)" }}
            >
              Send Email
            </MDBBtn>
          </StyledTooltip>
          <StyledTooltip
            title="Cancel sending email"
            placement='bottom'
            arrow
          >
            <MDBBtn
              onClick={() => {
                handleCloseSendEmail();
              }}
              className="d-md-flex m-auto mt-4"
              style={{ background: "rgba(41,121,255,1)" }}
            >
              Close
            </MDBBtn>
          </StyledTooltip>
        </Box>
      </Modal>
      <Modal
        open={openNewAccount}
        onClose={handleCloseNewAccount}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          {SendAlert()}
          <MDBInput
            wrapperClass="mb-4"
            label="Account Name"
            id="regAccountName"
            type="text"
            inputRef={nameInputRef}
          />
          <FormControl fullWidth className="mb-4" size="small">
            <InputLabel id="category-select-label">Category</InputLabel>
            <Select
              labelId="category-select-label"
              id="category-select"
              value={choiceCategory}
              label="Category"
              onChange={(event) => {
                setChoiceCategory(event.target.value);
              }}
            >
              <MenuItem value={"Assets"}>Assets</MenuItem>
              <MenuItem value={"Liabilities"}>Liabilities</MenuItem>
              <MenuItem value={"Equity"}>Equity</MenuItem>
              <MenuItem value={"Revenue"}>Revenue</MenuItem>
              <MenuItem value={"Expenses"}>Expenses</MenuItem>
            </Select>
          </FormControl>
          <MDBInput
            wrapperClass="mb-4"
            label="Sub-Category"
            id="regSubCategory"
            type="text"
            inputRef={subCategoryInputRef}
          />
          <MDBInput
            wrapperClass="mb-4"
            label="Description"
            id="regDescription"
            type="text"
            inputRef={descriptionInputRef}
          />
          <MDBInput
            wrapperClass="mb-4"
            label="Comment"
            id="regComment"
            type="text"
            inputRef={commentInputRef}
          />
          <CurrencyTextField
            label="Initial Balance"
            placeholder="0.00"
            variant="outlined"
            value={value}
            currencySymbol="$"
            fixedDecimalLength="2"
            outputFormat="number"
            decimalCharacter="."
            digitGroupSeparator=","
            onChange={(event, value) => setValue(value)}
            className="mb-4"
            size="small"
            fullWidth
          />
          <FormControl fullWidth className="mb-4" size="small">
            <InputLabel id="normal-select-label">Normal Side</InputLabel>
            <Select
              labelId="normal-select-label"
              id="normal-select"
              value={choiceNormal}
              label="Normal Side"
              onChange={(event) => {
                setChoiceNormal(event.target.value);
              }}
            >
              <MenuItem value={"Debit"}>Debit</MenuItem>
              <MenuItem value={"Credit"}>Credit</MenuItem>
            </Select>
          </FormControl>
          <MDBInput
            wrapperClass="mb-4"
            label="Order"
            id="regOrder"
            type="number"
            inputRef={orderInputRef}
          />
          <MDBInput
            wrapperClass="mb-4"
            label="Statement"
            id="regStatement"
            type="text"
            inputRef={statementInputRef}
          />
          {loading ? (
            <CircularProgress className="d-md-flex mb-2 m-auto" />
          ) : (
            <StyledTooltip
              title="Create new account"
              placement='top'
              arrow
            >
              <MDBBtn
                onClick={() => {
                  NewAccountForm();
                }}
                className="d-md-flex mb-2 m-auto"
                style={{ background: "rgba(41,121,255,1)" }}
              >
                Create Account
              </MDBBtn>
            </StyledTooltip>
          )}
          <StyledTooltip
            title="Cancel creating account"
            placement='bottom'
            arrow
          >
            <MDBBtn
              onClick={() => {
                handleCloseNewAccount();
              }}
              className="d-md-flex m-auto"
              style={{ background: "rgba(41,121,255,1)" }}
            >
              Close
            </MDBBtn>
          </StyledTooltip>
        </Box>
      </Modal>
      <Modal
        open={openViewAcc}
        onClose={handleCloseViewAcc}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={styleView}>
          {getViewAccRow()}
          <StyledTooltip
            title="View ledger for selected account"
            placement='top'
            arrow
          >
            <MDBBtn onClick={() => { setViewLedger(true); handleCloseViewAcc(); }} className="d-md-flex m-auto mt-4" style={{ background: 'rgba(41,121,255,1)' }}>View Ledger</MDBBtn>
          </StyledTooltip>
          <StyledTooltip
            title="Close account view"
            placement='bottom'
            arrow
          >
            <MDBBtn
              onClick={handleCloseViewAcc}
              className="d-md-flex m-auto mt-4"
              style={{ background: "rgba(41,121,255,1)" }}
            >
              Close
            </MDBBtn>
          </StyledTooltip>
        </Box>
      </Modal>
      <Modal open={openViewLedger} onClose={handleCloseViewLedger} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
        <Box sx={styleViewLedger}>
          <Ledger />
          <StyledTooltip
            title="Close ledger view"
            placement='bottom'
            arrow
          >
            <MDBBtn onClick={handleCloseViewLedger} className="d-md-flex m-auto mt-4" style={{ background: 'rgba(41,121,255,1)' }}>Close</MDBBtn>
          </StyledTooltip>
        </Box>
      </Modal>
      <Modal
        open={openEditAcc}
        onClose={handleCloseEditAcc}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          {SendAlert()}
          {getAccRow()}
          {loading ? (
            <CircularProgress className="d-md-flex mb-2 m-auto" />
          ) : (
            <MDBBtn
              onClick={updateAccount}
              className="d-md-flex m-auto mt-4"
              style={{ background: "rgba(41,121,255,1)" }}
            >
              Apply Changes
            </MDBBtn>
          )}
          <MDBBtn
            onClick={handleCloseEditAcc}
            className="d-md-flex m-auto mt-4"
            style={{ background: "rgba(41,121,255,1)" }}
          >
            Close
          </MDBBtn>
        </Box>
      </Modal>
      <Modal
        open={openRemoveConfirmation}
        onClose={handleCloseRemoveConfirmation}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          {SendAlert()}
          {RemoveConfirmation()}
          {loading ? (
            <CircularProgress className="d-md-flex mb-2 m-auto" />
          ) : (
            <MDBBtn
              onClick={DeleteAccount}
              className="d-md-flex m-auto mt-4"
              style={{ background: "rgba(255,0,0,1)" }}
            >
              Delete
            </MDBBtn>
          )}
          <MDBBtn
            onClick={handleCloseRemoveConfirmation}
            className="d-md-flex m-auto mt-4"
            style={{ background: "rgba(41,121,255,1)" }}
          >
            Close
          </MDBBtn>
        </Box>
      </Modal>
      <div style={{ display: "flex", height: "100%" }}>
        <div id="capture" style={{ flexGrow: 1, marginLeft: 60 }}>
          <DataGrid
            sx={{
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "rgba(41,121,255,1)",
                color: "rgba(255,255,255,1)",
                fontSize: 16,
              },
              "&.MuiDataGrid-root .MuiDataGrid-columnHeader:focus, &.MuiDataGrid-root .MuiDataGrid-cell:focus":
              {
                outline: "none",
              },
            }}
            rowHeight={100}
            rows={rows}
            columns={columns}
            autoPageSize
            // autoPageSize
            rowsPerPage={10}
            disableDensitySelector
            onCellClick={currentlySelected}
            getRowId={(row) => row.id}
            components={{
              Pagination: CustomPagination,
              Toolbar: CustomToolBar,
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
    </div>
  );
}
