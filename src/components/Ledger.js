import { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import { app } from "../components/utils/firebase";
import { useAuth } from "../contexts/AuthContext";
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
import { MDBBtn, MDBTooltip } from 'mdb-react-ui-kit';
import { Pagination } from '@mui/material';
import {
    collection,
    query,
    getDocs,
    getFirestore,
  } from "firebase/firestore";

export default function Ledger() {
    const db = getFirestore(app);
    const navigate = useNavigate();

    const [rows, setRows] = useState();
    const [arrayToFilter, setArrayToFilter] = useState([]);
    const [entriesToFilter, setEntriesToFilter] = useState([]);
    const { currentAccount, setFilterProvidedEntry  } = useAuth();

    const initialRow = [
        {
            id: randomId(),
            date: randomCreatedDate(),
            description: "Test Description",
            debit: 100,
            credit: 0,
            balance: 1745.98,
            postreference: 1
        }
    ];

    async function GetEntries() {
        try {
            // setLoading(true);
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
                    comment: doc.data()?.comment,
                    documentName: doc.data()?.documentName,
                    documentUrl: doc.data()?.documentUrl
                });
            });
             setArrayToFilter(rowArray);
        } catch (error) { }
    }

    function getBalance(balance, debit, credit){
        if(credit !== 0){
            return balance - credit;
        }
        else{
            return balance + debit;
        }
    }

    function filterEntries(){
        let temp = [];
        entriesToFilter.map(entry => {
            entry['name'].map((data, index) => {
                if(data['name'] === currentAccount.name){
                    temp.push({
                        id: entry['id'],
                        date: entry['dateCreated'],
                        debit: parseFloat(entry['debit'][index]['amount']),
                        credit: parseFloat(entry['credit'][index]['amount']),
                        balance: getBalance(parseFloat(currentAccount.balance), parseFloat(entry['debit'][index]['amount']), parseFloat(entry['credit'][index]['amount'])),
                        description: entry['comment']
                    })
                }
            })
        })
        console.log(temp);
        setRows(temp);
    }

    useEffect(() => {
        console.log(currentAccount.name)
        GetEntries().then(
            arrayToFilter.forEach((entry) => {
                if(entry['status'] === 'Approved'){
                    entry['name'].forEach((name) => {
                        if(name['name'] === currentAccount.name){
                            entriesToFilter.push(entry);
                            console.log(entriesToFilter);
                        }
                    })
                }
            })
        ).then(filterEntries())  
        
    }, [])
    

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
                        <MDBBtn
                            onClick={() => {
                                setFilterProvidedEntry(cellValues?.row.id)
                                navigate("/journal")
                            }}
                            className="d-md-flex gap-2 mt-2 btn-sm"
                            style={{ background: "rgba(41,121,255,1)" }}
                        >
                            Go to Ledger
                        </MDBBtn>
                    </MDBTooltip>
                </div>
            );}
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
                        rows={rows ? rows : initialRow}
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
