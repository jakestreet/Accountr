import { useState, useEffect } from "react";
import { MDBBtn, MDBTooltip } from "mdb-react-ui-kit";
import Modal from "@mui/material/Modal";
import * as React from "react";
import PropTypes from "prop-types";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import {
  GridRowModes,
  DataGrid,
  GridToolbarContainer,
  GridActionsCellItem,
} from "@mui/x-data-grid";
import {
  randomId,
} from "@mui/x-data-grid-generator";
import Chip from "@mui/material/Chip";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CurrencyTextField from "../components/CurrencyTextField";
import {
  collection,
  query,
  getDocs,
  getFirestore,
  addDoc
} from "firebase/firestore";
import { app } from "../components/utils/firebase";

export default function JournalPage() {
  const [openHelp, setOpenHelp] = useState(false);
  const handleOpenHelp = () => setOpenHelp(true);
  const handleCloseHelp = () => setOpenHelp(false);
  const [choiceAccountOne, setChoiceAccountOne] = useState("");
  const [choiceAccountTwo, setChoiceAccountTwo] = useState("");
  const [debit, setDebit] = useState();
  const [credit, setCredit] = useState();
  const [accounts, setAccounts] = useState();
  const [loading, setLoading] = useState(false);
  const [sortModel, setSortModel] = React.useState([
    {
      field: 'dateCreated',
      sort: 'asc',
    },
  ]);
  const db = getFirestore(app);

  const initialRows = [];

  function EditToolbar(props) {
    const { setRows, setRowModesModel } = props;

    const handleClick = () => {
      const id = randomId();
      setRows((oldRows) => [
        ...oldRows,
        {
          id,
          name: { accountOne: "none", accountTwo: "none" },
          dateCreated: new Date(),
          debit: { debitOne: 0, debitTwo: 0 },
          credit: { creditOne: 0, creditTwo: 0 },
          status: "Pending",
          isNew: true,
        },
      ]);
      setRowModesModel((oldModel) => ({
        ...oldModel,
        [id]: { mode: GridRowModes.Edit, fieldToFocus: "name" },
      }));
    };

    return (
      <GridToolbarContainer>
        <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
          Add Journal Entry
        </Button>
      </GridToolbarContainer>
    );
  }

  EditToolbar.propTypes = {
    setRowModesModel: PropTypes.func.isRequired,
    setRows: PropTypes.func.isRequired,
  };

  const [rows, setRows] = React.useState(initialRows);
  const [rowModesModel, setRowModesModel] = React.useState({});

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

  const handleDeleteClick = (id) => () => {
    setRows(rows.filter((row) => row.id !== id));
  };

  const handleCancelClick = (id) => () => {
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
    updatedRow.status = "Pending";
    updatedRow.dateCreated = new Date();
    updatedRow.debit.debitOne = debit;
    updatedRow.credit.creditTwo = credit;
    updatedRow.name.accountOne = choiceAccountOne;
    updatedRow.name.accountTwo = choiceAccountTwo;
    const newRowID = await storeEntry(updatedRow.dateCreated, updatedRow.name.accountOne, updatedRow.name.accountTwo, updatedRow.debit.debitOne, updatedRow.credit.creditTwo)
    updatedRow.id = newRowID;
    setChoiceAccountOne("");
    setChoiceAccountTwo("");
    setDebit();
    setCredit();
    console.log(updatedRow);
    setRows(...rows, updatedRow);
    const get = await GetEntries().then(setLoading(false));
    return updatedRow;
  };

  const columns = [
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
            <div className="mt-3" style={{ textAlign: "center" }}>
              <p>{params.row.dateCreated?.toDateString()}</p>
              <hr width={300} />
              <p>---</p>
            </div>
          );
        }
        return (
          <div className="mt-4" style={{ textAlign: "center" }}>
            <p>{params.row.dateCreated?.toDateString()}</p>
            <hr width={300} />
            <p>---</p>
          </div>
        );
      },
    },
    {
      field: "name",
      headerName: "Account Name",
      editable: false,
      flex: 1,
      align: "center",
      renderCell: (params) => {
        const isInEditMode =
          rowModesModel[params.row.id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return (
            <div style={{ textAlign: "center" }}>
              <div className="mt-2" style={{ textAlign: "center" }}>
                <Select
                  labelId="normal-select-label"
                  id="normal-select"
                  value={choiceAccountOne}
                  size="small"
                  style={{ width: 200 }}
                  onChange={(event) => {
                    setChoiceAccountOne(event.target.value);
                  }}
                >
                  {accounts}
                </Select>
              </div>
              <hr width={300} />
              <Select
                labelId="normal-select-label"
                id="normal-select"
                value={choiceAccountTwo}
                size="small"
                className="mb-2"
                style={{ width: 200 }}
                onChange={(event) => {
                  setChoiceAccountTwo(event.target.value);
                }}
              >
                {accounts}
              </Select>
            </div>
          );
        } else {
          return (
            <div className="mt-4" style={{ textAlign: "center" }}>
              <p>{params.row.name?.accountOne}</p>
              <hr width={300} />
              <p>{params.row.name?.accountTwo}</p>
            </div>
          );
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
      renderCell: (params) => {
        const isInEditMode =
          rowModesModel[params.row.id]?.mode === GridRowModes.Edit;
        if (isInEditMode) {
          return (
            <div className="mb-1" style={{ textAlign: "center" }}>
              <CurrencyTextField
                placeholder="0.00"
                variant="outlined"
                value={debit}
                currencySymbol="$"
                fixedDecimalLength="2"
                outputFormat="number"
                decimalCharacter="."
                digitGroupSeparator=","
                onChange={(event, value) => setDebit(value)}
                size="small"
                style={{ width: 150 }}
              />
              <hr width={300} />
              <p>---</p>
            </div>
          );
        }

        return (
          <div className="mt-4" style={{ textAlign: "center" }}>
            <p>
              {params.row.debit?.debitOne.toLocaleString("en-us", {
                style: "currency",
                currency: "USD",
              })}
            </p>
            <hr width={300} />
            <p>---</p>
          </div>
        );
      },
    },
    {
      field: "credit",
      headerName: "Credit",
      width: 100,
      editable: false,
      align: "center",
      flex: 1,
      renderCell: (params) => {
        const isInEditMode =
          rowModesModel[params.row.id]?.mode === GridRowModes.Edit;
        if (isInEditMode) {
          return (
            <div className="mt-3" style={{ textAlign: "center" }}>
              <p>---</p>
              <hr
                width={300}
                style={{ marginTop: "11px", marginBottom: "11px" }}
              />
              <CurrencyTextField
                placeholder="0.00"
                variant="outlined"
                value={credit}
                currencySymbol="$"
                fixedDecimalLength="2"
                outputFormat="number"
                decimalCharacter="."
                digitGroupSeparator=","
                onChange={(event, value) => setCredit(value)}
                size="small"
                style={{ width: 150 }}
              />
            </div>
          );
        }
        return (
          <div className="mt-4" style={{ textAlign: "center" }}>
            <p>---</p>
            <hr width={300} />
            <p>
              (
              {params.row.credit?.creditTwo.toLocaleString("en-us", {
                style: "currency",
                currency: "USD",
              })}
              )
            </p>
          </div>
        );
      },
    },
    // {
    //   field: "balance",
    //   headerName: "Balance",
    //   type: "number",
    //   width: 100,
    //   editable: true
    // },
    {
      field: "status",
      type: "string",
      headerName: "Status",
      width: 220,
      editable: false,
      align: "center",
      flex: 1,
      renderCell: (params) => {
        const isInEditMode =
          rowModesModel[params.row.id]?.mode === GridRowModes.Edit;
        //console.log(params);
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
          else
            return <Chip disabled label={params.row.status} color="warning" />;
        }
      },
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 200,
      cellClassName: "actions",
      align: "center",
      flex: 1,
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <div style={{ textAlign: "center" }}>
            <GridActionsCellItem
              icon={<EditIcon />}
              label="Edit"
              className="textPrimary"
              onClick={handleEditClick(id)}
              color="inherit"
            />
            <GridActionsCellItem
              icon={<DeleteIcon />}
              label="Delete"
              onClick={handleDeleteClick(id)}
              color="inherit"
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
        accountsArray.push(<MenuItem key={doc.data().id} value={doc.data().name}>{doc.data().name}</MenuItem>);
      });
      

      setAccounts(accountsArray);
    } catch (error) {}
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
          name: { accountOne: doc.data().debitAccount, accountTwo: doc.data().creditAccount },
          dateCreated: doc.data().timeStamp.toDate(),
          debit: { debitOne: doc.data().debit, debitTwo: 0 },
          credit: { creditOne: 0, creditTwo: doc.data().credit },
          status: doc.data().status,
        });
      });
      

      setRows(rowArray);
    } catch (error) {}
  }

  async function storeEntry(dateCreated, debitAccount, creditAccount, debit, credit) {
    const newEntryAdded = await addDoc(collection(db, "entries"), {
        timeStamp: dateCreated,
        debitAccount: debitAccount,
        creditAccount: creditAccount,
        debit: debit,
        credit: credit,
        status: "Pending"
    });
    console.log("Added entry with ID: ", newEntryAdded.id);
    return newEntryAdded.id;

}

  useEffect(() => {
    GetAccounts();
    GetEntries().then(setLoading(false));
  }, [])
  

  return (
    <div style={{
      height: "85vh",
      marginLeft: "auto",
      marginRight: "auto",
      minWidth: 900,
      maxWidth: 1800,
      padding: 25,
    }}>
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
          rowHeight={125}
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
          onProcessRowUpdateError={(error) => console.log(error)}
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
