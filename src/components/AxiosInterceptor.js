import axios from 'axios';
import {useEffect, useState} from 'react'
import { useNavigate } from 'react-router-dom'

export const API_URL='http://localhost:5000'

const API = axios.create({
    baseURL: API_URL,
    // Static headers
    headers: {
        'Content-Type': 'application/json',
    },
    transformRequest: [function (data, headers) {
        console.log("data:   =======================");
        console.log(data);
        // You may modify the headers object here
        headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`
        // Do not change data
        return JSON.stringify(data); // TODO how to remove stringify here
    }]
});

const AxiosInterceptor = ({ children }) => {
    const [isSet, setIsSet] = useState(false)

    const navigate = useNavigate();

    useEffect(() => {
        console.log("UseEffect worked ==================================")

        const resInterceptor = response => {
            console.log("res interceptor")
            return response;
        }

        const errInterceptor = error => {
            console.log("err interceptor")

            if (error.response.status === 401) {
                navigate('/login');
            }

            return Promise.reject(error);
        }

        const interceptor = API.interceptors.response.use(resInterceptor, errInterceptor);
        setIsSet(true);
        return () => API.interceptors.response.eject(interceptor);
    }, [navigate])

    return isSet && children;
}
export { AxiosInterceptor, API }