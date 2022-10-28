import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import {
    GridRowModes,
    DataGrid,
    GridToolbarContainer,
    GridActionsCellItem,
} from '@mui/x-data-grid';
import {
    randomCreatedDate,
    randomTraderName,
    randomUpdatedDate,
    randomId,
} from '@mui/x-data-grid-generator';
import Chip from "@mui/material/Chip";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CurrencyTextField from "../components/CurrencyTextField";
import { Grid, List, ListItem } from '@mui/material';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import { Divider } from '@mui/material';
import { Container } from '@mui/system';

export default function FullFeaturedCrudGrid() {

    const [choiceAccountOne, setChoiceAccountOne] = useState("");
    const [choiceAccountTwo, setChoiceAccountTwo] = useState("");
    const [debit, setDebit] = useState();
    const [credit, setCredit] = useState();
    const [accounts, setAccounts] = useState(["accountOne", "accountTwo"]);
    const [height, setHeight] = useState(0)
    const ref = useRef(null)

    useEffect(() => {
        setHeight(ref.current?.clientHeight)
    })

    const Item = styled(Box)(({ theme }) => ({
        padding: theme.spacing(1),
        textAlign: 'center',
        // backgroundColor: "lightgrey",

    }));

    const initialRows = [
        {
            id: randomId(),
            name: randomTraderName(),
            debit: 25,
            credit: 25,
            dateCreated: randomCreatedDate(),
            lastLogin: randomUpdatedDate(),
        },
        //   {
        //     id: randomId(),
        //     name: randomTraderName(),
        //     debit: 36,
        //     credit: 36,
        //     dateCreated: randomCreatedDate(),
        //     lastLogin: randomUpdatedDate(),
        //   },
        //   {
        //     id: randomId(),
        //     name: randomTraderName(),
        //     debit: 19,
        //     credit: 19,
        //     dateCreated: randomCreatedDate(),
        //     lastLogin: randomUpdatedDate(),
        //   },
        //   {
        //     id: randomId(),
        //     name: randomTraderName(),
        //     debit: 28,
        //     credit: 28,
        //     dateCreated: randomCreatedDate(),
        //     lastLogin: randomUpdatedDate(),
        //   },
        //   {
        //     id: randomId(),
        //     name: randomTraderName(),
        //     debit: 23,
        //     credit: 23,
        //     dateCreated: randomCreatedDate(),
        //     lastLogin: randomUpdatedDate(),
        //   },
    ];

    function EditToolbar(props) {
        const { setRows, setRowModesModel } = props;

        const handleClick = () => {
            const id = randomId();
            setRows((oldRows) => [...oldRows, { id, dateCreated: new Date(), name: '', age: '', isNew: true }]);
            setRowModesModel((oldModel) => ({
                ...oldModel,
                [id]: { mode: GridRowModes.Edit, fieldToFocus: 'name' },
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
        return updatedRow;
    };

    const columns = [
        {
            field: 'dateCreated',
            headerName: 'Date Created',
            type: 'date',
            flex: 1,
            editable: false,
            align: "center",
            renderCell: (params) => {
                const isInEditMode = rowModesModel[params.row.id]?.mode === GridRowModes.Edit;
                if (isInEditMode)
                    return (
                        <div style={{
                            display: 'flex',
                            flexDirection: "column",
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingTop: 5,
                        }}>
                            <Item style={{ height: 64 }}>{<div style={{ marginTop: 15 }}>{params.row?.dateCreated?.toLocaleString()}</div>}</Item>
                            <Divider flexItem variant='fullWidth' width={225}/>
                            <Item style={{ height: 64 }} dense alignItems="flex-start">&nbsp;&nbsp;</Item>
                            <Divider flexItem variant='fullWidth' />
                            <Item style={{ height: 64 }}>&nbsp;&nbsp;</Item>
                            <Divider flexItem variant='fullWidth' />
                            <Item style={{ height: 64 }} dense alignItems="flex-start">&nbsp;&nbsp;</Item>
                        </div>
                    )
                return (
                    <List>
                        <Item>{params.row?.dateCreated?.toLocaleString()}</Item>
                        <Divider flexItem variant='fullWidth' width={225}/>
                        <Item>&nbsp;&nbsp;</Item>
                    </List>
                );
            }
        },
        {
            field: 'name', headerName: 'Name', flex: 1, editable: false, align: "center", renderCell: (params) => {
                const isInEditMode = rowModesModel[params.row.id]?.mode === GridRowModes.Edit;
                if (isInEditMode)
                    return (
                        <div style={{
                            display: 'flex',
                            flexDirection: "column",
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingTop: 5,
                        }}>
                            <Item ref={ref} height={64} >
                                {
                                    <div style={{ marginTop: 5 }}>
                                        {
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
                                        }
                                    </div>
                                }
                            </Item>
                            <Divider flexItem variant='fullWidth'/>
                            <Item>
                                {
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
                                }
                            </Item>
                            <Divider flexItem variant='fullWidth' width={225}/>
                            <Item height={64}>
                                {
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
                                }
                            </Item>
                            <Divider flexItem variant='fullWidth' />
                            <Item>{<Select
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
                            </Select>}</Item>
                        </div>
                    )
                return (
                    <List>
                        <Item>{params.row?.name}</Item>
                        <Divider flexItem variant='fullWidth' width={225}/>
                        <Item>{params.row?.name}</Item>
                    </List>
                );
            }
        },
        {
            field: 'debit', headerName: 'Debit', type: 'number', flex: 1, editable: false, renderCell: (params) => {
                return (
                    <List>
                        <Item>{params.row?.debit}</Item>
                        <Divider variant='fullWidth' component="li" />
                        <Item>&nbsp;&nbsp;</Item>
                    </List>
                );
            }
        },
        {
            field: 'credit', headerName: 'Credit', type: 'number', flex: 1, editable: false, renderCell: (params) => {
                return (
                    <List>
                        <Item>&nbsp;&nbsp;</Item>
                        <Divider variant='fullWidth' component="li" />
                        <Item>{params.row?.credit}</Item>
                    </List>
                );
            }
        },
        {
            field: 'lastLogin',
            headerName: 'Last Login',
            type: 'dateTime',
            flex: 1,
            editable: false,
            renderCell: (params) => {
                const isInEditMode = rowModesModel[params.row.id]?.mode === GridRowModes.Edit;
                if (isInEditMode)
                    return (
                        <List>
                            <Item>{<Chip size='small' label="Pending" />}</Item>
                            <Divider variant='fullWidth' component="li" />
                            <Item>&nbsp;&nbsp;</Item>
                        </List>
                    )
                return (
                    <List>
                        <Item>{<Chip size='small' label="Pending" />}</Item>
                        <Divider variant='fullWidth' component="li" />
                        <Item>&nbsp;&nbsp;</Item>
                    </List>
                );
            }
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            flex: 1,
            cellClassName: 'actions',
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
                    <GridActionsCellItem
                        icon={<EditIcon />}
                        label="Edit"
                        className="textPrimary"
                        onClick={handleEditClick(id)}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        icon={<DeleteIcon />}
                        label="Delete"
                        onClick={handleDeleteClick(id)}
                        color="inherit"
                    />,
                ];
            },
        },
    ];

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
                        rows={rows}
                        minWidth={1000}
                        columns={columns}
                        editMode="row"
                        getRowHeight={() => 'auto'}
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
                </div>
            </div>
        </div>
    );
}
