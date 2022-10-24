import { useState, useEffect } from 'react';
import { MDBBtn } from 'mdb-react-ui-kit';
import Pagination from '@mui/material/Pagination';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { app, storage } from '../components/utils/firebase'
import { collection, getDocs, getFirestore } from "firebase/firestore";
import {
    DataGrid,
    gridPageCountSelector,
    gridPageSelector,
    useGridApiContext,
    useGridSelector,
  } from '@mui/x-data-grid';
import { getDownloadURL, ref } from 'firebase/storage';
import { CircularProgress, Grid } from '@mui/material';

export default function EventLogPage() {
    const db = getFirestore(app);

    const [selectedUser, setSelectedUser] = useState({});
    const [imageBefore, setImageBefore] = useState();
    const [imageAfter, setImageAfter] = useState();
    const [openImages, setOpenImages] = useState(false);
    const handleOpenImages = (id) => {
      setOpenImages(true)
      getImages(id);
    };
    const handleCloseImages = () => {
      setOpenImages(false)
      setImageBefore(undefined)
      setImageAfter(undefined)
    }

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 1600,
        bgcolor: 'background.paper',
        border: '5px solid rgba(255,255,255,1)',
        boxShadow: 24,
        p: 4,
      };
    
    const [rows, setRows] = useState([]);

    async function getImages(id) {
      const imageURLBefore = await getDownloadURL(ref(storage, `/events/${id}/before.jpg`));
      setImageBefore(imageURLBefore);
      const imageURLAfter = await getDownloadURL(ref(storage, `/events/${id}/after.jpg`));
      setImageAfter(imageURLAfter);
    }

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
                    date: doc.data().timeStamp.toDate()
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
            field: "date",
            headerName: "Time Stamp",
            flex: 1,
            valueFormatter: params => params?.value.toLocaleString('en-US'),
        },
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
          field: "Actions", flex: 1,
          renderCell: (cellValues) => {
            return (
                <div>
                    <MDBBtn onClick={() => { handleOpenImages(cellValues.row.id) }} className="d-md-flex gap-2 mt-2 btn-sm" style={{background: 'rgba(41,121,255,1)'}}>
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
              <Grid container
                direction="row"
                alignItems="center"
                justifyContent="space-evenly"
                spacing={2}
              >
                {(imageBefore && imageAfter) ? <div>
                  <h1 className='mb-4'>Before Image</h1>
                  <img src={imageBefore} height="500" />
                </div> : <CircularProgress/>}
                {(imageBefore && imageAfter) ? <div >
                  <h1 className='mb-4'>After Image</h1>
                  <img src={imageAfter} height="500" />
                </div> : null}
                
              </Grid>

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
            rowHeight={100}
            rows={rows}
            columns={columns}
            pageSize={10}
            onCellClick = {currentlySelected}
            components={{ 
                Pagination: CustomPagination
                }}
            hideFooterRowCount={true}
            hideFooterSelectedRowCount={true}
            initialState={{sorting: { sortModel: [{ field: 'date', sort: 'desc' }]}}}
        />
    </div>
  )
}
