import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { MDBTabs, MDBTabsItem, MDBTabsLink, MDBTabsContent, MDBTabsPane } from "mdb-react-ui-kit";
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font, PDFViewer } from '@react-pdf/renderer';
import { Table, TableHeader, TableBody, TableCell, DataTableCell } from '@david.kucsai/react-pdf-table';
import ReactPDF from "@react-pdf/renderer";
import { Button } from "@mui/material";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";

export default function DocumentsPage() {
    const { StyledTooltip, db } = useAuth();
    const [justifyActive, setJustifyActive] = useState('Trial Balance');
    const [entryArray, setEntryArray] = useState([]);
    const [accountArray, setAccountArray] = useState([]);
    const [tableArray, setTableArray] = useState([]);
    const [startDate, setStartDate] = useState();
    const [endDate, setEndDate] = useState();

    const handleJustifyClick = (value) => {
        if (value === justifyActive)
            return;
        setJustifyActive(value);
    };

    function RenderTabs() {
        return <MDBTabs style={{ maxWidth: 1000, margin: "auto" }} justify className='d-flex flex-row justify-content-between'>
            {['Trial Balance', 'Income Statement', 'Balance Sheet', 'Retained Earnings Statement'].map((text) => (
                <MDBTabsItem key={text}>
                    <StyledTooltip title={`View ${text}`} placement='bottom' arrow>
                        <MDBTabsLink onClick={() => handleJustifyClick(text)} active={justifyActive === text}>
                            {text}
                        </MDBTabsLink>
                    </StyledTooltip>
                </MDBTabsItem>
            ))}
        </MDBTabs>
    }

    async function GetEntries() {
        const entriesRef = collection(db, "entries");

        const q = query(entriesRef, orderBy("timeStamp", "desc"), where("status", "==", "Approved", where("timeStamp", "<=", endDate)));

        const rowArray = [];

        console.log("got entries");

        const querySnapshot = await getDocs(q);

        var checkPending = false;

        querySnapshot.forEach(async (doc) => {
            if(doc.data().status === "Approved")
                rowArray.push({
                    name: doc.data().account,
                    balance: doc.data().balance,
                });
        });

        console.log(rowArray);
        setEntryArray(rowArray);
        GetRequests();
    }

    function filterEntries(accountName) {
        var balance = 0;
        entryArray.forEach((element, index) => {
            if(balance === 0) {
                if(element.name[index].name === accountName) {
                    // console.log("THIS ONE" + element.balance[index].amount)
                    balance = element.balance[index].amount;
                }  
            }
 
        })

        return balance;

    }

    async function GetRequests() {
        try {
            const accountsRef = collection(db, "accounts");

            const q = query(accountsRef, orderBy("accountNumber", "asc"));

            // eslint-disable-next-line no-unused-vars
            const querySnapshotExpiration = await getDocs(q);

            const rowsArray = [];


            const querySnapshot = await getDocs(q);

            querySnapshot.forEach(async (doc) => {
                const balance = filterEntries(doc.data().name);
                console.log(balance);
                rowsArray.push({
                    id: doc.id,
                    name: doc.data().name,
                    normalSide: doc.data().normalSide,
                    balance: balance,
                });
            });

            // setAccountArray(rowsArray);
            getTrialBalance(rowsArray);
        } catch (error) { }
    }

    async function getTrialBalance(rowsArray) {
        rowsArray.map((account) => {
            tableArray.push(
                {
                    accountNumber: account.id,
                    accountName: account.name,
                    type: account.normalSide,
                    debit: account.balance,
                    credit: "0.00",
                }
            )
            // entryArray.map((entry, index) => {
            //     if(account.name === entry.name[index].name)
            //     tableArray.push(
            //         {
            //             accountNumber: account.id,
            //             accountName: account.name,
            //             debit: "0.00",
            //             credit: "0.00",
            //         }
            //     )
            // })

        })

        console.log(tableArray);
        
    }

    useEffect(() => {
        
    }, [])
    

    const Quixote = () => (
        <Document>
            <Page style={styles.body}>
                <Text style={styles.header} fixed>
                    ~ Created with react-pdf ~
                </Text>
                {/* <Table data={[{firstName: "John", lastName: "Smith"}, {firstName: "John", lastName: "Smith"}]}> */}
                <Table data={tableArray}>
                    <TableHeader>
                        <TableCell>Account #</TableCell>
                        <TableCell>Account Name</TableCell>
                        <TableCell>Debit</TableCell>
                        <TableCell>Credit</TableCell>
                    </TableHeader>
                    <TableBody>
                        <DataTableCell getContent={(r) => r.accountNumber} />
                        <DataTableCell getContent={(r) => r.accountName} />
                        <DataTableCell getContent={(r) => r.debit} />
                        <DataTableCell getContent={(r) => r.type} />
                    </TableBody>
                </Table>
                <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
                    `${pageNumber} / ${totalPages}`
                )} fixed />
            </Page>
        </Document>
    );

    Font.register({
        family: 'Oswald',
        src: 'https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf'
    });

    const styles = StyleSheet.create({
        body: {
            paddingTop: 35,
            paddingBottom: 65,
            paddingHorizontal: 35,
        },
        title: {
            fontSize: 24,
            textAlign: 'center',
            fontFamily: 'Oswald'
        },
        author: {
            fontSize: 12,
            textAlign: 'center',
            marginBottom: 40,
        },
        subtitle: {
            fontSize: 18,
            margin: 12,
            fontFamily: 'Oswald'
        },
        text: {
            margin: 12,
            fontSize: 14,
            textAlign: 'justify',
            fontFamily: 'Times-Roman'
        },
        image: {
            marginVertical: 15,
            marginHorizontal: 100,
        },
        header: {
            fontSize: 12,
            marginBottom: 20,
            textAlign: 'center',
            color: 'grey',
        },
        pageNumber: {
            position: 'absolute',
            fontSize: 12,
            bottom: 30,
            left: 0,
            right: 0,
            textAlign: 'center',
            color: 'grey',
        },
    });

    return (
        <div>
            {RenderTabs()}
            <MDBTabsContent>
                <MDBTabsPane show={justifyActive === 'Trial Balance'}>
                    <div className="d-flex justify-content-center">
                        <Button onClick={() => {GetEntries()}}>Get Entries</Button>
                        <PDFViewer style={{
                            height: "85vh",
                            width: "75vw",
                            paddingLeft: 25,
                            paddingRight: 25,
                            paddingTop: 10
                        }}>
                            <Quixote />
                        </PDFViewer>
                    </div>

                </MDBTabsPane>
            </MDBTabsContent>
            <MDBTabsContent>
                <MDBTabsPane show={justifyActive === 'Income Statement'}>
                    <h1>Income Statement</h1>
                </MDBTabsPane>
            </MDBTabsContent>
            <MDBTabsContent>
                <MDBTabsPane show={justifyActive === 'Balance Sheet'}>
                    <h1>Balance Sheet</h1>
                </MDBTabsPane>
            </MDBTabsContent>
            <MDBTabsContent>
                <MDBTabsPane show={justifyActive === 'Retained Earnings Statement'}>
                    <h1>Retained Earnings Statement</h1>
                </MDBTabsPane>
            </MDBTabsContent>
        </div>
    )
}
