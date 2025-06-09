import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router'; // Note: react-router-dom is more standard
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';
import { FaCheckCircle } from 'react-icons/fa';

function Homepage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    status: 'all',
  });

  // --- Data fetching and other logic remains unchanged ---
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/getAllProblem');
        setProblems(data);
      } catch (error) { console.error('Error fetching problems:', error); }
    };
    const fetchSolvedProblems = async () => {
      if (!user) return;
      try {
        const { data } = await axiosClient.get('/problem/problemSolvedByUser');
        setSolvedProblems(data);
      } catch (error) { console.error('Error fetching solved problems:', error); }
    };
    fetchProblems();
    if (user) fetchSolvedProblems();
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
    const tagMatch = filters.tag === 'all' || problem.tags === filters.tag;
    // Updated logic for status filter to also handle "unsolved"
    const statusMatch = filters.status === 'all' 
                        || (filters.status === 'solved' && isSolved)
                        || (filters.status === 'unsolved' && !isSolved);
    return difficultyMatch && tagMatch && statusMatch;
  });

  // Helper function to get difficulty text color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':   return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard':   return 'text-red-500';
      default:       return 'text-gray-500';
    }
  };

  return (
    // Main container: LeetCode-style very dark background and light text
    <div className="min-h-screen bg-zinc-900 text-neutral-300 font-sans">
      
      {/* Navbar: Fused with the background, separated by a subtle bottom border */}
      <header className="navbar bg-zinc-900 px-4 sm:px-6 lg:px-8 sticky top-0 z-50 border-b border-zinc-800">
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
        {/* Filters section: Minimalist and inline */}
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
            <option value="array">Array</option>
            <option value="linkedList">Linked List</option>
            <option value="graph">Graph</option>
            <option value="dp">DP</option>
          </select>
        </div>

        {/* Problems table */}
        <div className="overflow-x-auto rounded-lg border border-zinc-800">
          <table className="table-auto w-full">
            <thead className="bg-zinc-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider w-20">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider w-40">Difficulty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider w-40">Tag</th>
              </tr>
            </thead>
            <tbody className="bg-zinc-900">
              {filteredProblems.length > 0 ? (
                filteredProblems.map(problem => (
                  <tr key={problem._id} className="border-b border-zinc-800 last:border-b-0 hover:bg-zinc-800/70 transition-colors duration-200">
                    <td className="px-4 py-4 text-center">
                      {solvedProblemIds.has(problem._id) && (
                        <FaCheckCircle className="text-green-500 text-lg" title="Solved" />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <NavLink to={`/problem/${problem._id}`} className="hover:text-white transition-colors duration-150">
                        {problem.title}
                      </NavLink>
                    </td>
                    <td className={`px-6 py-4 font-medium ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty}
                    </td>
                    <td className="px-6 py-4">
                       <span className="inline-block bg-zinc-700 text-neutral-300 px-2.5 py-1 rounded-full text-xs font-medium">
                        {problem.tags}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-16 text-zinc-600">
                    <h3 className="text-xl font-semibold">No Problems Found</h3>
                    <p className="mt-2">Try adjusting the filters to find your next challenge!</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default Homepage;