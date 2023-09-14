import React from 'react';
import {Route, Redirect, Navigate, useLocation} from 'react-router-dom';

const RouteGuard = ({ children }) => {

    let location = useLocation();
    function hasJWT() {
        let flag = false;

        //check user has JWT token
        localStorage.getItem("token") ? flag=true : flag=false

        return flag
    }

    if(!hasJWT())
        return <Navigate to="/login" state={{ from: location }} />;

    return children;
};

export default RouteGuard;