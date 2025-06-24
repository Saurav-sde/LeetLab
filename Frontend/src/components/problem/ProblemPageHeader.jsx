// src/components/problem/ProblemPageHeader.js

import { BsLightningChargeFill, BsList, BsSearch } from "react-icons/bs";
import { VscChromeClose } from "react-icons/vsc";
import { FaCheckCircle } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import { useState, useEffect } from "react";
import { NavLink, useParams } from "react-router";
import axiosClient from "../../utils/axiosClient";

const getDifficultyStyles = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy':
      return 'text-green-500 bg-green-500/10';
    case 'medium':
      return 'text-yellow-500 bg-yellow-500/10';
    case 'hard':
      return 'text-red-500 bg-red-500/10';
    default:
      return 'text-gray-400 bg-gray-400/10';
  }
};

const ProblemPageHeader = ({ user, loading, onRun, onSubmit, isPanelVisible, onPanelToggle }) => {
  const { problemId } = useParams(); // Get current problem ID from URL to highlight it

  // State for the problem list data and its loading state remains internal to this component
  const [allProblem, setAllProblem] = useState(null);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [isPanelLoading, setIsPanelLoading] = useState(false);

  // Fetches all problems from the API
  const fetchAllProblem = async () => {
    setIsPanelLoading(true);
    try {
      const response = await axiosClient.get("/problem/getAllProblem");
      setAllProblem(response.data); 
    } catch (err) {
      console.error('Error fetching problems:', err);
      setAllProblem([]);
    } finally {
      setIsPanelLoading(false);
    }
  }

  const fetchSolvedProblems = async () => {
      if (!user) return;
      try {
        const { data } = await axiosClient.get('/problem/problemSolvedByUser');
        setSolvedProblems(data);
      } catch (error) { 
        console.error('Error fetching solved problems:', error); 
      }
  };
  
  // This effect hook fetches data only when the panel is opened for the first time.
  useEffect(() => {
    if (isPanelVisible && !allProblem) {
      fetchAllProblem();
      fetchSolvedProblems();
    }
  }, [isPanelVisible, allProblem]);

  const solvedProblemIds = new Set(solvedProblems?.map(p => p._id));

  /**
   * Renders the slide-in drawer panel with the list of problems.
   */
  const renderProblemListPanel = () => {
    return (
      <>
        {/* Transparent Backdrop Overlay: Closes the panel on click */}
        <div
          className={`fixed inset-0 z-40 transition-opacity duration-300
            ${isPanelVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`
          }
          onClick={onPanelToggle}
        ></div>

        {/* Drawer Panel */}
        <div
          className={`fixed top-0 left-0 h-full w-[450px] bg-[#1A1A1A] text-white z-50 shadow-2xl 
            flex flex-col transition-transform duration-300 ease-in-out
            ${isPanelVisible ? 'transform-none' : '-translate-x-full'}`
          }
        >
          {/* Panel Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-700 flex-shrink-0">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              Problem List <IoIosArrowDown className="mt-1" />
            </h2>
            <button onClick={onPanelToggle} className="text-gray-400 hover:text-white text-xl">
              <VscChromeClose />
            </button>
          </div>

          {/* Panel Filters */}
          <div className="p-4 space-y-3 flex-shrink-0">
            <div className="relative">
              <BsSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search questions"
                className="w-full bg-[#282828] border border-transparent focus:border-blue-500 focus:ring-0 rounded-lg pl-9 pr-3 py-2"
              />
            </div>
          </div>

          {/* Problem List */}
          <div className="flex-grow overflow-y-auto px-2">
            {isPanelLoading ? (
              <div className="flex justify-center items-center h-full">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : (
              allProblem?.map(problem => (
                <NavLink 
                  key={problem._id}
                  to={`/problem/${problem._id}`}
                  className={({isActive}) => `flex items-center p-3 rounded-lg my-1 transition-colors duration-200
                    ${isActive ? 'bg-white/10' : 'hover:bg-white/5'}`
                  }
                  onClick={onPanelToggle} // Close panel on navigation
                >
                  <div className="px-4 w-20 flex justify-center">
                    {solvedProblemIds.has(problem._id) && (
                      <FaCheckCircle className="text-green-500 text-lg" title="Solved" />
                    )}
                  </div>
                  <div className="flex-grow text-gray-200 text-sm hover:text-blue-400">
                    {problem.title}
                  </div>
                  <div className={`text-xs font-medium px-2 py-1 rounded-md w-20 text-center flex-shrink-0
                    ${getDifficultyStyles(problem.difficulty)}`}
                  >
                    {`${problem.difficulty.charAt(0).toUpperCase()}${problem.difficulty.slice(1)}`}
                  </div>
                </NavLink>
              ))
            )}
            {!isPanelLoading && (!allProblem || allProblem.length === 0) && (
              <div className="text-center text-gray-500 mt-10">No problems found.</div>
            )}
          </div>
        </div>
      </>
    );
  };
  
  return (
    <>
      <header className="bg-[#0F0F0F] flex items-center justify-between p-7 border-b border-gray-700 h-[48px] flex-shrink-0">
        <div className="flex items-center gap-4">
          <BsLightningChargeFill className="text-orange-400 text-2xl" />
          <div 
            className="flex items-center gap-2 text-[#F5F5F5] text-[16px] cursor-pointer"
            onClick={onPanelToggle}
          >
            <BsList className="text-xl text-[#B7B7B7] hover:text-white"/>
            <span className="hover:text-white">Problem List</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className={`btn btn-sm bg-gray-600 hover:bg-gray-500 text-white border-0 ${loading ? 'loading' : ''}`} onClick={onRun} disabled={loading}>Run</button>
          <button className={`btn btn-sm bg-green-600 hover:bg-green-700 text-white border-0 ${loading ? 'loading' : ''}`} onClick={onSubmit} disabled={loading}>Submit</button>
        </div>
        <div className="flex items-center gap-4">
          <button className='btn btn-ghost'>{user?.firstName}</button>
          <button className="btn btn-md bg-[#1F1303] text-[#FFA116] border-0 text-md rounded-lg">Premium</button>
        </div>
      </header>

      {/* Render the drawer panel */}
      {renderProblemListPanel()}
    </>
  );
};

export default ProblemPageHeader;