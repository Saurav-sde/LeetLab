import { useState, useEffect } from 'react';
import axiosClient from '../utils/axiosClient';
import SolutionCard from './SolutionCard'; 

const SubmissionHistory = ({ problemId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get(`/problem/submittedProblem/${problemId}`);
        console.log(response);
        
        const sortedSubmissions = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setSubmissions(sortedSubmissions);
        setError(null);
      } catch (err) {
        setError('Failed to fetch submission history');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [problemId]);


  const getStatusInfo = (status) => {
    switch (status) {
      case 'accepted': return { color: 'text-green-400', barColor: 'bg-green-500', label: 'Accepted' };
      case 'wrong': return { color: 'text-red-400', barColor: 'bg-red-500', label: 'Wrong Answer' };
      case 'error': return { color: 'text-yellow-400', barColor: 'bg-yellow-500', label: 'Runtime Error' };
      case 'pending': return { color: 'text-blue-400', barColor: 'bg-blue-500', label: 'Pending' };
      default: return { color: 'text-gray-400', barColor: 'bg-gray-500', label: status.charAt(0).toUpperCase() + status.slice(1) };
    }
  };

  const formatMemory = (memory) => {
    if (memory < 1024) return `${memory} kB`;
    return `${(memory / 1024).toFixed(2)} MB`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="text-gray-300 p-4 sm:p-6 rounded-lg font-sans">    
      {loading && ( <div className="flex justify-center items-center h-64"><span className="loading loading-spinner loading-lg text-blue-500"></span></div> )}

      {error && ( <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-4 rounded-lg flex items-center gap-3"><svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><span>{error}</span></div> )}

      {!loading && !error && submissions.length === 0 && ( <div className="bg-zinc-800/50 border border-zinc-700 text-gray-400 p-4 rounded-lg flex items-center gap-3"><svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg><span>No submissions found for this problem</span></div> )}
     
      {!loading && !error && submissions.length > 0 && (
        <div className="flex flex-col gap-3">
          {submissions.map((sub) => {
            const statusInfo = getStatusInfo(sub.status);
            return (
              <div 
                key={sub._id}
                className="group flex flex-col md:flex-row items-center bg-neutral-800 border border-transparent hover:border-zinc-700 p-4 rounded-lg transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedSubmission(sub)}
              >

                <div className={`w-full md:w-1 h-1 md:h-12 rounded-full md:rounded-lg ${statusInfo.barColor} mb-3 md:mb-0 md:mr-4`}></div>
                
                <div className="flex-grow flex flex-col md:flex-row items-center w-full">
                  {/* Left Section: Status & Language */}
                  <div className="w-full md:w-1/4 text-center md:text-left mb-3 md:mb-0">
                    <p className={`font-bold text-lg ${statusInfo.color}`}>{statusInfo.label}</p>
                    <p className="text-sm text-gray-400 font-mono">{sub.language}</p>
                  </div>

                  {/* Middle Section: Metrics */}
                  <div className="flex-grow flex justify-center gap-8 text-center mb-4 md:mb-0">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Runtime</p>
                      <p className="text-md font-mono text-gray-200">{sub.runtime}s</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Memory</p>
                      <p className="text-md font-mono text-gray-200">{formatMemory(sub.memory)}</p>
                    </div>
                  </div>

                  {/* Right Section: Time & Action */}
                  <div className="text-center md:text-right">
                    <p className="text-sm text-gray-400 mb-1">{formatDate(sub.createdAt)}</p>
                    <div className="text-indigo-400 font-semibold text-sm flex items-center justify-center md:justify-end gap-2">
                      View Solution
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-300">
          {/* Using zinc-900 for a deep, modern dark theme background */}
          <div className="bg-zinc-900 border border-zinc-700/80 rounded-lg shadow-xl w-11/12 max-w-5xl flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center p-4 border-b border-zinc-800">
              <h3 className="font-bold text-lg text-zinc-100">Submission Details</h3>
              <button 
                className="text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-full p-1 transition-colors" 
                onClick={() => setSelectedSubmission(null)}
              >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="mb-6 flex flex-wrap gap-x-8 gap-y-3 text-sm">
                  <p><span className="font-semibold text-zinc-400">Status: </span> <span className={`font-bold ${getStatusInfo(selectedSubmission.status).color}`}>{getStatusInfo(selectedSubmission.status).label}</span></p>
                  <p><span className="font-semibold text-zinc-400">Runtime: </span> <span className="font-mono text-zinc-200">{selectedSubmission.runtime}s</span></p>
                  <p><span className="font-semibold text-zinc-400">Memory: </span> <span className="font-mono text-zinc-200">{formatMemory(selectedSubmission.memory)}</span></p>
                  <p><span className="font-semibold text-zinc-400">Passed: </span> <span className="font-mono text-zinc-200">{selectedSubmission.testCasesPassed}/{selectedSubmission.testCasesTotal}</span></p>
              </div>

              {selectedSubmission.errorMessage && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-4 mb-6 rounded-md">
                  <p className="font-semibold mb-2 text-red-200">Error Details</p>
                  <pre className="text-sm font-mono whitespace-pre-wrap">{selectedSubmission.errorMessage}</pre>
                </div>
              )}
              
              <div className="mt-8">
                <SolutionCard
                  language={selectedSubmission.language}
                  completeCode={selectedSubmission.code} 
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionHistory;