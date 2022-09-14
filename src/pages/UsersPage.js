import { useState, useEffect } from 'react'
import { app } from '../components/utils/firebase'
import { collection, query, where, getDocs, getFirestore, doc, updateDoc } from "firebase/firestore";
import { MDBBadge, MDBBtn } from 'mdb-react-ui-kit';
import {
    DataGrid,
    gridPageCountSelector,
    gridPageSelector,
    useGridApiContext,
    useGridSelector,
  } from '@mui/x-data-grid';
import Pagination from '@mui/material/Pagination';

export default function RequestsPage() {

    const db = getFirestore(app);

    const [rows, setRows] = useState([]);

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

    function UpdateStatusPill(status) {
        if(status === 'Approved')
        {
            return "success"
        }
        else if(status === 'Requested') {
            return "info"
        }
        else if(status === 'Disabled') {
            return "warning"
        }
        else if(status === 'Suspended') {
            return "secondary"
        }
        else if(status === 'Rejected') {
            return "danger"
        }
    }

    async function UpdateStatus(email, status) {
        try{
            const userRef = doc(db, "users", email)

            await updateDoc(userRef, {
                status: status
            });
            await GetRequests();
        }
        catch (error) {
        }
    }

    function UpdateStatusApprove(status) {
        if(status === "Approved") {
            return "Suspended"
        }
        else if(status === "Requested"  || status === "Suspended") {
            return "Approved"
        }
        else if(status === "Rejected" || status === "Disabled") {
            return "Approved"
        }
    }

    function UpdateStatusReject(status) {
        if(status === "Approved" || status === "Suspended") {
            return "Disabled"
        }
        else if(status === "Requested") {
            return "Rejected"
        }
        else if(status === "Rejected" || status === "Disabled") {
            return "Deleted"
        }
    }

    function UpdateButtonApprove(status) {
        if(status === "Approved") {
            return "Suspend"
        }
        else if(status === "Requested") {
            return "Approve"
        }
        else if(status === "Suspended") {
            return "Resume"
        }
        else if(status === "Rejected" || status === "Disabled") {
            return "Approve"
        }
    }

    function UpdateButtonReject(status) {
        if(status === "Approved" || status === "Suspended") {
            return "Disable"
        }
        else if(status === "Requested") {
            return "Reject"
        }
        else if(status === "Rejected" || status === "Disabled") {
            return "Delete"
        }
    }

    async function GetRequests() {
        try {
            const usersRef = collection(db, "users");

            const q = query(usersRef, where("status", "!=", "none"));
          
            const querySnapshot = await getDocs(q);

            const rowsArray = [];

            querySnapshot.forEach(async (doc) => {
                rowsArray.push({
                    id: doc.data().email,
                    firstName: doc.data().firstname,
                    lastName: doc.data().lastname,
                    email: doc.data().email,
                    role: doc.data().role,
                    statusText: doc.data().status,
                    statusPill: UpdateStatusPill(doc.data().status)
                })
            });

            setRows(rowsArray);
            } catch (error) {
            }
    }

    useEffect(() => {
        let ignore = false;
        
        if (!ignore)  GetRequests()
        return () => { ignore = true; }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        },[]);

        const columns = [
            {
                field: "firstName",
                headerName: "First Name",
                flex: 1
            },
            {
                field: "lastName",
                headerName: "Last Name",
                flex: 1
            },
            {
                field: "email",
                headerName: "Email",
                flex: 1
            },
            {
                field: "role",
                headerName: "Role",
                flex: 1
            },
            {
                field: "statusText", flex: 1, headerName: "Status",
                renderCell: (cellValues) => {
                  return (
                    <h6>
                      <MDBBadge color={cellValues.row.statusPill} pill>
                          {cellValues.row.statusText}
                      </MDBBadge>
                    </h6>
                  );
                }
              },
            {
              field: "Actions", flex: 1,
              renderCell: (cellValues) => {
                return (
                    <div>
                        <MDBBtn onClick={() => { UpdateStatus(cellValues.row.email, UpdateStatusApprove(cellValues.row.statusText)) }} className="d-md-flex gap-2" rounded color="link">
                        {UpdateButtonApprove(cellValues.row.statusText)}
                        </MDBBtn>
                        <MDBBtn onClick={() => { UpdateStatus(cellValues.row.email, UpdateStatusReject(cellValues.row.statusText)) }} className="d-md-flex gap-2" rounded color='link'>
                        {UpdateButtonReject(cellValues.row.statusText)}
                        </MDBBtn>
                    </div>
                )
              }
            }
          ];

   return (
        <div style={{ height: 660, marginLeft:"auto", marginRight:"auto", minWidth:900, maxWidth:1800, padding:25 }}>
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
          pageSize={5}
          components={{ 
            Pagination: CustomPagination
            }}
            hideFooterRowCount={true}
            hideFooterSelectedRowCount={true}
        />
      </div>
   )
}

