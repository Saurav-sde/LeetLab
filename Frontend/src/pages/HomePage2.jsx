// src/pages/Homepage.js

import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router'; 
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice'; 
import { FaCheckCircle } from 'react-icons/fa';

function Homepage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  // State for data
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);

  // State for filters
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    status: 'all',
  });

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/getAllProblem');
        // The API response for problems is likely an object like { problems: [...] }
        // If it's just an array, `data` is correct. If not, adjust to `data.problems`
        setProblems(data.problems || data);
      } catch (error) { 
        console.error('Error fetching problems:', error); 
      }
    };

    const fetchSolvedProblems = async () => {
      if (!user) return;
      try {
        const { data } = await axiosClient.get('/problem/problemSolvedByUser');
        setSolvedProblems(data);
      } catch (error) { 
        console.error('Error fetching solved problems:', error); 
      }
    };

    const fetchTags = async () => {
        try {
            const { data } = await axiosClient.get('/tags/getAll');
            setAvailableTags(data);
        } catch (error) {
            console.error('Error fetching tags:', error);
        }
    };

    fetchProblems();
    fetchTags();
    if (user) {
      fetchSolvedProblems();
    }
  }, [user]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]);
    navigate('/');
  };
  
  const solvedProblemIds = new Set(solvedProblems.map(p => p._id));
  
  const filteredProblems = problems.filter(problem => {
    const isSolved = solvedProblemIds.has(problem._id);
    const difficultyMatch = filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
    const tagMatch = filters.tag === 'all' || problem.tags?.some(tag => tag._id === filters.tag);
    const statusMatch = filters.status === 'all' 
                        || (filters.status === 'solved' && isSolved)
                        || (filters.status === 'unsolved' && !isSolved);
    return difficultyMatch && tagMatch && statusMatch;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':   return 'text-[#1CBABA]';
      case 'medium': return 'text-[#FFB700]';
      case 'hard':   return 'text-[#F63737]';
      default:       return 'text-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-neutral-300 font-sans">
      
      <header className="navbar bg-[#262626] px-4 sm:px-6 lg:px-8 sticky top-0 z-50 border-b border-zinc-800">
        <div className="flex-1">
          <NavLink to="/" className="btn btn-ghost text-xl font-semibold text-white hover:bg-transparent px-0">
            ProCode
          </NavLink>
        </div>
        <div className="flex-none gap-4">
          {user ? (
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                 <div className="w-8 rounded-full bg-zinc-700 text-white flex items-center justify-center">
                    <span className="text-lg font-bold">{user.firstName?.charAt(0).toUpperCase()}</span>
                 </div>
              </div>
              <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-zinc-800 border border-zinc-700 rounded-lg w-52">
                <li className="p-2 font-semibold text-neutral-200">{user.firstName} {user.lastName}</li>
                <div className="divider my-0 border-t border-zinc-700"></div>
                {user.role === 'admin' && <li><NavLink to='/admin' className="hover:bg-zinc-700 rounded-md">Admin Panel</NavLink></li>}
                <li><button onClick={handleLogout} className="hover:bg-zinc-700 text-red-400 w-full text-left rounded-md">Logout</button></li>
              </ul>
            </div>
          ) : (
             <NavLink to="/login" className="btn btn-sm bg-zinc-800 hover:bg-zinc-700 text-neutral-300 font-bold border-zinc-700">
                Login
             </NavLink>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col md:flex-row flex-wrap items-center gap-4">
          <select 
            className="select select-sm w-full md:w-auto bg-zinc-800 border-zinc-700 text-neutral-300 focus:outline-none focus:ring-1 focus:ring-yellow-500"
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="all">Status</option>
            <option value="solved">Solved</option>
            <option value="unsolved">Unsolved</option>
          </select>
          <select 
            className="select select-sm w-full md:w-auto bg-zinc-800 border-zinc-700 text-neutral-300 focus:outline-none focus:ring-1 focus:ring-yellow-500"
            value={filters.difficulty}
            onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
          >
            <option value="all">Difficulty</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          
          <select 
            className="select select-sm w-full md:w-auto bg-zinc-800 border-zinc-700 text-neutral-300 focus:outline-none focus:ring-1 focus:ring-yellow-500"
            value={filters.tag}
            onChange={(e) => setFilters({...filters, tag: e.target.value})}
          >
            <option value="all">Tag</option>
            {availableTags.map(tag => (
              <option key={tag._id} value={tag._id} className="capitalize">
                {tag.name}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-hidden">
          <div>
            {filteredProblems.length > 0 ? (
              filteredProblems.map((problem, index) => (
                <div 
                  key={problem._id} 
                  className={`flex items-center rounded-lg transition-colors duration-200 
                              ${index % 2 === 0 ? 'bg-[#262626]' : 'bg-transparent'} 
                              `}
                >
                  <div className="px-4 py-4 w-20 flex justify-center">
                    {solvedProblemIds.has(problem._id) && (
                      <FaCheckCircle className="text-green-500 text-lg" title="Solved" />
                    )}
                  </div>
                  <div className="px-6 py-4 flex-1">
                    <NavLink to={`/problem/${problem._id}`} className="hover:text-white transition-colors duration-150 text-base">
                      {problem.title}
                    </NavLink>
                  </div>
                  {/* --- FIX: Swapped Difficulty and Tags, and gave Tags more width --- */}
                  <div className={`text-[14px] font-medium px-6 py-4 w-40 ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty ? `${problem.difficulty.charAt(0).toUpperCase()}${problem.difficulty.slice(1)}` : 'N/A'}
                  </div>
                  <div className="px-6 py-4 w-64 flex flex-wrap gap-2">
                    {problem.tags?.map(tag => (
                      <span key={tag._id} className="inline-block bg-zinc-700 text-neutral-300 px-2.5 py-1 rounded-full text-xs font-medium capitalize">
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 text-zinc-600">
                <h3 className="text-xl font-semibold">No Problems Found</h3>
                <p className="mt-2">Try adjusting the filters to find your next challenge!</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Homepage;