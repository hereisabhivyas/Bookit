import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Venues from "./pages/Venues";
import HostRequests from "./pages/HostRequests";
import BookingHistory from "./pages/BookingHistory";
import PaymentHistory from "./pages/PaymentHistory";
import Communities from "./pages/Communities";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    setIsAuthenticated(!!adminToken);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" />
            ) : (
              <AdminLogin setIsAuthenticated={setIsAuthenticated} />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? <Dashboard /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/users"
          element={
            isAuthenticated ? <Users /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/venues"
          element={
            isAuthenticated ? <Venues /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/host-requests"
          element={
            isAuthenticated ? <HostRequests /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/bookings"
          element={
            isAuthenticated ? <BookingHistory /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/payments"
          element={
            isAuthenticated ? <PaymentHistory /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/communities"
          element={
            isAuthenticated ? <Communities /> : <Navigate to="/login" />
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
