import { useState, useEffect } from 'react';
import { MDBBtn } from 'mdb-react-ui-kit';
import Pagination from '@mui/material/Pagination';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { app } from '../components/utils/firebase'
import { collection, getDocs, getFirestore } from "firebase/firestore";
import {
    DataGrid,
    gridPageCountSelector,
    gridPageSelector,
    useGridApiContext,
    useGridSelector,
  } from '@mui/x-data-grid';

export default function EventLogPage() {
    const db = getFirestore(app);

    const [selectedUser, setSelectedUser] = useState({});
    const [openImages, setOpenImages] = useState(false);
    const handleOpenImages = () => setOpenImages(true);
    const handleCloseImages = () => {
      setOpenImages(false)
    }

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 1000,
        bgcolor: 'background.paper',
        border: '5px solid rgba(255,255,255,1)',
        boxShadow: 24,
        p: 4,
      };
    
    const [rows, setRows] = useState([]);

    async function GetEvents() {
        console.log("got events")
        try {
            const usersRef = collection(db, "events");

            const querySnapshot = await getDocs(usersRef);

            const rowsArray = [];

            querySnapshot.forEach(async (doc) => {
                rowsArray.push({
                    id: doc.id,
                    username: doc.data().username,
                    time: doc.data().time,
                    date: doc.data().date
                })
            });

            setRows(rowsArray);
            } catch (error) {
            }
    }


    function currentlySelected(GridCellParams){
        const currentUser = GridCellParams.row
        setSelectedUser(currentUser)
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


    const columns = [
        {
            field: "id",
            headerName: "ID",
            flex: 1
        },
        {
            field: "username",
            headerName: "Username",
            flex: 1
        },
        {
            field: "time",
            headerName: "Time",
            flex: 1
        },
        {
            field: "date",
            headerName: "Date",
            flex: 1
        },
        {
          field: "Actions", flex: 1,
          renderCell: (cellValues) => {
            return (
                <div>
                    <MDBBtn onClick={() => { handleOpenImages() }} className="d-md-flex gap-2 mt-2 btn-sm" style={{background: 'rgba(41,121,255,1)'}}>
                    View Images
                    </MDBBtn>
                </div>
            )
          }
        }
      ];

      useEffect(() => {
        let ignore = false;
        
        if (!ignore)  GetEvents()
        return () => { ignore = true; }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        },[]);

  return (
    <div style={{ height: 1160, marginLeft:"auto", marginRight:"auto", minWidth:900, maxWidth:1800, padding:25 }}>
        <div className="d-md-flex m-auto mb-3 gap-2">
            <MDBBtn onClick={() => {GetEvents()}} style={{background: 'rgba(41,121,255,1)'}}>Refresh</MDBBtn>
        </div>
        <Modal
            open={openImages}
            onClose={handleCloseImages}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <label>ID: {selectedUser.id}</label>
                <label>Before Image</label>
                <label>After Image</label>
                <MDBBtn onClick={() => {handleCloseImages()}} className="d-md-flex m-auto mt-4" style={{background: 'rgba(41,121,255,1)'}}>Close</MDBBtn>
            </Box>
        </Modal>
        <DataGrid
            sx={{ "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "rgba(41,121,255,1)",
                color: "rgba(255,255,255,1)",
                fontSize: 16,
              }, 
              '&.MuiDataGrid-root .MuiDataGrid-columnHeader:focus, &.MuiDataGrid-root .MuiDataGrid-cell:focus': {
                outline: 'none', }
            }}
            rowHeight={160}
            rows={rows}
            columns={columns}
            pageSize={10}
            onCellClick = {currentlySelected}
            components={{ 
                Pagination: CustomPagination
                }}
            hideFooterRowCount={true}
            hideFooterSelectedRowCount={true}
        />
    </div>
  )
}
