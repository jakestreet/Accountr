import { useState, useEffect } from 'react'
import { app } from './utils/firebase'
import { getFirestore } from "firebase/firestore";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import { MDBBadge, MDBBtn, MDBTable, MDBTableHead, MDBTableBody } from 'mdb-react-ui-kit';

export default function RequestsPage() {
    const navigate = useNavigate();

    const [firstNameArray, setFirstNameArray] = useState([]);
    const [lastNameArray, setLastNameArray] = useState([]);
    const [emailArray, setEmailArray] = useState([]);
    const [roleArray, setRoleArray] = useState([]);
    const [statusPillArray, setStatusPillArray] = useState([]);
    const [statusTextArray, setStatusTextArray] = useState([]);

    const db = getFirestore(app);

    const ReturnHome = (e)=>{
        e.preventDefault();
        navigate("/home");
    }

    const GetRequests = async (e)=>{
        try {
          const usersRef = collection(db, "users");

          const q = query(usersRef, where("status", "!=", "none"));
          
          const querySnapshot = await getDocs(q);
          const fNameArray = [];
          const lNameArray = [];
          const emailArray = [];
          const roleArray = [];
          const statusPillArray = [];
          const statusTextArray = [];

          querySnapshot.forEach((doc) => {
            fNameArray.push(doc.data().firstname);
            lNameArray.push(doc.data().lastname);
            emailArray.push(doc.data().email);
            roleArray.push(doc.data().role);
            if(doc.data().status === "request") {
                statusPillArray.push("warning");
                statusTextArray.push("Requested Access");
            }
            else if(doc.data().status === "approved") {
                statusPillArray.push("success");
                statusTextArray.push("Request Accepted");
            }
            else if(doc.data().status === "rejected") {
                statusPillArray.push("danger");
                statusTextArray.push("Request Rejected");
            }
          });
          setFirstNameArray(fNameArray);
          setLastNameArray(lNameArray);
          setEmailArray(emailArray);
          setRoleArray(roleArray);
          setStatusPillArray(statusPillArray);
          setStatusTextArray(statusTextArray);
          
          } catch (error) {
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

    useEffect(() => {
        let ignore = false;
        
        if (!ignore)  GetRequests()
        return () => { ignore = true; }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        },[]);

    return (
        <div>
            <MDBBtn className="mb-4" onClick={ReturnHome}>Return to Home Page</MDBBtn>
            <MDBBtn className="mb-4" onClick={GetRequests}>Refresh Requests</MDBBtn>
            <MDBTable align='middle'>
            <MDBTableHead>
            <tr>
                <th scope='col'>Name</th>
                <th scope='col'>Status</th>
                <th scope='col'>Position</th>
                <th scope='col'>Actions</th>
            </tr>
            </MDBTableHead>
            <MDBTableBody>
            <tr>
                <td>
                <div className='d-flex align-items-center'>
                    <div className='ms-3'>
                    <p className='fw-bold mb-1'>{firstNameArray[0] + " " + lastNameArray[0]}</p>
                    <p className='text-muted mb-0'>{emailArray[0]}</p>
                    </div>
                </div>
                </td>
                <td>
                <MDBBadge color={statusPillArray[0]} pill>
                    {statusTextArray[0]}
                </MDBBadge>
                </td>
                <td>{roleArray[0]}</td>
                <td>
                <MDBBtn onClick={() => { UpdateStatus(emailArray[0], "approved") }} color='link' rounded size='sm'>
                    Accept
                </MDBBtn>
                <MDBBtn onClick={() => { UpdateStatus(emailArray[0], "rejected") }} color='link' rounded size='sm'>
                    Reject
                </MDBBtn>
                </td>
            </tr>
            <tr>
                <td>
                <div className='d-flex align-items-center'>
                    <div className='ms-3'>
                    <p className='fw-bold mb-1'>{firstNameArray[1] + " " + lastNameArray[1]}</p>
                    <p className='text-muted mb-0'>{emailArray[1]}</p>
                    </div>
                </div>
                </td>
                <td>
                <MDBBadge color={statusPillArray[1]} pill>
                    {statusTextArray[1]}
                </MDBBadge>
                </td>
                <td>{roleArray[1]}</td>
                <td>
                <MDBBtn onClick={() => { UpdateStatus(emailArray[1], "approved") }} color='link' rounded size='sm'>
                    Accept
                </MDBBtn>
                <MDBBtn onClick={() => { UpdateStatus(emailArray[1], "rejected") }} color='link' rounded size='sm'>
                    Reject
                </MDBBtn>
                </td>
            </tr>
            <tr>
                <td>
                <div className='d-flex align-items-center'>
                    <div className='ms-3'>
                    <p className='fw-bold mb-1'>{firstNameArray[2] + " " + lastNameArray[2]}</p>
                    <p className='text-muted mb-0'>{emailArray[2]}</p>
                    </div>
                </div>
                </td>
                <td>
                <MDBBadge color={statusPillArray[2]} pill>
                    {statusTextArray[2]}
                </MDBBadge>
                </td>
                <td>{roleArray[2]}</td>
                <td>
                <MDBBtn onClick={() => { UpdateStatus(emailArray[2], "approved") }} color='link' rounded size='sm'>
                    Accept
                </MDBBtn>
                <MDBBtn onClick={() => { UpdateStatus(emailArray[2], "rejected") }} color='link' rounded size='sm'>
                    Reject
                </MDBBtn>
                </td>
            </tr>
            </MDBTableBody>
        </MDBTable>
      </div>
    )
    
}