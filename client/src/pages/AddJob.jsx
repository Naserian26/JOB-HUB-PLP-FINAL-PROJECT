import Quill from "quill";
import React, { useContext, useEffect, useRef, useState } from "react";
import { JobCategories, JobLocations } from "../assets/assets";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const AddJob = () => {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("Bangalore");
  const [category, setCategory] = useState("Programming");
  const [level, setLevel] = useState("Junior Level");
  const [salary, setSalary] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [isFormValid, setIsFormValid] = useState(false);

  const editorRef = useRef(null);
  const quillRef = useRef(null);

  const { backendUrl, companyToken } = useContext(AppContext);
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!companyToken) {
      toast.error("You must be logged in as a recruiter to post a job.");
      navigate("/recruiter-login");
    }
  }, [companyToken]);

  // Validate form
  useEffect(() => {
    setIsFormValid(title.trim() && salary > 0);
  }, [title, salary]);

  // Initialize Quill
  useEffect(() => {
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: "snow",
        modules: {
          toolbar: [
            ["bold", "italic", "underline", "strike"],
            ["blockquote", "code-block"],
            [{ header: 1 }, { header: 2 }],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ script: "sub" }, { script: "super" }],
            [{ indent: "-1" }, { indent: "+1" }],
            [{ direction: "rtl" }],
            [{ size: ["small", false, "large", "huge"] }],
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            [{ color: [] }, { background: [] }],
            [{ font: [] }],
            [{ align: [] }],
            ["clean"],
            ["link", "image"],
          ],
        },
        placeholder: "Create a detailed job description...",
      });
    }
  }, []);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      const description = quillRef.current.root.innerHTML;

      const { data } = await axios.post(
        `${backendUrl}/company/post-job`,
        { title, description, location, category, level, salary },
        { headers: { token: companyToken } }
      );

      if (data.success) {
        toast.success(data.message);
        setTitle("");
        setSalary(0);
        quillRef.current.root.innerHTML = "";
        setFormStep(1);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h2 className="text-2xl md:text-3xl font-bold text-primary mb-2">Post a New Position</h2>
      <p className="text-gray-500 mb-6">Create a job listing to attract the perfect candidates</p>

      {/* Progress Bar */}
      <div className="mb-10">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Basic Info</span>
          <span className="text-sm font-medium text-gray-700">Job Details</span>
          <span className="text-sm font-medium text-gray-700">Preview & Post</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300 ease-in-out"
            style={{ width: `${(formStep / 3) * 100}%` }}
          ></div>
        </div>
      </div>

      <form onSubmit={onSubmitHandler}>
        {/* Step 1 */}
        <motion.div
          className={formStep === 1 ? "block" : "hidden"}
          initial="hidden"
          animate="visible"
          variants={formVariants}
        >
          {/* Job Basics */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="flex items-center mb-6">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold mr-3">1</div>
              <h3 className="text-xl font-semibold text-gray-800">Job Basics</h3>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior React Developer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Salary (Annual) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder="e.g. 75000"
                  value={salary || ""}
                  onChange={(e) => setSalary(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">Enter the annual salary in USD</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setFormStep(2)}
              disabled={!isFormValid}
              className={`px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-200 ${
                !isFormValid ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Continue to Job Details
            </button>
          </div>
        </motion.div>

        {/* Step 2 */}
        <motion.div
          className={formStep === 2 ? "block" : "hidden"}
          initial="hidden"
          animate="visible"
          variants={formVariants}
        >
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="flex items-center mb-6">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold mr-3">2</div>
              <h3 className="text-xl font-semibold text-gray-800">Job Details</h3>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Description <span className="text-red-500">*</span>
                </label>
                <div ref={editorRef} className="w-full border border-gray-300 rounded-lg min-h-48"></div>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-3 border rounded-lg">
                    {JobCategories.map((cat, i) => <option key={i} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <select value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-4 py-3 border rounded-lg">
                    {JobLocations.map((loc, i) => <option key={i} value={loc}>{loc}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                  <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full px-4 py-3 border rounded-lg">
                    <option>Junior Level</option>
                    <option>Intermediate Level</option>
                    <option>Senior Level</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button type="button" onClick={() => setFormStep(1)} className="px-6 py-3 bg-gray-200 rounded-lg">Back</button>
            <button type="button" onClick={() => setFormStep(3)} className="px-6 py-3 bg-indigo-600 text-white rounded-lg">Preview Job</button>
          </div>
        </motion.div>

        {/* Step 3 */}
        <motion.div
          className={formStep === 3 ? "block" : "hidden"}
          initial="hidden"
          animate="visible"
          variants={formVariants}
        >
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Preview & Post</h3>
            <div className="p-6 border border-dashed rounded-xl bg-gray-50 mb-4">
              <h4 className="text-lg font-bold">{title}</h4>
              <p>Location: {location} | Category: {category} | Level: {level}</p>
              <p>Salary: ${salary.toLocaleString()}</p>
              <div className="mt-4" dangerouslySetInnerHTML={{ __html: quillRef.current?.root.innerHTML || "" }} />
            </div>

            <div className="flex justify-between">
              <button type="button" onClick={() => setFormStep(2)} className="px-6 py-3 bg-gray-200 rounded-lg">Edit Details</button>
              <button type="submit" disabled={isSubmitting || !isFormValid} className="px-8 py-3 bg-indigo-600 text-white rounded-lg">
                {isSubmitting ? "Posting..." : "Post Job"}
              </button>
            </div>
          </div>
        </motion.div>
      </form>
    </div>
  );
};

export default AddJob;
