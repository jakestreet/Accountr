import { useState, useEffect } from "react";
import { MDBBtn } from "mdb-react-ui-kit";
import Pagination from "@mui/material/Pagination";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { app, storage } from "../components/utils/firebase";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import {
  DataGrid,
  gridPageCountSelector,
  gridPageSelector,
  GridToolbar,
  useGridApiContext,
  useGridSelector,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import { getDownloadURL, ref } from "firebase/storage";
import { CircularProgress, Grid } from "@mui/material";
import Button from "@mui/material/Button";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useAuth } from "../contexts/AuthContext";

export default function EventLogPage() {
  const db = getFirestore(app);
  const { StyledTooltip } = useAuth();
  const [openHelp, setOpenHelp] = useState(false);
  const handleOpenHelp = () => setOpenHelp(true);
  const handleCloseHelp = () => setOpenHelp(false);
  const [selectedUser, setSelectedUser] = useState({});
  const [imageBefore, setImageBefore] = useState();
  const [imageAfter, setImageAfter] = useState();
  const [openImages, setOpenImages] = useState(false);
  const handleOpenImages = (id) => {
    setOpenImages(true);
    getImages(id);
  };
  const handleCloseImages = () => {
    setOpenImages(false);
    setImageBefore(undefined);
    setImageAfter(undefined);
  };

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 1600,
    bgcolor: "background.paper",
    border: "5px solid rgba(255,255,255,1)",
    boxShadow: 24,
    p: 4,
  };

  function CustomToolBar() {
    return (
      <GridToolbarContainer>
        <Button
          color="primary"
          onClick={() => {
            GetEvents();
          }}
          startIcon={<RefreshIcon />}
        >
          Refresh
        </Button>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarExport />
        <GridToolbarQuickFilter className="ms-auto" />
      </GridToolbarContainer>
    );
  }

  const [rows, setRows] = useState([]);

  async function getImages(id) {
    const imageURLBefore = await getDownloadURL(
      ref(storage, `/events/${id}/before.jpg`)
    );
    setImageBefore(imageURLBefore);
    const imageURLAfter = await getDownloadURL(
      ref(storage, `/events/${id}/after.jpg`)
    );
    setImageAfter(imageURLAfter);
  }

  async function GetEvents() {
    console.log("got events");
    try {
      const usersRef = collection(db, "events");

      const querySnapshot = await getDocs(usersRef);

      const rowsArray = [];

      querySnapshot.forEach(async (doc) => {
        rowsArray.push({
          id: doc.id,
          username: doc.data().username,
          date: doc.data().timeStamp.toDate(),
        });
      });

      setRows(rowsArray);
    } catch (error) { }
  }

  function currentlySelected(GridCellParams) {
    const currentUser = GridCellParams.row;
    setSelectedUser(currentUser);
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
      type: "date",
      flex: 1,
      renderCell: (params) => params?.value.toLocaleString("en-US"),
    },
    {
      field: "id",
      headerName: "ID",
      flex: 1,
    },
    {
      field: "username",
      headerName: "Username",
      flex: 1,
    },
    {
      field: "Actions",
      flex: 1,
      renderCell: (cellValues) => {
        return (
          <div>
            <StyledTooltip
              title="View Recent Changes"
              placement='left'
              arrow
            >
              <MDBBtn
                onClick={() => {
                  handleOpenImages(cellValues.row.id);
                }}
                className="d-md-flex gap-2 mt-2 btn-sm"
                style={{ background: "rgba(41,121,255,1)" }}
              >
                View Images
              </MDBBtn>
            </StyledTooltip>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    let ignore = false;

    if (!ignore) GetEvents();
    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{
        height: "89vh",
        marginLeft: "auto",
        marginRight: "auto",
        minWidth: 900,
        maxWidth: 1900,
        paddingLeft: 25,
        paddingRight: 25,
        paddingTop: 10
      }}
    >
      <Modal
        open={openImages}
        onClose={handleCloseImages}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Grid
            container
            direction="row"
            alignItems="center"
            justifyContent="space-evenly"
            spacing={1}
          >
            <h4 className="mb-4">Before Image</h4>
            {imageBefore && imageAfter ? (
              <div className="mb-5">
                <img src={imageBefore} height="400" />
              </div>
            ) : (
              <CircularProgress />
            )}

          </Grid>
          <Grid
            container
            direction="row"
            alignItems="center"
            justifyContent="space-evenly"
            spacing={1}
          >
            <h4 className="mb-4">After Image</h4>
            {imageBefore && imageAfter ? (
              <div>

                <img src={imageAfter} height="400" />
              </div>
            ) : null}
          </Grid>

          <MDBBtn
            onClick={() => {
              handleCloseImages();
            }}
            className="d-md-flex m-auto mt-4"
            style={{ background: "rgba(41,121,255,1)" }}
          >
            Close
          </MDBBtn>
        </Box>
      </Modal>
      <div style={{ display: "flex", height: "100%" }}>
        <div id="capture" style={{ flexGrow: 1, marginLeft: 60 }}>
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
            rowHeight={80}
            rows={rows}
            columns={columns}
            // autoPageSize
            rowsPerPage={10}
            disableDensitySelector
            onCellClick={currentlySelected}
            components={{
              Pagination: CustomPagination,
              Toolbar: CustomToolBar,
            }}
            hideFooterRowCount={true}
            hideFooterSelectedRowCount={true}
            initialState={{
              sorting: { sortModel: [{ field: "date", sort: "desc" }] },
            }}
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
  );
}
