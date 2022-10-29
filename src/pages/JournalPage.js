import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { MDBBtn, MDBTooltip } from "mdb-react-ui-kit";
import Modal from "@mui/material/Modal";
import * as React from "react";
import PropTypes from "prop-types";
import Button from "@mui/material/Button";
import { Add, Edit, Delete, Save, Cancel, Check, Block, Remove } from "@mui/icons-material"
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
} from "firebase/firestore";
import { app } from "../components/utils/firebase";
import { Box } from "@mui/material";
import { styled } from '@mui/material/styles';
import { Divider } from '@mui/material';

export default function JournalPage() {
  const { currentRole, filterProvidedEntry } = useAuth();
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
  const db = getFirestore(app);
  const [sortModel, setSortModel] = useState([
    {
      field: "dateCreated",
      sort: "asc",
    },
  ]);

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
    data[index][event.target.name] = event.target.value;
  }

  const handleCreditChange = (event, index) => {
    let data = [...creditField];
    data[index][event.target.name] = event.target.value;
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


  const handleEditClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleApproveClick = (id, status) => async () => {
    // eslint-disable-next-line no-unused-vars
    const update = await updateStatus(id, status).then(
      GetEntries().then(setLoading(false))
    );
  };

  const handleDeleteClick = (id) => () => {
    setRows(rows.filter((row) => row.id !== id));
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
    const updatedRow = { ...newRow, isNew: false };
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    debitField.forEach(function (item, i) { if (item === '') debitField[i] = 0 });
    creditField.forEach(function (item, i) { if (item === '') creditField[i] = 0 })
    updatedRow.status = "Pending";
    updatedRow.dateCreated = new Date();
    updatedRow.name = choiceAccounts;
    updatedRow.debit = debitField;
    updatedRow.credit = creditField;
    const newRowID = await storeEntry(
      updatedRow.dateCreated,
      choiceAccounts,
      debitField,
      creditField,
    );
    updatedRow.id = newRowID;
    setChoiceAccounts([{ name: "" }, { name: "" }]);
    setDebitField([{ amount: 0 }, { amount: 0 }]);
    setCreditField([{ amount: 0 }, { amount: 0 }]);
    setNumberOfRows(1);
    setRows(...rows, updatedRow);
    // eslint-disable-next-line no-unused-vars
    const get = await GetEntries().then(setLoading(false));
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
                  <Divider flexItem variant='fullWidth' width={225} />
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
                  {index > 0 ? <Divider className="mt-1" flexItem variant='fullWidth' width={225} /> : null}
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
        return accountNames?.map((elem) => elem.name).join(",")
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
                    {index > 0 ? <Divider flexItem variant='fullWidth' width={225} /> : null}
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
                    {index > 0 ? <Divider className="mt-1" flexItem variant='fullWidth' width={225} /> : null}
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
                    {index > 0 ? <Divider flexItem variant='fullWidth' width={225} /> : null}
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
                  {index > 0 ? <Divider className="mt-1" flexItem variant='fullWidth' width={225} /> : null}
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
                    {index > 0 ? <Divider flexItem variant='fullWidth' width={225} /> : null}
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
                  {index > 0 ? <Divider className="mt-1" flexItem variant='fullWidth' width={225} /> : null}
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
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<Add />}
              label="Add"
              className="textPrimary"
              onClick={() => {
                setNumberOfRows(numberOfRows + 1);
                addFields();
              }}
              color="inherit"
            />,
            numberOfRows > 1 ? <GridActionsCellItem
              icon={<Remove />}
              label="Remove"
              className="textPrimary"
              onClick={() => {
                setNumberOfRows(numberOfRows - 1);
                removeFields();
              }}
              color="inherit"
            /> : <GridActionsCellItem
              icon={<Remove />}
              label="Remove"
              className="textPrimary"
              disabled
              onClick={() => {
                setNumberOfRows(numberOfRows - 1);
              }}
              color="inherit"
            />,
            <GridActionsCellItem
              icon={<Save />}
              label="Save"
              color="inherit"
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              icon={<Cancel />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        } else if (currentRole === "Manager" && status === "Pending") {
          return [
            <div style={{ textAlign: "center" }}>
              <GridActionsCellItem
                icon={<Check />}
                label="Approve"
                className="textPrimary"
                onClick={handleApproveClick(id, "Approved")}
                color="success"
              />
              <GridActionsCellItem
                icon={<Block />}
                label="Reject"
                className="textPrimary"
                onClick={handleApproveClick(id, "Rejected")}
                color="error"
              />
            </div>,
          ];
        }
        return [
          <div style={{ textAlign: "center" }}>
            <GridActionsCellItem
              icon={<Edit />}
              label="Edit"
              className="textPrimary"
              onClick={handleEditClick(id)}
              color="primary"
            />
            <GridActionsCellItem
              icon={<Delete />}
              label="Delete"
              className="textPrimary"
              onClick={handleDeleteClick(id)}
              color="error"
            />
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
        accountsArray.push(
          <MenuItem key={doc.data().id} value={doc.data().name}>
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
      const entriesRef = collection(db, "entries");

      const q = query(entriesRef);

      const rowArray = [];

      console.log("got accounts");

      const querySnapshot = await getDocs(q);

      querySnapshot.forEach(async (doc) => {
        rowArray.push({
          id: doc.id,
          name: doc.data().account,
          dateCreated: doc.data().timeStamp.toDate(),
          debit: doc.data().debit,
          credit: doc.data().credit,
          status: doc.data().status,
        });
      });

      setRows(rowArray);
    } catch (error) { }
  }

  async function storeEntry(
    dateCreated,
    choiceAccounts,
    debitField,
    creditField
  ) {
    const newEntryAdded = await addDoc(collection(db, "entries"), {
      timeStamp: dateCreated,
      account: choiceAccounts,
      debit: debitField,
      credit: creditField,
      status: "Pending",
    });
    console.log("Added entry with ID: ", newEntryAdded.id);
    return newEntryAdded.id;
  }

  async function updateStatus(id, status) {
    console.log("status: " + status);
    console.log("id: " + id);
    const entryRef = doc(db, "entries", id);
    // eslint-disable-next-line no-unused-vars
    const update = await updateDoc(entryRef, {
      status: status,
    });
    console.log("Added status of entry with ID: ", id);
  }

  useEffect(() => {
    GetAccounts();
    GetEntries().then(setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      style={{
        height: "85vh",
        marginLeft: "auto",
        marginRight: "auto",
        minWidth: 1400,
        maxWidth: 1400,
        padding: 25,
      }}
    >
      <div style={{ display: "flex", height: "100%" }}>
        <div id="capture" style={{ flexGrow: 1 }}>
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
            pagination
            autoPageSize
            getRowHeight={() => 'auto'}
            columns={columns}
            editMode="row"
            loading={loading}
            sortModel={sortModel}
            onSortModelChange={(newSortModel) => setSortModel(newSortModel)}
            rowModesModel={rowModesModel}
            onRowModesModelChange={(newModel) => setRowModesModel(newModel)}
            onRowEditStart={handleRowEditStart}
            onRowEditStop={handleRowEditStop}
            processRowUpdate={processRowUpdate}
            initialState={filterProvidedEntry}
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
      <div class="fixed-bottom" style={{ padding: 10 }}>
        <MDBTooltip tag="a" placement="auto" title="Help">
          <button
            type="button"
            className="btn btn-primary btn-floating"
            onClick={() => {
              handleOpenHelp();
            }}
          >
            ?
          </button>
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
                <dd class="col-sm-9">No Content</dd>
              </dl>
            </div>
            <MDBBtn
              onClick={handleCloseHelp}
              className="d-md-flex m-auto mt-4"
              style={{ background: "rgba(41,121,255,1)" }}
            >
              Close
            </MDBBtn>
          </div>
        </Modal>
      </div>
    </div>
  );
}
