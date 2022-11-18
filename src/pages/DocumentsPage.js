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
    const [incomeStateArray, setIncomeStateArray] = useState([]);
    const [retainedEarningsArray, setRetainedEarningsArray] = useState([]);
    const [balanceArray, setBalanceArray] = useState([]);
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
        // console.log(entries);
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
                    category: doc.data().category,
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

    async function getIncomeStatement(rowsArray) {
        const revArr = [];
        const expArr = [];
        const arr = [];
        console.log(rowsArray);
        rowsArray.map((account) => {
            if (account.category === "Revenue")
                revArr.push({
                    accountNumber: account.id,
                    accountName: account.name,
                    type: account.normalSide,
                    balance: account.balance,
                })
            else if (account.category === "Expenses")
                expArr.push({
                    accountNumber: account.id,
                    accountName: account.name,
                    type: account.normalSide,
                    balance: account.balance,
                })
        })
        var revBalance = 0;
        var expBalance = 0;
        revArr.forEach((element) => {
            revBalance += element.balance;
        })
        expArr.forEach((element) => {
            expBalance += element.balance;
        })
        arr.push({
            revenue: revArr,
            expenses: expArr,
            revTotal: revBalance,
            expTotal: expBalance,
            income: revBalance - expBalance,
        })
        console.log(arr)
        return arr;

    }

    async function getBalanceSheet(accounts) {
        var assetsArr = []
        var liabilitiesArr = []
        var balanceArr = [];
        var assetBalance = 0;
        var liabilitiesBalance = 0;

        accounts.forEach((element) => {
            if(element.category === "Assets" || element.category === "Expenses")
                assetsArr.push({
                    name: element.name,
                    balance: element.balance,
                })
            else if(element.category === "Liabilities" || element.category === "Revenue")
                liabilitiesArr.push({
                    name: element.name,
                    balance: element.balance,
                })
        })

        assetsArr.forEach((element) => {
            assetBalance += element.balance;
        })
        liabilitiesArr.forEach((element) => {
            liabilitiesBalance += element.balance;
        })
        
        balanceArr.push({
            assets: assetsArr,
            liabilities: liabilitiesArr,
            assetBalance: assetBalance,
            liabilitiesBalance: liabilitiesBalance,
        })

        return balanceArr;
    }

    async function populateTrialBalance() {
        setTableArray([])
        const entries = await GetEntries();
        const accounts = await GetRequests(entries);
        const trial = await getTrialBalance(accounts);
        console.log(trial);
        var creditBalance = 0;
        var debitBalance = 0;
        var arr = [];
        trial.forEach((element) => {
            if(element.type === "Debit")
                debitBalance += element.debit;
            else if(element.type === "Credit")
                creditBalance += element.credit;
        })
        arr.push({
            dataArray: trial,
            debitTotal: debitBalance,
            creditTotal: creditBalance,
        })
        setStartDate();
        setEndDate();
        setTableArray(arr);
    }

    async function populateIncomeStatement() {
        setIncomeStateArray([])
        const entries = await GetEntries();
        const accounts = await GetRequests(entries);
        const incomeState = await getIncomeStatement(accounts);
        setStartDate();
        setEndDate();
        setIncomeStateArray(incomeState);

    }
    
    async function populateBalanceSheet() {
        setBalanceArray([])
        const entries = await GetEntries();
        const accounts = await GetRequests(entries);
        const balanceSheet = await getBalanceSheet(accounts)
        setStartDate();
        setEndDate();
        setBalanceArray(balanceSheet);
    }

    async function populateRetainedEarnings() {
        setRetainedEarningsArray([])
        const entries = await GetEntries();
        const accounts = await GetRequests(entries);
        const incomeState = await getIncomeStatement(accounts);
        const balanceSheet = await getBalanceSheet(accounts);
        console.log(incomeState);
        console.log(balanceSheet);
        const startingRetained = balanceSheet[0].assetBalance - balanceSheet[0].liabilitiesBalance;
        const netProfit = incomeState[0].income;
        const dividends = 0;
        const finalRetained = startingRetained + netProfit - dividends;
        const arr = [];
        arr.push({
            start: startingRetained,
            profit: netProfit,
            dividends: dividends,
            final: finalRetained,
        })
        setStartDate();
        setEndDate();
        setRetainedEarningsArray(arr);
    }

    const TrialBalancePDF = () => (
        <Document title="Trial Balance">
            <Page style={styles.body}>
                <Text style={styles.header} fixed>
                    Trial Balance
                </Text>
                <Table data={tableArray[0].dataArray}>
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
                <Table data={tableArray}>
                    <TableHeader>
                        <TableCell>Total</TableCell>
                        <TableCell></TableCell>
                        <TableCell>{tableArray[0].debitTotal.toLocaleString('en-us', {
                            style: 'currency',
                            currency: 'USD'
                        })}</TableCell>
                        <TableCell>{tableArray[0].creditTotal.toLocaleString('en-us', {
                            style: 'currency',
                            currency: 'USD'
                        })}</TableCell>
                    </TableHeader>
                </Table>
                <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
                    `${pageNumber} / ${totalPages}`
                )} fixed />
            </Page>
        </Document>
    );

    const BalanceSheetPDF = () => (
        <Document title="Balance Sheet">
            <Page style={styles.body}>
                <Text style={styles.header} fixed>
                    Balance Sheet
                </Text>
                <Text style={styles.subtitle}>Assets</Text>
                <Table data={balanceArray}>
                    <TableHeader>
                        <TableCell>Account</TableCell>
                        <TableCell>Balance</TableCell>
                    </TableHeader>
                    <TableBody>
                        <DataTableCell  getContent={(r) => r.assets.map((element) => (<Text>{element.name}</Text>))} />
                        <DataTableCell  getContent={(r) => r.assets.map((element) => (<Text>{element.balance.toLocaleString('en-us', {
                            style: 'currency',
                            currency: 'USD'
                        })}</Text>))} />
                        {/* <DataTableCell getContent={(r) => r.balance.toLocaleString('en-us', {
                            style: 'currency',
                            currency: 'USD'
                        })} /> */}
                    </TableBody>
                </Table>
                <Table data={balanceArray}>
                    <TableHeader>
                        <TableCell>Total</TableCell>
                        <TableCell>{balanceArray[0].assetBalance.toLocaleString('en-us', {
                            style: 'currency',
                            currency: 'USD'
                        })}</TableCell>
                    </TableHeader>
                </Table>
                <Text style={styles.subtitle}>Liabilities</Text>
                <Table data={balanceArray}>
                    <TableHeader>
                        <TableCell>Account</TableCell>
                        <TableCell>Balance</TableCell>
                    </TableHeader>
                    <TableBody>
                        <DataTableCell  getContent={(r) => r.liabilities.map((element) => (<Text>{element.name}</Text>))} />
                        <DataTableCell  getContent={(r) => r.liabilities.map((element) => (<Text>{element.balance.toLocaleString('en-us', {
                            style: 'currency',
                            currency: 'USD'
                        })}</Text>))} />
                    </TableBody>
                </Table>
                <Table data={balanceArray}>
                    <TableHeader>
                        <TableCell>Total</TableCell>
                        <TableCell>{balanceArray[0].liabilitiesBalance.toLocaleString('en-us', {
                            style: 'currency',
                            currency: 'USD'
                        })}</TableCell>
                    </TableHeader>
                </Table>
                <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
                    `${pageNumber} / ${totalPages}`
                )} fixed />
            </Page>
        </Document>
    );

    const RetainedEarningsPDF = () => (
        <Document title="Retained Earnings Statement">
            <Page style={styles.body}>
                <Text style={styles.header} fixed>
                    Retained Earnings Statement
                </Text>
                <Table data={retainedEarningsArray}>
                    <TableHeader>
                        <TableCell>Starting Balance</TableCell>
                        <TableCell>Net Profit</TableCell>
                        <TableCell>Dividends Paid</TableCell>
                        <TableCell>Retained Earnings</TableCell>
                    </TableHeader>
                    <TableBody>
                        <DataTableCell getContent={(r) => r.start.toLocaleString('en-us', {
                            style: 'currency',
                            currency: 'USD'
                        })} />
                        <DataTableCell getContent={(r) => r.profit.toLocaleString('en-us', {
                            style: 'currency',
                            currency: 'USD'
                        })} />
                        <DataTableCell getContent={(r) => r.dividends.toLocaleString('en-us', {
                            style: 'currency',
                            currency: 'USD'
                        })} />
                        <DataTableCell getContent={(r) => r.final.toLocaleString('en-us', {
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


    const IncomeStatementPDF = () => (
        <Document title="Income Statement">
            <Page style={styles.body}>
                <Text style={styles.header} fixed>
                    Income Statement
                </Text>
                <Text style={styles.subtitle}>
                    Revenue
                </Text>
                <Table data={incomeStateArray}>
                    <TableHeader>
                        <TableCell>Account #</TableCell>
                        <TableCell>Account Name</TableCell>
                        <TableCell>Amount</TableCell>
                    </TableHeader>
                    <TableBody>
                        <DataTableCell getContent={(r) => r.revenue.map((element) => (<Text>{element.accountNumber}</Text>))} />
                        <DataTableCell getContent={(r) => r.revenue.map((element) => (<Text>{element.accountName}</Text>))} />
                        <DataTableCell getContent={(r) => r.revenue.map((element) => (<Text style={{textAlign: "right"}}>{parseFloat(element.balance).toLocaleString('en-us', {
                            style: 'currency',
                            currency: 'USD'
                        })}</Text>))} />
                    </TableBody>
                </Table>
                <Text>{" "}</Text>
                <Table>
                    <TableHeader>
                        <TableCell>Total</TableCell>
                        <TableCell></TableCell>
                        <TableCell style={{textAlign: "right"}}>
                            {parseFloat(incomeStateArray[0].revTotal).toLocaleString('en-us', {
                                style: 'currency',
                                currency: 'USD'
                            })}
                        </TableCell>
                    </TableHeader>
                </Table>
                <Text style={styles.subtitle}>
                    Expenses
                </Text>
                <Table data={incomeStateArray}>
                    <TableHeader>
                        <TableCell>Account #</TableCell>
                        <TableCell>Account Name</TableCell>
                        <TableCell>Amount</TableCell>
                    </TableHeader>
                    <TableBody>
                        <DataTableCell getContent={(r) => r.expenses.map((element) => (<Text>{element.accountNumber}</Text>))} />
                        <DataTableCell getContent={(r) => r.expenses.map((element) => (<Text>{element.accountName}</Text>))} />
                        <DataTableCell getContent={(r) => r.expenses.map((element) => (<Text style={{textAlign: "right"}}>{parseFloat(element.balance).toLocaleString('en-us', {
                            style: 'currency',
                            currency: 'USD'
                        })}</Text>))} />
                    </TableBody>
                </Table>
                <Text>{" "}</Text>
                <Table>
                    <TableHeader>
                        <TableCell>Total</TableCell>
                        <TableCell></TableCell>
                        <TableCell style={{textAlign: "right"}}>{parseFloat(incomeStateArray[0].expTotal).toLocaleString('en-us', {
                            style: 'currency',
                            currency: 'USD'
                        })}</TableCell>
                    </TableHeader>
                </Table>
                <Text style={styles.subtitle}>
                    Income
                </Text>
                <Table>
                    <TableHeader>
                        <TableCell>Net Income</TableCell>
                        <TableCell></TableCell>
                        <TableCell style={{textAlign: "right"}}>{parseFloat(incomeStateArray[0].income).toLocaleString('en-us', {
                            style: 'currency',
                            currency: 'USD'
                        })}</TableCell>
                    </TableHeader>
                </Table>
                <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
                    `${pageNumber} / ${totalPages}`
                )} fixed />
            </Page>
        </Document>
    );

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
                                <Card elevation={5} style={{ width: 400, margin: "auto" }} >
                                    <h6 className="d-flex justify-content-center" style={{ paddingTop: 25 }}>Select Date Range</h6>
                                    <div className="d-flex justify-content-center" style={{ paddingBottom: 10 }}>
                                        <TextField onChange={(event) => setStartDate(new Date(event.target.value))} style={{ paddingRight: 5 }} size="small" type={"date"} helperText="Start Date"></TextField>
                                        <TextField onChange={(event) => setEndDate(new Date(event.target.value))} style={{ paddingLeft: 5 }} size="small" type={"date"} helperText="End Date"></TextField>
                                    </div>
                                    <div style={{ marginTop: 25, padding: 25 }} className="d-flex justify-content-center">
                                        <Button variant="contained" style={{ backgroundColor: "rgba(41,121,255,1)" }} onClick={() => { populateTrialBalance() }}>Generate Trial Balance</Button>
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
                    {
                        incomeStateArray.length !== 0 ?
                            <div className="d-flex justify-content-center">
                                <Button onClick={() => { setIncomeStateArray([]); setStartDate(); setEndDate(); }}>Finish</Button>
                            </div> :
                            <div style={{ marginTop: 50 }}>
                                <Card elevation={5} style={{ width: 400, margin: "auto" }} >
                                    <h6 className="d-flex justify-content-center" style={{ paddingTop: 25 }}>Select Date Range</h6>
                                    <div className="d-flex justify-content-center" style={{ paddingBottom: 10 }}>
                                        <TextField onChange={(event) => setStartDate(new Date(event.target.value))} style={{ paddingRight: 5 }} size="small" type={"date"} helperText="Start Date"></TextField>
                                        <TextField onChange={(event) => setEndDate(new Date(event.target.value))} style={{ paddingLeft: 5 }} size="small" type={"date"} helperText="End Date"></TextField>
                                    </div>
                                    <div style={{ marginTop: 25, padding: 25 }} className="d-flex justify-content-center">
                                        <Button variant="contained" style={{ backgroundColor: "rgba(41,121,255,1)" }} onClick={() => { populateIncomeStatement() }}>Generate Income Statement</Button>
                                    </div>
                                </Card>
                            </div>
                    }

                    {incomeStateArray.length === 0 ? null :
                        <div className="d-flex justify-content-center">
                            <Card elevation={5} >
                                <PDFViewer style={{
                                    height: "80vh",
                                    width: "75vw",
                                    padding: 10
                                }}>
                                    <IncomeStatementPDF />
                                </PDFViewer>
                            </Card>

                        </div>
                    }
                </MDBTabsPane>
            </MDBTabsContent>
            <MDBTabsContent>
                <MDBTabsPane show={justifyActive === 'Balance Sheet'}>
                    {
                        balanceArray.length !== 0 ?
                            <div className="d-flex justify-content-center">
                                <Button onClick={() => { setBalanceArray([]); setStartDate(); setEndDate(); }}>Finish</Button>
                            </div> :
                            <div style={{ marginTop: 50 }}>
                                <Card elevation={5} style={{ width: 400, margin: "auto" }} >
                                    <h6 className="d-flex justify-content-center" style={{ paddingTop: 25 }}>Select Date Range</h6>
                                    <div className="d-flex justify-content-center" style={{ paddingBottom: 10 }}>
                                        <TextField onChange={(event) => setStartDate(new Date(event.target.value))} style={{ paddingRight: 5 }} size="small" type={"date"} helperText="Start Date"></TextField>
                                        <TextField onChange={(event) => setEndDate(new Date(event.target.value))} style={{ paddingLeft: 5 }} size="small" type={"date"} helperText="End Date"></TextField>
                                    </div>
                                    <div style={{ marginTop: 25, padding: 25 }} className="d-flex justify-content-center">
                                        <Button variant="contained" style={{ backgroundColor: "rgba(41,121,255,1)" }} onClick={() => { populateBalanceSheet() }}>Generate Balance Sheet</Button>
                                    </div>
                                </Card>
                            </div>
                    }

                    {balanceArray.length === 0 ? null :
                        <div className="d-flex justify-content-center">
                            <Card elevation={5} >
                                <PDFViewer style={{
                                    height: "80vh",
                                    width: "75vw",
                                    padding: 10
                                }}>
                                    <BalanceSheetPDF />
                                </PDFViewer>
                            </Card>

                        </div>
                    }
                </MDBTabsPane>
            </MDBTabsContent>
            <MDBTabsContent>
                <MDBTabsPane show={justifyActive === 'Retained Earnings Statement'}>
                    {
                        retainedEarningsArray.length !== 0 ?
                            <div className="d-flex justify-content-center">
                                <Button onClick={() => { setRetainedEarningsArray([]); setStartDate(); setEndDate(); }}>Finish</Button>
                            </div> :
                            <div style={{ marginTop: 50 }}>
                                <Card elevation={5} style={{ width: 400, margin: "auto" }} >
                                    <h6 className="d-flex justify-content-center" style={{ paddingTop: 25 }}>Select Date Range</h6>
                                    <div className="d-flex justify-content-center" style={{ paddingBottom: 10 }}>
                                        <TextField onChange={(event) => setStartDate(new Date(event.target.value))} style={{ paddingRight: 5 }} size="small" type={"date"} helperText="Start Date"></TextField>
                                        <TextField onChange={(event) => setEndDate(new Date(event.target.value))} style={{ paddingLeft: 5 }} size="small" type={"date"} helperText="End Date"></TextField>
                                    </div>
                                    <div style={{ marginTop: 25, padding: 25 }} className="d-flex justify-content-center">
                                        <Button variant="contained" style={{ backgroundColor: "rgba(41,121,255,1)" }} onClick={() => { populateRetainedEarnings() }}>Generate Income Statement</Button>
                                    </div>
                                </Card>
                            </div>
                    }

                    {retainedEarningsArray.length === 0 ? null :
                        <div className="d-flex justify-content-center">
                            <Card elevation={5} >
                                <PDFViewer style={{
                                    height: "80vh",
                                    width: "75vw",
                                    padding: 10
                                }}>
                                    <RetainedEarningsPDF/>
                                </PDFViewer>
                            </Card>

                        </div>
                    }
                </MDBTabsPane>
            </MDBTabsContent>
        </div>
    )
}
