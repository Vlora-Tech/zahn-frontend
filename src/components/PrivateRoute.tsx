// src/PrivateRoute.js
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useGetCurrentUserInformation } from "../api/auth/hooks";
import { GetCurrentUserResponse } from "../api/auth/types";

export type Role = "superadmin" | "doctor" | "nurse" | "staff" | "lab_technician";

interface PrivateRouteProps {
    children: React.ReactNode
    roles?: Role[]
    user?: GetCurrentUserResponse | null;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
    children,
    roles,
    user,
}) => {
    const { data: currentUser, isLoading } = useGetCurrentUserInformation({
        enabled: !user,
    });

    const activeUser = user || currentUser;

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!activeUser) {
        return <Navigate to="/login" replace />;
    }

    if (roles && !roles.includes(activeUser.role as Role)) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

export default PrivateRoute;



// // src/PrivateRoute.tsx
// import React from 'react';
// import { Navigate, Outlet } from 'react-router-dom';
// import { GetCurrentUserInformationResponse, Role } from '../api/auth/requests';

// interface PrivateRouteProps {
//   roles?: Role[];
//   user?: GetCurrentUserInformationResponse;
//   redirectTo?: string;
// }

// const PrivateRoute: React.FC<PrivateRouteProps> = ({
//   roles,
//   user,
//   redirectTo = '/',
// }) => {
//   const accessToken = localStorage.getItem('accessToken');

//   if (!user || !accessToken) {
//     return <Navigate to="/login" />;
//   }

//   const isAuthorized = roles?.includes(user.role) ?? true;

//   return isAuthorized ? <Outlet /> : <Navigate to={redirectTo} />;
// };

// export default PrivateRoute;

