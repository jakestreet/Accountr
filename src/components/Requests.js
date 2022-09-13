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
                    <MDBBtn onClick={() => { UpdateStatus(props.email, "Approved") }} color='link' rounded size='sm'>
                        Approve
                    </MDBBtn>
                    <MDBBtn onClick={() => { UpdateStatus(props.email, "Rejected") }} color='link' rounded size='sm'>
                        Reject
                    </MDBBtn>
                    </td>
                </tr>
            </MDBTableBody>
    )
}