import {useState} from "react";
import axios from "axios";

export function useAdmin() {
    const [admins, setAdmins] = useState([])
    const BASE_URL = "http://localhost:3000"

    async function fetchAdmins(user) {
        const response = await axios.post(`${BASE_URL}/admins`, user)
        setAdmins(prev => [...prev, response.data])
        return response.data
    }


    return{
        admins,
        fetchAdmins
    }
}

