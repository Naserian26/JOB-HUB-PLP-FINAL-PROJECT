import React, { useContext } from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Applications from "./pages/Applications";
import ApplyJob from "./pages/ApplyJob";
import RecruiterLogin from "./components/RecruiterLogin";
import { AppContext } from "./context/AppContext";
import Dashboard from "./pages/Dashboard";
import AddJob from "./pages/AddJob";
import ManageJobs from "./pages/ManageJobs";
import ViewApplications from "./pages/ViewApplications";
import "quill/dist/quill.snow.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const { showRecruiterLogin } = useContext(AppContext);

  return (
    <div>
      {showRecruiterLogin && <RecruiterLogin />}
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/apply-job/:id" element={<ApplyJob />} />
        <Route path="/recruiter-login" element={<RecruiterLogin />} />
        <Route path="/applications" element={<Applications />} />

        {/* Dashboard layout with nested routes */}
        <Route path="/dashboard" element={<Dashboard />}>
          <Route path="add-job" element={<AddJob />} />
          <Route path="manage-job" element={<ManageJobs />} />
          <Route path="view-applications" element={<ViewApplications />} />
        </Route>

        {/* Optional: 404 fallback */}
        <Route path="*" element={<h1 className="text-center mt-10 text-2xl">Page Not Found</h1>} />
      </Routes>
    </div>
  );
};

export default App;
