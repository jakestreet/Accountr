import { useState, useEffect } from 'react'
import { app } from '../components/utils/firebase'
import { collection, query, where, getDocs, getFirestore } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import { MDBBtn, MDBTable, MDBTableHead } from 'mdb-react-ui-kit';
import Requests from '../components/Requests';

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

    async function GetRequests() {
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
            if(doc.data().status === "Request") {
                statusPillArray.push("warning");
                statusTextArray.push("Requested");
            }
            else if(doc.data().status === "Approved") {
                statusPillArray.push("success");
                statusTextArray.push("Approved");
            }
            else if(doc.data().status === "Rejected") {
                statusPillArray.push("danger");
                statusTextArray.push("Rejected");
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

    useEffect(() => {
        let ignore = false;
        
        if (!ignore)  GetRequests()
        return () => { ignore = true; }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        },[]);

        const PopulateRequests = (e)=>{
            const requestArray = [];

            for(var i = 0; i <= emailArray.length - 1; i++)
            {
                requestArray.push(<Requests
                    fName={firstNameArray[i]}
                    lName={lastNameArray[i]}
                    email={emailArray[i]}
                    role={roleArray[i]}
                    statusPill={statusPillArray[i]}
                    statusText={statusTextArray[i]}
                    GetRequests={GetRequests}
                />)
            }

            return requestArray;
        }

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
                {PopulateRequests()}
            </MDBTable>
    </div>
   )
    
}

