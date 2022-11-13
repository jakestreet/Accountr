import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
    DataGrid,
    gridPageCountSelector,
    gridPageSelector,
    useGridApiContext,
    useGridSelector,
    GridToolbar,
} from '@mui/x-data-grid';

import { MDBBtn, MDBTooltip } from 'mdb-react-ui-kit';
import { Pagination } from '@mui/material';


export default function Ledger() {
    const navigate = useNavigate();
    const { setFilterProvidedEntry, setFilterProvidedAdjEntry, ledgerRows } = useAuth();


    const columns = [
        {
            field: "id",
            headerName: "ID",
            flex: 1,
        },
        {
            field: "date",
            headerName: "Journal Entry Date",
            flex: 1,
            valueFormatter: params => params?.value.toLocaleDateString('en-US'),
        },
        {
            field: "debit",
            headerName: "Debit",
            flex: 1,
            valueFormatter: params => params?.value.toLocaleString('en-us', {
                style: 'currency',
                currency: 'USD'
            })
        },
        {
            field: "credit",
            headerName: "Credit",
            flex: 1,
            valueFormatter: params => params?.value.toLocaleString('en-us', {
                style: 'currency',
                currency: 'USD'
            })
        },
        {
            field: "balance",
            headerName: "Balance",
            flex: 1,
            valueFormatter: params => params?.value.toLocaleString('en-us', {
                style: 'currency',
                currency: 'USD'
            })
        },
        {
            field: "description",
            headerName: "Description",
            flex: 1
        },
        {
            field: "postreference",
            headerName: "Post Reference",
            flex: 1,
            renderCell: (cellValues) => {
                return (
                    <div className="d-flex gap-2">
                        <MDBTooltip tag="a" placement="auto" title="View this account">
                            {
                                cellValues.row.description === "" ?
                                    <MDBBtn
                                        onClick={() => {
                                            setFilterProvidedEntry(cellValues?.row.id)
                                            navigate("/journal")
                                        }}
                                        className="d-md-flex gap-2 mt-2 btn-sm"
                                        style={{ background: "rgba(41,121,255,1)" }}
                                    >
                                        Go to Entry
                                    </MDBBtn> :
                                    <MDBBtn
                                        onClick={() => {
                                            setFilterProvidedAdjEntry(cellValues?.row.id)
                                            navigate("/journal")
                                        }}
                                        className="d-md-flex gap-2 mt-2 btn-sm"
                                        style={{ background: "rgba(41,121,255,1)" }}
                                    >
                                        Go to ADJ Entry
                                    </MDBBtn>
                            }
                        </MDBTooltip>
                    </div>
                );
            }
        }

    ];

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

    return (
        <div style={{ height: 670, marginLeft: "auto", marginRight: "auto", minWidth: 900, maxWidth: 1800, padding: 10 }}>
            <div style={{ display: 'flex', height: '100%' }}>
                <div id="capture" style={{ flexGrow: 1 }}>
                    <DataGrid
                        sx={{
                            "& .MuiDataGrid-columnHeaders": {
                                backgroundColor: "rgba(41,121,255,1)",
                                color: "rgba(255,255,255,1)",
                                fontSize: 16,
                            },
                            '&.MuiDataGrid-root .MuiDataGrid-columnHeader:focus, &.MuiDataGrid-root .MuiDataGrid-cell:focus': {
                                outline: 'none',
                            }
                        }}
                        rowHeight={100}
                        rows={ledgerRows}
                        columns={columns}
                        autoPageSize
                        disableDensitySelector
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
        </div>
    )
}
