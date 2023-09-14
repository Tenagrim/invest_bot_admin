import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';
import {BrowserRouter, Navigate, Route, Router, Routes} from "react-router-dom";
import {history} from "./components/heplers/history";
import {AuthPage} from "./components/pages/Auth";
import RouteGuard from "./components/RouteGuard";
import Home from "./components/pages/Home";
import {AxiosInterceptor} from "./components/AxiosInterceptor";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        {/*<Home />*/}


        <BrowserRouter history={history}>
            <AxiosInterceptor>
                <Routes>
                    <Route path='/' element={<Navigate to="/home"/>}/>
                    <Route
                        exact
                        path="/home"
                        element={
                            <RouteGuard>
                                <Home/>
                            </RouteGuard>}
                    />
                    <Route
                        path="/login"
                        element={<AuthPage/>}
                    />
                </Routes>
            </AxiosInterceptor>
        </BrowserRouter>

    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
