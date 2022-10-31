import { useState } from 'react'
import {
    DataGrid,
    gridPageCountSelector,
    gridPageSelector,
    useGridApiContext,
    useGridSelector,
    GridToolbar,
} from '@mui/x-data-grid';
import {
    randomCreatedDate,
    randomId,
} from '@mui/x-data-grid-generator';
import { MDBBtn } from 'mdb-react-ui-kit';
import { Pagination } from '@mui/material';

export default function Ledger() {
    // const [rows, setRows] = useState();


    const rows = [
        {
            id: randomId(),
            date: randomCreatedDate(),
            description: "Test Description",
            debit: 100,
            credit: 100,
            balance: 100,

        }
    ]


    const columns = [
        {
            field: "id",
            headerName: "ID",
            flex: 1,
        },
        {
            field: "date",
            headerName: "Date",
            flex: 1,
            valueFormatter: params => params?.value.toLocaleDateString('en-US'),
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
            field: "debit",
            headerName: "Debit",
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
        <div style={{ height: 650, marginLeft: "auto", marginRight: "auto", minWidth: 900, maxWidth: 1800, padding: 10 }}>
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
                        rows={rows}
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
