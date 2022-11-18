import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { MDBTabs, MDBTabsItem, MDBTabsLink, MDBTabsContent, MDBTabsPane } from "mdb-react-ui-kit";
import React from 'react';
import { Page, Text, Document, StyleSheet, Font, PDFViewer } from '@react-pdf/renderer';
import { Table, TableHeader, TableBody, TableCell, DataTableCell } from '@david.kucsai/react-pdf-table';
import { Button, Card, Divider, TextField } from "@mui/material";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";

export default function DocumentsPage() {
    const { StyledTooltip, db } = useAuth();
    const [justifyActive, setJustifyActive] = useState('Trial Balance');
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

        const q = query(entriesRef, orderBy("timeStamp", "desc"), where("status", "==", "Approved"), where("timeStamp", ">=", startDate), where("timeStamp", "<=", endDate));

        const rowArray = [];

        const querySnapshot = await getDocs(q);

        querySnapshot.forEach(async (doc) => {
            rowArray.push({
                name: doc.data().account,
                balance: doc.data().balance,
            });
        });
        return rowArray;
    }

    async function filterEntries(accountName, entries) {
        var balance = 0;
        console.log(entries);
        entries.forEach((element) => {
            if (balance === 0) {
                element.name.forEach((elem, index) => {
                    if (elem.name === accountName) {
                        balance = element.balance[index].amount;
                        console.log(balance);
                    }
                })
            }
        })
        return balance;
    }

    async function GetRequests(entries) {
        try {
            const accountsRef = collection(db, "accounts");

            const q = query(accountsRef, orderBy("accountNumber", "asc"));

            // eslint-disable-next-line no-unused-vars
            const querySnapshotExpiration = await getDocs(q);

            const rowsArray = [];

            const querySnapshot = await getDocs(q);

            querySnapshot.forEach(async (doc) => {
                const balance = await filterEntries(doc.data().name, entries)
                rowsArray.push({
                    id: doc.id,
                    name: doc.data().name,
                    normalSide: doc.data().normalSide,
                    balance: balance === 0 ? doc.data().balance : balance,
                });
            });
            return rowsArray;
        } catch (error) { }
    }

    async function getTrialBalance(rowsArray) {
        const arr = []
        rowsArray.map((account) => {
            var debit = "";
            var credit = "";
            if (account.normalSide === "Debit")
                debit = account.balance;
            else
                credit = account.balance;
            arr.push(
                {
                    accountNumber: account.id,
                    accountName: account.name,
                    type: account.normalSide,
                    debit: debit,
                    credit: credit,
                }
            )
        })
        return arr;
    }

    async function populateTrialBalance() {
        setTableArray([])
        const entries = await GetEntries();
        const accounts = await GetRequests(entries);
        const trial = await getTrialBalance(accounts)
        setTableArray(trial);
    }


    const TrialBalancePDF = () => (
        <Document title="Trial Balance">
            <Page style={styles.body}>
                <Text style={styles.header} fixed>
                    Trial Balance
                </Text>
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
                        <DataTableCell style={{ textAlign: "right" }} getContent={(r) => r.debit === "" ? "" : parseFloat(r.debit).toLocaleString('en-us', {
                            style: 'currency',
                            currency: 'USD'
                        })} />
                        <DataTableCell style={{ textAlign: "right" }} getContent={(r) => r.credit === "" ? "" : parseFloat(r.credit).toLocaleString('en-us', {
                            style: 'currency',
                            currency: 'USD'
                        })} />
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
                    {
                        tableArray.length !== 0 ?
                            <div className="d-flex justify-content-center">
                                <Button onClick={() => { setTableArray([]); setStartDate(); setEndDate(); }}>Finish</Button>
                            </div> :
                            <div style={{ marginTop: 50 }}>
                                <Card elevation={5} style={{width:400, margin: "auto"}} >
                                    <h6 className="d-flex justify-content-center" style={{paddingTop:25}}>Select Date Range</h6>
                                    <div className="d-flex justify-content-center" style={{paddingBottom:10}}>
                                        <TextField onChange={(event) => setStartDate(new Date(event.target.value))} style={{ paddingRight: 5 }} size="small" type={"date"} helperText="Start Date"></TextField>
                                        <TextField onChange={(event) => setEndDate(new Date(event.target.value))} style={{ paddingLeft: 5 }} size="small" type={"date"} helperText="End Date"></TextField>
                                    </div>
                                    <div style={{ marginTop: 25, padding:25 }} className="d-flex justify-content-center">
                                        <Button variant="contained" style={{backgroundColor: "rgba(41,121,255,1)"}} onClick={() => { populateTrialBalance() }}>Generate Trial Balance</Button>
                                    </div>
                                </Card>
                            </div>
                    }

                    {tableArray.length === 0 ? null :
                        <div className="d-flex justify-content-center">
                            <Card elevation={5} >
                                <PDFViewer style={{
                                    height: "80vh",
                                    width: "75vw",
                                    padding: 10
                                }}>
                                    <TrialBalancePDF />
                                </PDFViewer>
                            </Card>

                        </div>
                    }
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
