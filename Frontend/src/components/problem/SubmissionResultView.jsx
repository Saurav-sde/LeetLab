import { FiClock } from 'react-icons/fi';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { BsCpu } from "react-icons/bs";
import SolutionCard from '../SolutionCard';
import { HiSparkles } from 'react-icons/hi2';

// A small helper for displaying test case details in the "Wrong Answer" view
const TestCaseDetail = ({ label, value }) => (
  <div>
    <p className="text-sm font-medium text-gray-400 mb-1">{label}</p>
    <pre className="bg-zinc-900 p-3 rounded-md text-white text-sm whitespace-pre-wrap font-mono">
      <code>{value}</code>
    </pre>
  </div>
);

// A self-contained view for the "Accepted" state
const AcceptedView = ({ result, submittedCode, language }) => (
  <div className="backdrop-blur-sm rounded-lg overflow-hidden shadow-lg">
    {/* Status Header */}
    <div className="p-6 flex items-start sm:items-center gap-4">
      <FaCheckCircle className="text-green-400 text-4xl flex-shrink-0 mt-1 sm:mt-0" />
      <div>
        <h2 className="text-2xl font-bold text-green-400">Accepted</h2>
        <p className="text-gray-300 mt-1">Congratulations! Your solution passed all test cases.</p>
      </div>
    </div>

    {/* Stats & Actions */}
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Runtime */}
        <div className="bg-zinc-900/50 p-4 rounded-lg flex items-center gap-3 border border-zinc-700">
          <FiClock className="text-xl text-blue-400"/>
          <div>
            <p className="text-gray-400 text-xs">Runtime</p>
            <p className="text-white text-base font-semibold">{result.runtime} ms</p>
          </div>
        </div>
        {/* Memory */}
        <div className="bg-zinc-900/50 p-4 rounded-lg flex items-center gap-3 border border-zinc-700">
          <BsCpu className="text-xl text-purple-400"/>
          <div>
            <p className="text-gray-400 text-xs">Memory</p>
            <p className="text-white text-base font-semibold">{result.memory} MB</p>
          </div>
        </div>
        {/* Analyze Button */}
        <div className="md:col-span-1 flex items-center justify-center">
            <div className='w-full flex justify-center items-center gap-2 h-full px-4 py-2 text-sm font-semibold bg-zinc-900/50 p-4 rounded-lg border border-zinc-700 cursor-pointer text-yellow-400 transition-all duration-200 ease-in-out hover:bg-zinc-800 hover:border-yellow-400/50 hover:shadow-lg hover:shadow-yellow-500/10'>
              <HiSparkles style={{fontSize: "1.5em"}}/>
              Analyse Complexity
            </div>
        </div>
      </div>
    </div>
    
    {/* Submitted Code */}
    <div className="p-6 border-t border-zinc-700">
      <SolutionCard language={language} completeCode={submittedCode}/>
    </div>
  </div>
);

// A self-contained view for "Rejected" states 
const RejectedView = ({ result, submittedCode, language }) => (
  <div className="bg-zinc-800/70 backdrop-blur-sm rounded-lg border border-zinc-700 overflow-hidden shadow-lg">
    {/* Status Header */}
    <div className="bg-orange-500/10 p-6 flex items-start sm:items-center gap-4">
       <FaTimesCircle className="text-orange-400 text-4xl flex-shrink-0 mt-1 sm:mt-0" />
       <div>
         <h2 className="text-2xl font-bold text-orange-400">{result.error || 'Wrong Answer'}</h2>
         {result.error_details && <p className="text-gray-400 mt-1">{result.error_details}</p>}
       </div>
    </div>
    
    <div className="p-6">
      {/* Test Cases Progress */}
      {(result.passedTestCases !== undefined && result.totalTestCases) && (
        <div className="mb-6">
          <div className="flex justify-between items-center text-sm font-medium mb-2">
            <span className="text-gray-300">Test Cases Passed</span>
            <span className="text-white">{result.passedTestCases} / {result.totalTestCases}</span>
          </div>
          <div className="w-full bg-zinc-700 rounded-full h-2.5">
            <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: `${(result.passedTestCases / result.totalTestCases) * 100}%` }}></div>
          </div>
        </div>
      )}

      {/* Failing Test Case Details */}
      {result.lastTestCase && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-200">Failing Test Case:</h3>
          <TestCaseDetail label="Input" value={result.lastTestCase.input} />
          <TestCaseDetail label="Your Output" value={result.lastTestCase.output} />
          <TestCaseDetail label="Expected Output" value={result.lastTestCase.expected} />
        </div>
      )}
    </div>

    {/* Submitted Code */}
    <div className="p-6 border-t border-zinc-700">
      <h3 className="text-lg font-semibold text-gray-200 mb-3">Your Submission</h3>
      <SolutionCard language={language} completeCode={submittedCode}/>
    </div>
  </div>
);


const SubmissionResultView = ({ result, submittedCode, language }) => {
  if (!result) return null;

  return (
    <div className="w-full animate-fadeIn">
      {result.accepted ? 
        <AcceptedView result={result} submittedCode={submittedCode} language={language} /> : 
        <RejectedView result={result} submittedCode={submittedCode} language={language} />
      }
    </div>
  );
};

export default SubmissionResultView;