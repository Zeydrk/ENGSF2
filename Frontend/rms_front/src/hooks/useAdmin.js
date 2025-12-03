import {useState} from "react";
import axios from "axios";

export function useAdmin() {
    const [admins, setAdmins] = useState([])
    const BASE_URL = "http://localhost:3000"

    async function fetchAdmins(user) {
        const response = await axios.post(`${BASE_URL}/admins/login`, user)
        setAdmins(prev => [...prev, response.data])
        return response
    }


    async function createAdmin(user) {
        const response = await axios.post(`${BASE_URL}/admins/`, user)
        setAdmins(prev => [...prev, response.data])
        return response
    }
    async function forgotPassword(email) {
        const response = await axios.post(`${BASE_URL}/admins/forgot-password`, email);
        setAdmins(response.data)
        return response.data

    }

    async function resetPassword(password,token) {
        const response = await axios.post(`${BASE_URL}/admins/reset-password`, {password, token});
        setAdmins(response.data)
        return response.data

    }


    return{
        admins,
        fetchAdmins,
        createAdmin,
        forgotPassword,
        resetPassword,
    }
}

