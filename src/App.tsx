import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import Layout from "./components/Layout";

import PatientDashboard from "./pages/PatientDashboard";
import Patients from "./pages/Patients";
import Login from "./pages/Login";
import { CssBaseline } from "@mui/material";
import Clinics from "./pages/Clinics";
import Users from "./pages/Users";
import Doctors from "./pages/Doctors";
import CreateUser from "./pages/Users/CreateUser";
import { useGetCurrentUserInformation } from "./api/auth/hooks";
import CreateClinic from "./pages/Clinics/CreateClinic";
import ClinicDetails from "./pages/Clinics/ClinicDetails";
import CreateDoctor from "./pages/Doctors/CreateDoctor";
import DoctorDetails from "./pages/Doctors/DoctorDetails";
import UserDetails from "./pages/Users/UserDetails";
import CreatePatient from "./pages/Patients/CreatePatient";
import Requests from "./pages/Requests";
import { SnackbarProvider } from "./context/SnackbarContext";
import PatientDashboardPreview from "./pages/PatientDashboardPreview";
import RequestDetails from "./pages/Requests/RequestDetails";
import AdminDashboard from "./pages/Admin";
import OperationsManagement from "./pages/Admin/OperationsManagement";
import MaterialsManagement from "./pages/Admin/MaterialsManagement";
import OptionsManagement from "./pages/Admin/OptionsManagement";
import CategoriesManagement from "./pages/Admin/CategoriesManagement";
import EditPatient from "./pages/Patients/EditPatient";
import EditDoctor from "./pages/Doctors/EditDoctor";
import EditClinic from "./pages/Clinics/EditClinic";
import EditUser from "./pages/Users/EditUser";

function App() {
  const { pathname } = useLocation();

  useGetCurrentUserInformation({
    enabled: pathname !== "/login",
  });

  return (
    <SnackbarProvider>
      <CssBaseline />
      <Layout>
        <Routes>
          <Route path="/" element={<Patients />} />
          <Route path="/login" element={<Login />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/patients/create" element={<CreatePatient />} />
          <Route path="/patients/:id" element={<PatientDashboardPreview />} />
          <Route path="/patients/edit/:id" element={<EditPatient />} />
          <Route
            path="/patients/:id/requests/create"
            element={<PatientDashboard />}
          />
          <Route
            path="/patients/:id/requests/edit/:requestId"
            element={<PatientDashboard />}
          />
          <Route path="/requests" element={<Requests />} />
          <Route path="/requests/:id" element={<RequestDetails />} />

          <Route path="/clinics" element={<Clinics />} />
          <Route path="/clinics/create" element={<CreateClinic />} />
          <Route path="/clinics/:id" element={<ClinicDetails />} />
          <Route path="/clinics/edit/:id" element={<EditClinic />} />

          <Route path="/nurses" element={<Users />} />
          <Route path="/nurses/create" element={<CreateUser />} />
          <Route path="/nurses/:id" element={<UserDetails />} />
          <Route path="/nurses/edit/:id" element={<EditUser />} />

          <Route path="/doctors" element={<Doctors />} />
          <Route path="/doctors/create" element={<CreateDoctor />} />
          <Route path="/doctors/edit/:id" element={<EditDoctor />} />
          <Route path="/doctors/:id" element={<DoctorDetails />} />

          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/operations" element={<OperationsManagement />} />
          <Route path="/admin/materials" element={<MaterialsManagement />} />
          <Route path="/admin/options" element={<OptionsManagement />} />
          <Route path="/admin/categories" element={<CategoriesManagement />} />

          {/* <Route path="/teeth-selection" element={<TeethSelection />} /> */}
          {/* 
            <Route path="/dental-order" element={<DentalOrderPage />} />
            <Route path="/patient-list" element={<PatientList />} /> */}
        </Routes>

        {/* <DentalOrderPage /> */}
      </Layout>
    </SnackbarProvider>
  );
}

export default App;
