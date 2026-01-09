
import { RouteObject } from 'react-router-dom';
import PatientDashboard from '../../../pages/PatientDashboard';

export const requestsRoutes: RouteObject[] = [
    {
        path: '/requests/create',
        element: <PatientDashboard />,
    },
]