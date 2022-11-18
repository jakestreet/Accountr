import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { storage } from '../components/utils/firebase'
import { MDBBtn, MDBCardText, MDBCol, MDBInput, MDBRow, MDBTextArea } from "mdb-react-ui-kit";
import Modal from "@mui/material/Modal";
import * as React from "react";
import PropTypes from "prop-types";
import Button from "@mui/material/Button";
import { Add, Save, Cancel, Check, Block, Remove, Download, Refresh } from "@mui/icons-material"
import {
  GridRowModes,
  DataGrid,
  GridToolbarContainer,
  GridActionsCellItem,
  GridToolbarQuickFilter,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { randomId } from "@mui/x-data-grid-generator";
import Chip from "@mui/material/Chip";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CurrencyTextField from "../components/CurrencyTextField";
import {
  collection,
  query,
  getDocs,
  getFirestore,
  addDoc,
  doc,
  updateDoc,
  orderBy,
  where,
} from "firebase/firestore";
import { getDownloadURL } from "firebase/storage";
import { app } from "../components/utils/firebase";
import { Box, IconButton, Typography } from "@mui/material";
import { styled } from '@mui/material/styles';
import { Divider } from '@mui/material';

export default function AdjustingJournal() {
  const { currentRole, filterProvidedAdjEntry, uploadEntryDoc, setPendingEntries, width, setWidth, StyledTooltip } = useAuth();
  const [openHelp, setOpenHelp] = useState(false);
  const handleOpenHelp = () => setOpenHelp(true);
  const handleCloseHelp = () => setOpenHelp(false);
  const [rows, setRows] = useState([]);
  const [rowModesModel, setRowModesModel] = useState({});
  const [accounts, setAccounts] = useState();
  const [loading, setLoading] = useState(false);
  const [numberOfRows, setNumberOfRows] = useState(1);
  const [choiceAccounts, setChoiceAccounts] = useState([{ name: "" }, { name: "" }]);
  const [debitField, setDebitField] = useState([{ amount: 0 }, { amount: 0 }]);
  const [creditField, setCreditField] = useState([{ amount: 0 }, { amount: 0 }]);
  const [viewData, setViewData] = useState();
  const [comment, setComment] = useState("");
  const [open, setOpen] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openReject, setOpenReject] = useState(false);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [docFile, setDocFile] = useState(null);
  const [category, setCategory] = useState();
  const [justifyActive, setJustifyActive] = useState('tab1');
  const ref = useRef();
  const handleJustifyClick = (value) => {
    if (value === justifyActive) {
      return;
    }

    setJustifyActive(value);
  };
  const handleCategory = (event) => {
    setCategory(event.target.value);
  }
  async function handleUpload(id) {
    // eslint-disable-next-line
    const upload = await uploadEntryDoc(docFile, id, docFile.name, setLoadingUpload)
    // eslint-disable-next-line
    const update = await updateJournalDocName(id, docFile.name).then(await GetEntries().then(setLoading(false)));
  }
  function handleUploadChange(e) {
    if (e.target.files[0]) {
      setDocFile(e.target.files[0])
    }
  }

  const [balanceError, setBalanceError] = useState(false)

  const handleOpenView = (rowData) => {
    setViewData(rowData)
    setOpenView(true);
  }
  const handleOpenReject = (rowData) => {
    setViewData(rowData)
    setOpenReject(true);
  }
  const handleClose = async () => {
    console.log("ran close")
    await GetEntries().then(setLoading(false))
    setOpen(false)
  }
  const handleCloseView = () => setOpenView(false);
  const handleCloseReject = () => {
    setOpenReject(false);
    console.log("closed")
    setComment("");
  }

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
  };
  const db = getFirestore(app);

  const Item = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1),
    textAlign: 'center',
  }));

  const handleAccountChange = (event, index) => {
    let data = [...choiceAccounts];
    data[index][event.target.name] = event.target.value;
    setChoiceAccounts(data);
  }

  const handleDebitChange = (event, index) => {
    let data = [...debitField];
    if (event.target.value !== "") {
      data[index][event.target.name] = parseFloat(event.target.value.replaceAll(',', ''));
    }
    else
      data[index][event.target.name] = 0
  }

  const handleCreditChange = (event, index) => {
    let data = [...creditField];
    if (event.target.value !== "") {
      data[index][event.target.name] = parseFloat(event.target.value.replaceAll(',', ''));
    }
    else
      data[index][event.target.name] = 0
  }

  const addFields = () => {
    let accountObject = {
      name: '',
    }
    let debitObject = {
      amount: 0,
    }
    let creditObject = {
      amount: 0,
    }
    setChoiceAccounts([...choiceAccounts, accountObject])
    setDebitField([...debitField, debitObject])
    setCreditField([...creditField, creditObject])
  }

  const removeFields = () => {
    let dataAccount = [...choiceAccounts];
    dataAccount.splice(choiceAccounts.length - 1, 1)
    let dataDebit = [...debitField];
    dataDebit.splice(debitField.length - 1, 1)
    let dataCredit = [...creditField];
    dataCredit.splice(creditField.length - 1, 1)
    setChoiceAccounts(dataAccount)
    setDebitField(dataDebit)
    setCreditField(dataCredit)
  }

  function RenderAddRows(number, props) {
    return [...Array(number)].map(() => (props));
  }

  function EditToolbar(props) {
    const { setRows, setRowModesModel } = props;

    const handleClick = () => {
      const id = randomId();
      setRows((oldRows) => [
        ...oldRows,
        {
          id,
          name: [{ name: "" }],
          dateCreated: new Date(),
          debit: [{ amount: 0 }],
          credit: [{ amount: 0 }],
          status: "Pending",
          isNew: true,
        },
      ]);
      setRowModesModel((oldModel) => ({
        ...oldModel,
        [id]: { mode: GridRowModes.Edit },
      }));
    };

    return (
      <GridToolbarContainer>
          <Button color="primary" startIcon={<Refresh />} onClick={() => {
            setLoading(true);
            GetAccounts();
            GetEntries().then(setLoading(false));
          }}>
            Refresh
          </Button>
          <Button color="primary" startIcon={<Add />} onClick={handleClick}>
            Add Journal Entry
          </Button>
        <GridToolbarFilterButton />
        <GridToolbarQuickFilter className="ms-auto" />
      </GridToolbarContainer>
    );
  }

  EditToolbar.propTypes = {
    setRowModesModel: PropTypes.func.isRequired,
    setRows: PropTypes.func.isRequired,
  };

  const handleRowEditStart = (params, event) => {
    event.defaultMuiPrevented = true;
  };

  const handleRowEditStop = (params, event) => {
    event.defaultMuiPrevented = true;
  };

  //HERE IS SAVE CLICK
  const handleSaveClick = (id, debit, credit) => () => {
    setBalanceError(false);
    var debitTotal = 0;
    var creditTotal = 0;
    debitField.forEach(element => debitTotal += parseFloat(element.amount.toString().replaceAll(',', '')))
    creditField.forEach(element => creditTotal += parseFloat(element.amount.toString().replaceAll(',', '')))
    if (debitTotal === creditTotal) {
      setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
    }
    else {
      alert("The debit and credit totals must be equal.")
      storeEntryError(id, "The debit and credit totals must be equal.", debitTotal, creditTotal);
      setBalanceError(true);
    }

  };


  const handleApproveClick = (id, status, comment, rowData) => async () => {
    var balances = [];
    for (let index = 0; index < rowData.name.length; index++) {
      var initialBal;
      var balanceAtApproval;
      const accountsRef = collection(db, "accounts");
      const q = query(accountsRef, where("name", "==", rowData.name[index].name.name));
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach(async (doc) => {
        initialBal = doc.data().balance;
        const category = rowData.name[index].name.category
        if(category === "Assets" || category === "Expenses") {
          balanceAtApproval = initialBal + rowData.debit[index].amount;
          balanceAtApproval -= rowData.credit[index].amount;
        }
        else if(category === "Equity" || category === "Liabilities" || category === "Revenue") {
          balanceAtApproval = initialBal + rowData.credit[index].amount;
          balanceAtApproval -= rowData.debit[index].amount;
        }

        updateDoc(doc.ref, {
          "balance": balanceAtApproval
        })
      });
      balances.push({ "amount": balanceAtApproval })
    }
    // eslint-disable-next-line no-unused-vars
    const update = await updateStatus(id, status, comment, balances).then(
      GetEntries().then(setLoading(false))
    );
    setOpenReject(false);
    setComment("");
  };

  const handleCancelClick = (id) => () => {
    setNumberOfRows(1);
    setChoiceAccounts([{ name: "" }, { name: "" }]);
    setDebitField([{ amount: 0 }, { amount: 0 }]);
    setCreditField([{ amount: 0 }, { amount: 0 }]);
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rows.find((row) => row.id === id);
    if (editedRow.isNew) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const processRowUpdate = async (newRow) => {
    setLoading(true);
    const updatedRow = { ...newRow, isNew: false };
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    debitField.forEach(function (item, i) { if (item === '') debitField[i] = 0 });
    creditField.forEach(function (item, i) { if (item === '') creditField[i] = 0 })
    updatedRow.status = "Pending";
    updatedRow.dateCreated = new Date();
    updatedRow.name = choiceAccounts;
    updatedRow.debit = debitField;
    updatedRow.credit = creditField;
    updatedRow.category = category;
    const newRowID = await storeEntry(
      updatedRow.dateCreated,
      choiceAccounts,
      debitField,
      creditField,
      category,
    );
    updatedRow.id = newRowID;
    setChoiceAccounts([{ name: "" }, { name: "" }]);
    setDebitField([{ amount: 0 }, { amount: 0 }]);
    setCreditField([{ amount: 0 }, { amount: 0 }]);
    setNumberOfRows(1);
    setRows(...rows, updatedRow);
    setViewData(updatedRow);
    setOpen(true);
    return updatedRow;
  };

  const columns = [
    {
      field: "id",
      headerName: "ID",
      flex: 1,
      align: "center",
      hide: true,
    },
    {
      field: "dateCreated",
      headerName: "Date Created",
      type: "date",
      width: 180,
      editable: false,
      align: "center",
      flex: 1,
      renderCell: (params) => {
        const isInEditMode =
          rowModesModel[params.row.id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          params.row.dateCreated = new Date();
          return (
            <div style={{
              display: 'flex',
              flexDirection: "column",
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: 5,
            }}>
              <Item style={{ height: 64 }}>{<div style={{ marginTop: 15 }}>{params.row?.dateCreated?.toDateString()}</div>}</Item>
              {RenderAddRows(numberOfRows,
                <div>
                  <Divider flexItem variant='fullWidth' width={width / 7} />
                  <Item style={{ height: 64 }}>&nbsp;&nbsp;</Item>
                </div>
              )}
            </div>
          );
        }
        return (<div style={{
          display: 'flex',
          flexDirection: "column",
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 5,
        }}>
          {
            params.row.name.map((debit, index) => {
              return (
                <div key={index}>
                  {index > 0 ? <Divider className="mt-1" flexItem variant='fullWidth' width={width / 7} /> : null}
                  <div className="mt-4" style={{ textAlign: "center" }}>
                    {index === 0 ? <p>{params.row.dateCreated.toDateString()}</p> : <p>&nbsp;&nbsp;</p>}
                  </div>
                </div>
              )
            })
          }
        </div>)
      },
    },
    {
      field: "name",
      headerName: "Account Name",
      editable: false,
      flex: 1,
      align: "center",
      valueGetter: (params) => {
        const accountNames = params.row.name;
        return accountNames?.map((elem) => elem.name.name).join(",")
      },
      renderCell: (params) => {
        const isInEditMode =
          rowModesModel[params.row.id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {

          return (<div style={{
            display: 'flex',
            flexDirection: "column",
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 5,
          }}>
            {
              choiceAccounts.map((account, index) => {
                return (
                  <div key={index}>
                    {index > 0 ? <Divider flexItem variant='fullWidth' width={width / 7} /> : null}
                    <Item height={64} >
                      <div style={{ marginTop: 5 }}>
                        <Select
                          name="name"
                          labelId="normal-select-label"
                          id="normal-select"
                          value={account.name}
                          size="small"
                          style={{ width: 200 }}
                          onChange={(event) => {
                            handleAccountChange(event, index);
                          }}
                        >
                          {accounts}
                        </Select>
                      </div>
                    </Item>
                  </div>
                )
              })
            }
          </div>)
        } else {
          return (<div style={{
            display: 'flex',
            flexDirection: "column",
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 5,
          }}>
            {
              params?.value.split(",").map((account, index) => {
                return (
                  <div key={index}>
                    {index > 0 ? <Divider className="mt-1" flexItem variant='fullWidth' width={width / 7} /> : null}
                    <div className="mt-4" style={{ textAlign: "center" }}>
                      <p>{account}</p>
                    </div>
                  </div>
                )
              })
            }
          </div>)
        }
      },
    },
    {
      field: "debit",
      headerName: "Debit",
      width: 100,
      editable: false,
      align: "center",
      flex: 1,
      valueGetter: (params) => {
        const debitAmounts = params.row.debit;
        return debitAmounts?.map((elem) => elem.amount).join(",")
      },
      renderCell: (params) => {
        const isInEditMode =
          rowModesModel[params.row.id]?.mode === GridRowModes.Edit;
        if (isInEditMode) {
          return (
            <div style={{
              display: 'flex',
              flexDirection: "column",
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: 5,
            }}>
              {debitField.map((debit, index) => {
                return (
                  <div key={index}>
                    {index > 0 ? <Divider flexItem variant='fullWidth' width={width / 7} /> : null}
                    <Item style={{ height: 64 }}>
                      <CurrencyTextField
                        placeholder="0.00"
                        name="amount"
                        variant="outlined"
                        value={debit.amount !== 0 ? debit.amount : undefined}
                        currencySymbol="$"
                        fixedDecimalLength="2"
                        outputFormat="number"
                        decimalCharacter="."
                        digitGroupSeparator=","
                        error={balanceError && debit.amount !== 0 ? true : false}
                        onChange={(event) => {
                          handleDebitChange(event, index);
                        }}
                        size="small"
                        style={{ width: 150, marginTop: 5 }}
                      />
                    </Item>
                  </div>
                )
              })}
            </div>
          );
        }
        return (<div style={{
          display: 'flex',
          flexDirection: "column",
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 5,
        }}>
          {
            params?.value.split(",").map((debit, index) => {
              return (
                <div key={index}>
                  {index > 0 ? <Divider className="mt-1" flexItem variant='fullWidth' width={width / 7} /> : null}
                  <div className="mt-4" style={{ textAlign: "center" }}>
                    {parseFloat(debit) !== 0 ? <p>{parseFloat(debit).toLocaleString("en-us", {
                      style: "currency",
                      currency: "USD",
                    })}</p> : <p>&nbsp;&nbsp;</p>}
                  </div>
                </div>
              )
            })
          }
        </div>)
      },
    },
    {
      field: "credit",
      headerName: "Credit",
      width: 100,
      editable: false,
      align: "center",
      flex: 1,
      valueGetter: (params) => {
        const creditAmounts = params.row.credit;
        return creditAmounts?.map((elem) => elem.amount).join(",")
      },
      renderCell: (params) => {
        const isInEditMode =
          rowModesModel[params.row.id]?.mode === GridRowModes.Edit;
        if (isInEditMode) {
          return (
            <div style={{
              display: 'flex',
              flexDirection: "column",
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: 5,
            }}>
              {creditField.map((credit, index) => {
                return (
                  <div key={index}>
                    {index > 0 ? <Divider flexItem variant='fullWidth' width={width / 7 - 1} /> : null}
                    <Item style={{ height: 64 }}>
                      <CurrencyTextField
                        placeholder="0.00"
                        name="amount"
                        variant="outlined"
                        disabled={index !== 0 ? false : true}
                        value={credit.amount !== 0 ? credit.amount : undefined}
                        currencySymbol="$"
                        fixedDecimalLength="2"
                        outputFormat="number"
                        decimalCharacter="."
                        digitGroupSeparator=","
                        error={balanceError && credit.amount !== 0 ? true : false}
                        onChange={(event) => {
                          handleCreditChange(event, index);
                        }}
                        size="small"
                        style={{ width: 150, marginTop: 5 }}
                      />
                    </Item>
                  </div>
                )
              })}
            </div>
          );
        }
        return (<div style={{
          display: 'flex',
          flexDirection: "column",
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 5,
        }}>
          {
            params?.value.split(",").map((credit, index) => {
              return (
                <div key={index}>
                  {index > 0 ? <Divider className="mt-1" flexItem variant='fullWidth' width={width / 7 - 1} /> : null}
                  <div className="mt-4" style={{ textAlign: "center" }}>
                    {parseFloat(credit) !== 0 ? <p>({parseFloat(credit).toLocaleString("en-us", {
                      style: "currency",
                      currency: "USD",
                    })})</p> : <p>&nbsp;&nbsp;</p>}
                  </div>
                </div>
              )
            })
          }
        </div>)
      },
    },
    {
      field: "category",
      type: "string",
      headerName: "Adjusting Category",
      width: 100,
      editable: false,
      align: "center",
      flex: 1,
      renderCell: (params) => {
        const isInEditMode =
          rowModesModel[params.row.id]?.mode === GridRowModes.Edit;
          if (isInEditMode)
            return <Item height={64} >
              <div style={{ marginTop: 5 }}>
                <Select
                  name="name"
                  labelId="normal-select-label"
                  id="normal-select"
                  value={category}
                  size="small"
                  style={{ width: 150 }}
                  onChange={handleCategory}
                >
                  <MenuItem value={"Accrual"}>Accrual</MenuItem>
                  <MenuItem value={"Defferal"}>Defferal</MenuItem>
                  <MenuItem value={"Estimate"}>Estimate</MenuItem>
                </Select>
              </div>
            </Item>
          else
            return <p>{params.row?.category}</p>
      },
    },
    {
      field: "status",
      type: "string",
      headerName: "Status",
      width: 100,
      editable: false,
      align: "center",
      flex: 1,
      renderCell: (params) => {
        const isInEditMode =
          rowModesModel[params.row.id]?.mode === GridRowModes.Edit;
        if (params.row.balance > 0) {
        } else {
          if (isInEditMode)
            return <Chip disabled label="Pending" color="warning" />;
          else if (params.row.status === "Approved")
            return (
              <div style={{ textAlign: "center" }}>
                <Chip
                  size="small"
                  disabled
                  label={params.row.status}
                  color="success"
                />
              </div>
            );
          else if (params.row.status === "Rejected")
            return (
              <div style={{ textAlign: "center" }}>
                <Chip
                  size="small"
                  disabled
                  label={params.row.status}
                  color="error"
                />
              </div>
            );
          else
            return <Chip disabled label={params.row.status} color="warning" />;
        }
      },
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      cellClassName: "actions",
      align: "center",
      flex: 1,
      getActions: (params) => {
        const id = params.row.id;
        const status = params.row.status;
        const debit = params.row.debit;
        const credit = params.row.credit;
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <StyledTooltip
              title="Add a row"
              placement='top'
              arrow
            >
              <GridActionsCellItem
                icon={<Add />}
                label="Add"
                className="textPrimary"
                onClick={() => {
                  setNumberOfRows(numberOfRows + 1);
                  addFields();
                }}
                color="inherit"
              />
            </StyledTooltip>,
            numberOfRows > 1 ?
              <StyledTooltip
                title="Remove a row"
                placement='top'
                arrow
              >
                <GridActionsCellItem
                  icon={<Remove />}
                  label="Remove"
                  className="textPrimary"
                  onClick={() => {
                    setNumberOfRows(numberOfRows - 1);
                    removeFields();
                  }}
                  color="inherit"
                />
              </StyledTooltip>
              :
              <GridActionsCellItem
                icon={<Remove />}
                label="Remove"
                className="textPrimary"
                disabled
                onClick={() => {
                  setNumberOfRows(numberOfRows - 1);
                }}
                color="inherit"
              />,
            <StyledTooltip
              title="Save"
              placement='top'
              arrow
            >
              <GridActionsCellItem
                icon={<Save />}
                label="Save"
                color="inherit"
                onClick={handleSaveClick(id, debit, credit)}
              />
            </StyledTooltip>,
            <StyledTooltip
              title="Cancel"
              placement='top'
              arrow
            >
              <GridActionsCellItem
                icon={<Cancel />}
                label="Cancel"
                className="textPrimary"
                onClick={handleCancelClick(id)}
                color="inherit"
              />
            </StyledTooltip>,
          ];
        } else if (currentRole === "Manager" && status === "Pending") {
          return [
            <div style={{ textAlign: "center" }}>
              <StyledTooltip
                title="Approve journal entry"
                placement='top'
                arrow
              >
                <GridActionsCellItem
                  icon={<Check />}
                  label="Approve"
                  className="textPrimary"
                  onClick={handleApproveClick(id, "Approved", "", params.row)}
                  color="success"
                />
              </StyledTooltip>
              <StyledTooltip
                title="Reject journal entry"
                placement='top'
                arrow
              >
                <GridActionsCellItem
                  icon={<Block />}
                  label="Reject"
                  className="textPrimary"
                  onClick={() => { handleOpenReject(params.row) }}
                  color="error"
                />
              </StyledTooltip>

            </div>,
          ];
        }
        return [
          <div style={{ textAlign: "center" }}>
            <StyledTooltip
              title="View journal entry"
              placement='left'
              arrow
            >
              <MDBBtn onClick={() => { handleOpenView(params.row) }}>View</MDBBtn>
            </StyledTooltip>
          </div>,
        ];
      },
    },
  ];

  async function GetAccounts() {
    try {
      const accountsRef = collection(db, "accounts");

      const q = query(accountsRef);

      const accountsArray = [];

      console.log("got accounts");

      const querySnapshot = await getDocs(q);

      querySnapshot.forEach(async (doc) => {
        const accountObject = {
          name: doc.data().name,
          category: doc.data().category,
        }
        accountsArray.push(
          <MenuItem key={doc.data().id} value={accountObject}>
            {doc.data().name}
          </MenuItem>
        );
      });

      setAccounts(accountsArray);
    } catch (error) { }
  }

  async function GetEntries() {
    try {
      setLoading(true);
      const entriesRef = collection(db, "adjusting-entries");

      const q = query(entriesRef, orderBy("timeStamp", "asc"));

      const rowArray = [];

      console.log("got accounts");

      const querySnapshot = await getDocs(q);

      var checkPending = false;

      querySnapshot.forEach(async (doc) => {
        if (doc.data().status === "Pending")
          checkPending = true;
        rowArray.push({
          id: doc.id,
          name: doc.data().account,
          dateCreated: doc.data().timeStamp.toDate(),
          debit: doc.data().debit,
          credit: doc.data().credit,
          status: doc.data().status,
          comment: doc.data()?.comment,
          documentName: doc.data()?.documentName,
          documentUrl: doc.data()?.documentUrl,
          category: doc.data().category
        });
      });

      if (checkPending === false)
        setPendingEntries(false);
      else
        setPendingEntries(true);

      setRows(rowArray);
    } catch (error) { }
  }

  async function storeEntry(
    dateCreated,
    choiceAccounts,
    debitField,
    creditField,
    category
  ) {
    const newEntryAdded = await addDoc(collection(db, "adjusting-entries"), {
      timeStamp: dateCreated,
      account: choiceAccounts,
      debit: debitField,
      credit: creditField,
      status: "Pending",
      comment: "",
      category: category,
    });
    console.log("Added entry with ID: ", newEntryAdded.id);
    return newEntryAdded.id;
  }

  async function storeEntryError(id, message, debitTotal, creditTotal) {
    // eslint-disable-next-line no-unused-vars
    const newErrorAdded = await addDoc(collection(db, "errors"), {
      journalID: id,
      errorMessage: message,
      debitTotal: debitTotal,
      creditTotal: creditTotal
    });
  }

  async function updateStatus(id, status, comment, balanceAtApproval) {
    console.log("status: " + status);
    console.log("id: " + id);
    const entryRef = doc(db, "adjusting-entries", id);
    // eslint-disable-next-line no-unused-vars
    const update = await updateDoc(entryRef, {
      status: status,
      comment: comment,
      balance: balanceAtApproval,
    });
    console.log("Added status of entry with ID: ", id);
  }

  async function updateJournalDocName(id, name) {
    // eslint-disable-next-line
    const fileRef = ref(storage, "entry docs/" + "journal-entry-" + id + '/' + name);

    getDownloadURL(fileRef).then(async (url) => {
      const entryRef = doc(db, "adjusting-entries", id);
      // eslint-disable-next-line no-unused-vars
      const update = await updateDoc(entryRef, {
        documentName: name,
        documentUrl: url,
      });
    })

    console.log("Added document name to entry with ID: ", id);
  }

  const useContainerDimensions = myRef => {
    const getDimensions = () => ({
      width: myRef.current.offsetWidth,
      height: myRef.current.offsetHeight
    })

    const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

    useEffect(() => {
      const handleResize = () => {
        setDimensions(getDimensions())
      }

      if (myRef.current) {
        setDimensions(getDimensions())
      }

      window.addEventListener("resize", handleResize)

      return () => {
        window.removeEventListener("resize", handleResize)
      }
    }, [myRef])

    if (dimensions.width != 0)
      setWidth(dimensions.width);

    return dimensions;
  };

  const { widthCalc } = useContainerDimensions(ref)

  useEffect(() => {
    console.log(filterProvidedAdjEntry);
    GetAccounts();
    GetEntries().then(setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps



  return (
    <div
      style={{
        height: "85vh",
        marginLeft: "auto",
        marginRight: "auto",
        minWidth: 1000,
        maxWidth: 1900,
        paddingLeft: 25,
        paddingRight: 25,
        paddingTop: 10
      }}>
      <div style={{ display: "flex", height: "100%" }}>
        <div id="capture" style={{ flexGrow: 1, marginLeft: 60 }} ref={ref}>
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
            rows={rows}
            pagination={false}
            getRowHeight={() => 'auto'}
            columns={columns}
            editMode="row"
            loading={loading}
            rowModesModel={rowModesModel}
            onRowModesModelChange={(newModel) => setRowModesModel(newModel)}
            onRowEditStart={handleRowEditStart}
            onRowEditStop={handleRowEditStop}
            processRowUpdate={processRowUpdate}
            initialState={{
              filter: {
                filterModel: {
                  items: [{ columnField: 'id', operatorValue: 'contains', value: filterProvidedAdjEntry }],
                },
              },
            }}
            // onProcessRowUpdateError={(error) => console.log(error)}
            components={{
              Toolbar: EditToolbar,
            }}
            componentsProps={{
              toolbar: { setRows, setRowModesModel },
            }}
            experimentalFeatures={{ newEditingApi: true }}

          />
        </div>
      </div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Attached File:
          </Typography>
          <MDBCol className='d-flex align-items-center justify-content-center gap-2 mt-2'>
            <MDBInput type="file" onChange={handleUploadChange} />
            <MDBBtn disabled={loadingUpload || !docFile} onClick={() => { handleUpload(viewData?.id) }}>Upload</MDBBtn>
          </MDBCol>
          <MDBCol className='d-flex align-items-center justify-content-center gap-2 mt-2'>
            <MDBBtn disabled={loadingUpload} className="mt-3" onClick={() => { { handleClose() } }}>Close</MDBBtn> {/* eslint-disable-line */}
          </MDBCol>
        </Box>
      </Modal>
      <Modal
        open={openReject}
        onClose={handleCloseReject}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <MDBTextArea style={{ resize: "none" }} rows={5} value={comment} onChange={(e) => { setComment(e.target.value) }} label="Comment" />
          <MDBCol className='d-flex align-items-center justify-content-center gap-2 mt-2'>
            <MDBBtn className="mt-3" disabled={comment === "" ? true : false} onClick={handleApproveClick(viewData?.id, "Rejected", comment)}>Reject</MDBBtn>
          </MDBCol>
          <MDBCol className='d-flex align-items-center justify-content-center gap-2 mt-2'>
            <MDBBtn className="mt-3" onClick={() => { handleCloseReject() }}>Cancel</MDBBtn>
          </MDBCol>
        </Box>
      </Modal>
      <Modal
        open={openView}
        onClose={handleCloseView}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <MDBRow>
            <MDBCol sm="4">
              <MDBCardText className='ms-auto mt-1'>Attached File:</MDBCardText>
            </MDBCol>
            <MDBCol sm="8">
              {
                viewData?.documentName === undefined ? <MDBCardText className="text-end text-muted mt-1">None</MDBCardText>
                  :
                  <MDBCardText className="text-end text-muted">
                    {viewData?.documentName}
                    {
                      <a href={viewData?.documentUrl}>
                        <IconButton color="primary">
                          <Download />
                        </IconButton>
                      </a>
                    }
                  </MDBCardText>
              }
            </MDBCol>
          </MDBRow>
          {
            viewData?.status === "Rejected" ?
              <div>
                <hr />
                <MDBRow>
                  <MDBCol sm="4">
                    <MDBCardText className='mt-2'>Comment:</MDBCardText>
                  </MDBCol>
                  <MDBCol sm="8">
                    <MDBCardText className="text-end text-muted mt-2">{viewData?.comment}</MDBCardText>
                  </MDBCol>
                </MDBRow>
              </div>
              : null
          }
          <MDBCol className='d-flex align-items-center justify-content-center gap-2 mt-2'>
            <MDBBtn className="mt-3" onClick={() => { setOpenView(false) }}>Close</MDBBtn>
          </MDBCol>
        </Box>
      </Modal>
    </div>
  );
}
