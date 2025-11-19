import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth, useUser } from "@clerk/clerk-react";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const { user } = useUser();
  const { getToken } = useAuth();

  const [searchFilter, setSearchFilter] = useState({ title: "", location: "" });
  const [isSearched, setIsSearched] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [showRecruiterLogin, setShowRecruiterLogin] = useState(false);

  const [companyToken, setCompanyToken] = useState(null);
  const [companyData, setCompanyData] = useState(null);

  const [userData, setUserData] = useState(null);
  const [userApplications, setUserApplications] = useState([]);

  // --- Data Fetching Functions ---

  // Fetch Jobs from the server
  const fetchJobs = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/jobs`);
      if (data.success) setJobs(data.jobs);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Fetch Company Data using the company token
  const fetchCompanyData = async () => {
    if (!companyToken) return;
    try {
      const { data } = await axios.get(`${backendUrl}/company/company`, {
        headers: { token: companyToken },
      });
      if (data.success) setCompanyData(data.company);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Fetch User Data. This function is reusable (e.g., after a resume update).
  const fetchUserData = async () => {
    if (!user) return;
    try {
      const token = await getToken();
      const { data } = await axios.get(`${backendUrl}/users/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setUserData(data.user);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  // Fetch User's Job Applications
  const fetchUserApplications = async () => {
    if (!user) return;
    try {
      const token = await getToken();
      const { data } = await axios.get(`${backendUrl}/users/applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setUserApplications(data.applications || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  // --- Initialization Function ---

  // Initializes the user session: logs them in, and fetches their data and applications.
  const initializeUser = async () => {
    if (!user) return;

    try {
      const token = await getToken();

      // 1. Login or create user in the backend
      const { data: loginRes } = await axios.post(`${backendUrl}/users/login`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!loginRes.success) {
        throw new Error(loginRes.message);
      }

      // 2. Fetch user's profile data using the dedicated function
      await fetchUserData();

      // 3. Fetch user's job applications
      await fetchUserApplications();

    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  // --- Effects ---

  // Runs once on component mount and when the user or companyToken changes
  useEffect(() => {
    fetchJobs();

    // Load company token from localStorage if it exists
    const storedCompanyToken = localStorage.getItem("companyToken");
    if (storedCompanyToken) {
      setCompanyToken(storedCompanyToken);
    }

    initializeUser();
  }, [user]); // Only depend on `user` now, as `initializeUser` handles the rest

  // Save company data to localStorage whenever it changes
  useEffect(() => {
    if (companyData) {
      localStorage.setItem("companyData", JSON.stringify(companyData));
    }
  }, [companyData]);

  // --- Context Value ---
  const value = {
    searchFilter,
    setSearchFilter,
    isSearched,
    setIsSearched,
    jobs,
    setJobs,
    showRecruiterLogin,
    setShowRecruiterLogin,
    companyToken,
    setCompanyToken,
    companyData,
    setCompanyData,
    backendUrl,
    userData,
    setUserData,
    userApplications,
    setUserApplications,
    fetchUserData, // Exposed for components to call manually
    fetchUserApplications,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};