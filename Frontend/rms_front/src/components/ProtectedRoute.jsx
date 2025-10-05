import React from "react";
import { Route, Navigate } from "react-router-dom";


export default function ProtectedRoute({ element: Component, isAuthenticated, ...rest }) {
    if (isAuthenticated) {
        return Component
    }
    else{
        return <Navigate to="/" replace />
    }
}
