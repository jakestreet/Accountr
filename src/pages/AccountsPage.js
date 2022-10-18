import { useState, useEffect, useRef } from 'react'
import { app } from '../components/utils/firebase'
import { collection, query, where, getDocs, getFirestore, doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import bcrypt from 'bcryptjs'
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MDBBadge, MDBBtn, MDBTextArea, MDBCardText } from 'mdb-react-ui-kit';
import { Alert } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import CloseIcon from '@mui/icons-material/Close'
import {
    DataGrid,
    gridPageCountSelector,
    gridPageSelector,
    useGridApiContext,
    useGridSelector,
  } from '@mui/x-data-grid';
import Pagination from '@mui/material/Pagination';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { MDBInput } from 'mdb-react-ui-kit';
import PasswordChecklist from "react-password-checklist"

export default function accountsPage() {

    return(
        <div>
            <h1 className="text-center mt-3">Accounts</h1>
        </div> 
    )
}