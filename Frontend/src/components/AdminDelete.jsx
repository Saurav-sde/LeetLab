import { useEffect, useState } from 'react';
import axiosClient from '../utils/axiosClient';
import { Trash2, ShieldAlert } from 'lucide-react'; // Icons for better UI

const AdminDelete = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      setError(null); // Reset error on new fetch
      // Your API endpoint is already correct
      const { data } = await axiosClient.get('/problem/getAllProblem');
      setProblems(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch problems.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this problem? This action cannot be undone.')) {
      return;
    }
    
    try {
      // The delete API call is correct
      await axiosClient.delete(`/problem/delete/${id}`);
      // This is the correct and most efficient way to update the UI
      setProblems(currentProblems => currentProblems.filter(problem => problem._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete the problem. Please try again.');
      console.error(err);
    }
  };

  // --- UI CHANGE: Themed loading state ---
  if (loading) {
    return (
      <div className="bg-gray-900 text-gray-300 min-h-screen flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg">Loading Problems...</p>
        </div>
      </div>
    );
  }

  // --- UI CHANGE: Themed error state ---
  if (error) {
    return (
      <div className="bg-gray-900 text-gray-300 min-h-screen flex justify-center items-center p-4">
        <div className="bg-gray-800 border border-red-500/50 p-6 rounded-lg text-center max-w-md">
          <ShieldAlert className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">An Error Occurred</h2>
          <p className="text-red-300">{error}</p>
          <button 
            onClick={fetchProblems} 
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // --- UI CHANGE: Main component with LeetCode dark theme ---
  return (
    <div className="bg-gray-900 text-gray-300 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-white">Manage Problems</h1>

        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-900">
              <tr>
                <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Title</th>
                <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Difficulty</th>
                <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Tags</th>
                <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {problems.map((problem) => (
                <tr key={problem._id} className="hover:bg-gray-700/50 transition-colors">
                  <td className="p-4 font-medium text-white">{problem.title}</td>
                  <td className="p-4">
                    {/* --- CORRECTION 2: Use lowercase for comparison --- */}
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                      problem.difficulty === 'easy' 
                        ? 'bg-green-600/20 text-green-400' 
                        : problem.difficulty === 'medium' 
                          ? 'bg-yellow-600/20 text-yellow-400' 
                          : 'bg-red-600/20 text-red-400'
                    }`}>
                      {problem.difficulty}
                    </span>
                  </td>
                  <td className="p-4">
                    {/* --- CORRECTION 1: Map over the tags array --- */}
                    <div className="flex flex-wrap gap-2">
                      {problem.tags?.map(tag => (
                        <span key={tag._id} className="px-2 py-1 bg-gray-700 text-gray-300 rounded-md text-xs font-medium capitalize">
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleDelete(problem._id)}
                      className="flex items-center gap-2 ml-auto text-gray-400 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-md transition-colors"
                      title="Delete Problem"
                    >
                      <Trash2 size={18} />
                      <span className="text-sm font-medium">Delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {problems.length === 0 && (
            <div className="text-center py-16 text-gray-500">
                <h2 className="text-xl font-semibold">No Problems Found</h2>
                <p>You can create a new problem in the admin panel.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminDelete;