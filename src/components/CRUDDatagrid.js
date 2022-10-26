import * as React from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
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
  randomCreatedDate,
  randomTraderName,
  randomUpdatedDate,
  randomId,
} from "@mui/x-data-grid-generator";
import Chip from "@mui/material/Chip";

const initialRows = [
  {
    id: randomId(),
    name: { accountOne: "Expense", accountTwo: "Cash" },
    dateCreated: randomCreatedDate(),
    debit: { debitOne: 500, debitTwo: 0 },
    credit: { creditOne: 0, creditTwo: 500 },
    status: "Approved",
  },
  {
    id: randomId(),
    name: { accountOne: "Test", accountTwo: "Test" },
    dateCreated: randomCreatedDate(),
    debit: { debitOne: 1000, debitTwo: 0 },
    credit: { creditOne: 0, creditTwo: 1000 },
    status: "Approved",
  },
];
console.log(initialRows[0].name.accountOne);

function EditToolbar(props) {
  const { setRows, setRowModesModel } = props;

  const handleClick = () => {
    const id = randomId();
    setRows((oldRows) => [...oldRows, { id, name: "", age: "", isNew: true }]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: "name" },
    }));
  };

  return (
    <GridToolbarContainer>
      <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
        Add record
      </Button>
    </GridToolbarContainer>
  );
}

EditToolbar.propTypes = {
  setRowModesModel: PropTypes.func.isRequired,
  setRows: PropTypes.func.isRequired,
};

export default function FullFeaturedCrudGrid() {
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

  const processRowUpdate = (newRow) => {
    const updatedRow = { ...newRow, isNew: false };
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    updatedRow.status = "Pending";
    updatedRow.dateCreated = new Date();
    console.log(updatedRow);
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
      renderCell: (params) => {
        const isInEditMode =
          rowModesModel[params.row.id]?.mode === GridRowModes.Edit;
        if (isInEditMode) {
          params.row.dateCreated = new Date();
        }
        return (
          <div>
            <p>{params.row.dateCreated?.toDateString()}</p>
            <hr width={180} />
            <p>---</p>
          </div>
        );
      },
    },
    {
      field: "name",
      headerName: "Account Name",
      width: 180,
      editable: true,
      align: "center",
      renderCell: (params) => {
        return (
          <div>
            <p>{params.row.name?.accountOne}</p>
            <hr width={180} />
            <p>{params.row.name?.accountTwo}</p>
          </div>
        );
      },
    },
    {
      field: "debit",
      headerName: "Debit",
      width: 100,
      editable: true,
      align: "center",
      renderCell: (params) => {
        return (
          <div>
            <p>{params.row.debit?.debitOne}</p>
            <hr width={100} />
            <p>---</p>
          </div>
        );
      },
    },
    {
      field: "credit",
      headerName: "Credit",
      width: 100,
      editable: true,
      align: "center",
      renderCell: (params) => {
        return (
          <div>
            <p>---</p>
            <hr width={100} />
            <p>{params.row.credit?.creditTwo}</p>
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
              <div>
                <Chip disabled label={params.row.status} color="success" />
                <hr width={220} />
                <p>---</p>
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
      cellClassName: "actions",
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
          <div>
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
            <hr width={200} />
            <p>---</p>
          </div>,
        ];
      },
    },
  ];

  return (
    <Box
      sx={{
        height: 500,
        width: "100%",
        "& .actions": {
          color: "text.secondary",
        },
        "& .textPrimary": {
          color: "text.primary",
        },
      }}
    >
      <DataGrid
        rows={rows}
        rowHeight={100}
        columns={columns}
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={(newModel) => setRowModesModel(newModel)}
        onRowEditStart={handleRowEditStart}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        components={{
          Toolbar: EditToolbar,
        }}
        componentsProps={{
          toolbar: { setRows, setRowModesModel },
        }}
        experimentalFeatures={{ newEditingApi: true }}
      />
    </Box>
  );
}
