import { MDBBadge, MDBBtn, MDBTableBody } from 'mdb-react-ui-kit';
import { updateDoc, doc, getFirestore } from "firebase/firestore";
import { app } from './utils/firebase'


export default function Requests(props) {

    const db = getFirestore(app);

    async function UpdateStatus(email, status) {
        try{
            const userRef = doc(db, "users", email)

            await updateDoc(userRef, {
                status: status
            });
            await props.GetRequests();
        }
        catch (error) {
        }
    }

    function UpdateButtonApprove() {
        if(props.statusText === "Approved") {
            return "Suspend"
        }
        else if(props.statusText === "Requested") {
            return "Approve"
        }
        else if(props.statusText === "Suspended") {
            return "Resume"
        }
        else if(props.statusText === "Rejected" || props.statusText === "Disabled") {
            return "Approve"
        }
    }

    function UpdateStatusApprove() {
        if(props.statusText === "Approved") {
            return "Suspended"
        }
        else if(props.statusText === "Requested"  || props.statusText === "Suspended") {
            return "Approved"
        }
        else if(props.statusText === "Rejected" || props.statusText === "Disabled") {
            return "Approved"
        }
    }

    function UpdateButtonReject() {
        if(props.statusText === "Approved" || props.statusText === "Suspended") {
            return "Disable"
        }
        else if(props.statusText === "Requested") {
            return "Reject"
        }
        else if(props.statusText === "Rejected" || props.statusText === "Disabled") {
            return "Delete"
        }
    }

    function UpdateStatusReject() {
        if(props.statusText === "Approved" || props.statusText === "Suspended") {
            return "Disabled"
        }
        else if(props.statusText === "Requested") {
            return "Rejected"
        }
        else if(props.statusText === "Rejected" || props.statusText === "Disabled") {
            return "Deleted"
        }
    }

    return (
            <MDBTableBody>
                <tr>
                    <td>
                    <div className='d-flex align-items-center'>
                        <div className='ms-3'>
                        <p className='fw-bold mb-1'>{props.fName + " " + props.lName}</p>
                        <p className='text-muted mb-0'>{props.email}</p>
                        </div>
                    </div>
                    </td>
                    <td>
                    <MDBBadge color={props.statusPill} pill>
                        {props.statusText}
                    </MDBBadge>
                    </td>
                    <td>{props.role}</td>
                    <td>
                    <MDBBtn onClick={() => { UpdateStatus(props.email, UpdateStatusApprove()) }} color='link' rounded size='sm'>
                        {UpdateButtonApprove()}
                    </MDBBtn>
                    <MDBBtn onClick={() => { UpdateStatus(props.email, UpdateStatusReject()) }} color='link' rounded size='sm'>
                        {UpdateButtonReject()}
                    </MDBBtn>
                    </td>
                </tr>
            </MDBTableBody>
    )
}