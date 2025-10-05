import {useState} from "react";
import axios from "axios";

export function useAdmin() {
    const [admins, setAdmins] = useState([])
    const BASE_URL = "http://localhost:3001/"

    async function fetchAdmins() {
        const admins = await axios.get(`${BASE_URL}/admins`)
        setAdmins(admins.data)
    }
}

return{
    admins,
    fetchAdmins
}