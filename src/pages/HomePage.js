import { Card, Chip, CircularProgress, Typography } from '@mui/material';
import { PieChart } from 'react-minimal-pie-chart';
import { app } from "../components/utils/firebase";
import { useState, useEffect, useRef } from "react";
import {
    collection,
    query,
    getDocs,
    getFirestore,
    doc,
    setDoc,
    updateDoc,
    where,
    deleteDoc,
    orderBy
} from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import DocumentsPage from './DocumentsPage';

export default function HomePage() {
    const { db, pendingEntries, passExpirationDays, pendingUsers, currentRole } = useAuth();
    const [dataArray, setDataArray] = useState([])
    const [ratioArray, setRatioArray] = useState([])

    useEffect(() => {
        async function fetchData() {
            const data = await getRatioData();
            setDataArray(data);
        }
        fetchData();
    }, [])


    const [selected, setSelected] = useState();
    const [hovered, setHovered] = useState();

    async function getRatioData() {
        try {
            // setLoading(true);
            const accountsRef = collection(db, "accounts");

            const q = query(accountsRef);

            var dataArray = [];

            const querySnapshot = await getDocs(q);

            var assetBalance = 0;
            var liabilitiesBalance = 0;
            var netSalesBalance = 0;
            var netIncome = 0;

            querySnapshot.forEach(async (doc) => {
                if (doc.data().category === "Assets")
                    assetBalance += doc.data().balance
                else if (doc.data().category === "Liabilities")
                    liabilitiesBalance += doc.data().balance
                else if (doc.data().name === "Net Sales") {
                    netSalesBalance += doc.data().balance
                    netIncome += doc.data().balance
                }
                else if (doc.data().category === "Revenue")
                    netIncome += doc.data().balance
                else if (doc.data().category === "Expenses")
                    netIncome -= doc.data().balance
            });



            dataArray.push({
                type: "Liquidity",
                title: "Current Ratio",
                green: 3,
                yellow: 1,
                red: 0,
                first: {
                    category: "Assets",
                    ratio: assetBalance,
                    color: "rgba(41,121,255,1)"
                },
                second: {
                    category: "Liabilities",
                    ratio: liabilitiesBalance,
                    color: '#8B8B8B'
                }
            })

            dataArray.push({
                type: "Leverage",
                title: "Debt Ratio",
                green: 0,
                yellow: 1,
                red: 2,
                first: {
                    category: "Liabilities",
                    ratio: liabilitiesBalance,
                    color: '#8B8B8B'
                },
                second: {
                    category: "Assets",
                    ratio: assetBalance,
                    color: "rgba(41,121,255,1)"
                }
            })

            dataArray.push({
                type: "Efficiency",
                title: "Asset Turnover Ratio",
                green: 1.1,
                yellow: .5,
                red: 0,
                first: {
                    category: "Net Sales",
                    ratio: netSalesBalance,
                    color: '#8B8B8B'
                },
                second: {
                    category: "Assets",
                    ratio: assetBalance,
                    color: "rgba(41,121,255,1)"
                }
            })

            dataArray.push({
                type: "Profitability",
                title: "Return on Assets Ratio",
                green: 0.20,
                yellow: 0.06,
                red: 0.05,
                first: {
                    category: "Net Income",
                    ratio: netIncome,
                    color: '#8B8B8B'
                },
                second: {
                    category: "Assets",
                    ratio: assetBalance,
                    color: "rgba(41,121,255,1)"
                }
            })

            console.log(netIncome);
            console.log(assetBalance);

            return dataArray;
        } catch (error) { }
    }

    function generateColor(data) {
        var ratio = (data.first.ratio / data.second.ratio).toFixed(2);
        var color;
        if (ratio >= data.green)
            color = "#50C878"
        else if (ratio >= data.yellow) {
            color = "#ffe302"
            // setRatioArray(oldArray => [...oldArray, {
            //     name: data.title,
            //     color: "yellow"
            // }])
        }
        else if (ratio >= data.red) {
            color = "error"
            // setRatioArray(oldArray => [...oldArray, {
            //     name: data.title,
            //     color: "red"
            // }])
        }

        return <Chip style={{ backgroundColor: color }} label={ratio} />
    }

    function createPieChart() {
        console.log(dataArray);
        console.log("PENDING USERS: " + pendingUsers);
        var color;
        return dataArray.map((data) => (
            dataArray != null ? <Card elevation={3} key={data.title}>
                <div>
                    <Typography style={{ textAlign: "center", paddingTop: 10 }}>{data.type}</Typography>
                    <Typography style={{ textAlign: "center", paddingTop: 10 }}>{data.title}</Typography>
                    <Typography style={{ textAlign: "center" }}>{generateColor(data)}</Typography>
                    <PieChart style={{ paddingBottom: 25, paddingLeft: 30, paddingRight: 25, paddingTop: 5 }}
                        data={[
                            { title: data.first.category, value: data.first.ratio, color: data.first.color },
                            { title: data.second.category, value: data.second.ratio, color: data.second.color },
                        ]}
                        radius={50}
                        label={({ dataEntry }) => `${dataEntry.title} ${Math.round(dataEntry.percentage) + '%'}`}
                        labelStyle={() => ({
                            fill: "#FFFFFF",
                            fontSize: '7px',
                            fontFamily: 'sans-serif',
                        })}
                        labelPosition={60}
                    />
                </div>
            </Card> : <CircularProgress />
        ))


    }

    function getPendingJournalEntryNotification() {
        if (pendingEntries && currentRole === "Manager") {
            return (
                <div>
                    You have pending journal entries.
                </div>
            )
        }
    }

    function getPendingUserNotification() {
        if (pendingUsers && currentRole === "Admin") {
            return (
                <div>
                    You have pending users.
                </div>
            )
        }
    }

    function getRationNotification(data) {
        var ratio = (data.first.ratio / data.second.ratio).toFixed(2);
        if (ratio >= data.green)
            console.log("")
        else if (ratio >= data.yellow) {
            console.log("warning")
            return (
                <div>
                    Warning
                </div>
            )
        }
        else if (ratio >= data.red) {
            console.log("red")
            return (
                <div>
                    Bad
                </div>
            )
        }
    }

    

function getPasswordExpirationNotification() {
    if (passExpirationDays <= 3) {
        return (
            <div>
                Password Expires in {passExpirationDays} days
            </div>
        )
    }
}

function displayRatioNotification() {
    return dataArray.map((data => (
        dataArray.length > 0 ? getRationNotification(data) : null
    )))
}

return (
    <div>
        <div style={{ marginBottom: 50, marginTop: 25 }}>
            <Card elevation={5} style={{ padding: 25, maxWidth: 1600, height: 300, margin: "auto", }}>
                <Typography>General Notifications</Typography>
                {getPendingJournalEntryNotification()}
                {getPendingUserNotification()}
                {displayRatioNotification()}
                {getPasswordExpirationNotification()}
            </Card>
        </div>

        <Card elevation={5} style={{ padding: 25, maxWidth: 1600, margin: "auto", }}>
            <Typography>Financial Ratios</Typography>
            <div style={{ padding: 25, maxWidth: 1200, margin: "auto", display: "flex", gap: 50 }}>
                {createPieChart()}
            </div>

        </Card>
    </div>
)
}
