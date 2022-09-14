import { useState, useEffect } from 'react'
import { app } from '../components/utils/firebase'
import { collection, query, where, getDocs, getFirestore, doc, deleteDoc } from "firebase/firestore";
import { MDBBtn, MDBTable, MDBTableHead } from 'mdb-react-ui-kit';
import Requests from '../components/Requests';

export default function RequestsPage() {
    
    const [firstNameArray, setFirstNameArray] = useState([]);
    const [lastNameArray, setLastNameArray] = useState([]);
    const [emailArray, setEmailArray] = useState([]);
    const [roleArray, setRoleArray] = useState([]);
    const [statusPillArray, setStatusPillArray] = useState([]);
    const [statusTextArray, setStatusTextArray] = useState([]);

    const db = getFirestore(app);

    async function GetRequests() {
        try {
            const usersRef = collection(db, "users");

            const q = query(usersRef, where("status", "!=", "none"));
          
            var indexToDelete = 0;
            var counter = 0;
            const querySnapshot = await getDocs(q);
            const fNameArray = [];
            const lNameArray = [];
            const emailArray = [];
            const roleArray = [];
            const statusPillArray = [];
            const statusTextArray = [];

            querySnapshot.forEach(async (doc) => {
                fNameArray.push(doc.data().firstname);
                lNameArray.push(doc.data().lastname);
                emailArray.push(doc.data().email);
                roleArray.push(doc.data().role);
                if(doc.data().status === "Requested") {
                    statusPillArray.push("info");
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
                else if(doc.data().status === "Disabled") {
                    statusPillArray.push("warning");
                    statusTextArray.push("Disabled");
                }
                else if(doc.data().status === "Suspended") {
                    statusPillArray.push("secondary");
                    statusTextArray.push("Suspended");
                }
                else if(doc.data().status === "Deleted") {
                    indexToDelete = counter;
                }
                counter++;
            });
            setFirstNameArray(fNameArray);
            setLastNameArray(lNameArray);
            setEmailArray(emailArray);
            setRoleArray(roleArray);
            setStatusPillArray(statusPillArray);
            setStatusTextArray(statusTextArray);

            if(indexToDelete > 0)
            {
                await deleteDoc(doc(db, "users", emailArray[indexToDelete]))
            }
            
            
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
            <div className="container-fluid">
                <MDBBtn className="gap-2 d-flex mb-1 mt-3" onClick={GetRequests}>Refresh Requests</MDBBtn>
            </div>
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

