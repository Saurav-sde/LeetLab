import { useState, useEffect } from 'react';
// MODIFIED: Import the minimize icon as well
import { FiMaximize, FiMinimize2 } from 'react-icons/fi';
import { FaCheckCircle, FaTimesCircle, FaCode } from 'react-icons/fa';

// Helper component for rendering test case details with improved styling
const TestCaseDetails = ({ testCase }) => {
  if (!testCase) return null;

  const detailSections = [
    { label: 'Input', value: testCase.stdin },
    { label: 'Your Output', value: testCase.stdout },
    { label: 'Expected Output', value: testCase.expected_output },
  ];

  return (
    <div className="mt-6 space-y-5">
      {detailSections.map(section => (
        <div key={section.label}>
          <p className="text-sm font-medium text-gray-400 mb-2">{section.label}</p>
          <pre className="bg-black/30 p-4 rounded-lg text-gray-200 text-sm font-mono whitespace-pre-wrap w-full">
            {/* Using a non-breaking space to ensure the block has height even when empty */}
            {section.value || ' \u00A0'}
          </pre>
        </div>
      ))}
    </div>
  );
};

// MODIFIED: Accept onMaximize and isMaximized props
const ConsolePanel = ({ loading, lastAction, runResult, submitResult, onMaximize, isMaximized }) => {
  const [activeResultCase, setActiveResultCase] = useState(0);

  // Reset active case to the first one when new results arrive
  useEffect(() => {
    if (runResult) {
      setActiveResultCase(0);
    }
  }, [runResult]);

  // Renders the main content of the console based on the current state
  const renderContent = () => {
    // --- Loading State ---
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <span className="loading loading-spinner loading-lg mb-4"></span>
          <p className="text-xl font-medium animate-pulse">
            {lastAction === 'run' ? 'Executing Code...' : 'Submitting for Judging...'}
          </p>
        </div>
      );
    }

    // --- Run Result State ---
    if (lastAction === 'run' && runResult) {
      const isSuccess = runResult.success;
      const statusText = isSuccess === true ? 'Accepted' : 'Wrong Answer';
      const statusColorClass = isSuccess === true ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400';
      const StatusIcon = isSuccess === true ? FaCheckCircle : FaTimesCircle;

      return (
        <div>
          {/* Status Banner */}
          <div className={`p-4 rounded-lg flex items-center gap-4 ${statusColorClass}`}>
            <StatusIcon className="text-3xl flex-shrink-0" />
            <div>
              <h3 className="text-xl font-bold text-white">{statusText}</h3>
              <p className="text-sm">
                {isSuccess === true ? 'Your code passed all sample test cases.' : 'Your code did not pass all sample test cases.'}
              </p>
            </div>
          </div>

          {/* Test Case Tabs */}
          <div className="flex items-center gap-3 mt-6 mb-2 flex-wrap">
            {runResult.testCases.map((tc, index) => {
              const isActive = activeResultCase === index;
              const isCaseSuccess = tc.status_id === 3;
              let tabClass = 'px-4 py-1.5 rounded-md text-sm font-semibold cursor-pointer transition-colors duration-200 focus:outline-none';
              
              if (isActive) {
                tabClass += isCaseSuccess ? ' bg-green-500 text-white' : ' bg-red-500 text-white';
              } else {
                tabClass += ` bg-gray-700/60 hover:bg-gray-700 ${isCaseSuccess ? 'text-green-400' : 'text-red-400'}`;
              }

              return (
                <button
                  key={index}
                  onClick={() => setActiveResultCase(index)}
                  className={tabClass}
                >
                  Case {index + 1}
                </button>
              );
            })}
          </div>

          {/* Test Case Details */}
          <TestCaseDetails testCase={runResult.testCases[activeResultCase]} />
        </div>
      );
    }
    
    // --- Submit Result State ---
    if (lastAction === 'submit' && submitResult) {
       return (
        <div className="flex flex-col items-center justify-center h-full text-gray-300">
          <FaCheckCircle className="text-5xl mb-4 text-green-500"/>
          <p className="text-xl font-medium">Submission Successful</p>
          <p className="text-center text-gray-500 mt-2">
            Your solution is being judged. View the final result in the{" "}
            <strong className="text-yellow-400">Submissions</strong> tab.
          </p>
        </div>
      );
    }

    // --- Default Initial State ---
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <FaCode className="text-5xl mb-4"/>
        <p className="text-lg text-center">Your code's output will appear here.</p>
        <p className="text-sm text-center mt-1">
          Click <span className="font-semibold text-gray-400">Run</span> to test against examples, or <span className="font-semibold text-gray-400">Submit</span> to judge your solution.
        </p>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col font-sans text-gray-300">
      {/* Panel Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-white/10">
        <p className="text-base font-medium">Console</p>
        <div className="flex items-center gap-3 text-gray-400 text-lg">
          {/* MODIFIED: The static button is now dynamic */}
          <button
            onClick={onMaximize}
            className="focus:outline-none cursor-pointer hover:text-white transition-colors"
            title={isMaximized ? 'Restore' : 'Maximize'}
          >
            {isMaximized ? <FiMinimize2 /> : <FiMaximize />}
          </button>
        </div>
      </div>
      {/* Panel Content */}
      <div className="flex-1 bg-[#1E1E1E] overflow-y-auto p-5">
        {renderContent()}
      </div>
    </div>
  );
};

export default ConsolePanel;