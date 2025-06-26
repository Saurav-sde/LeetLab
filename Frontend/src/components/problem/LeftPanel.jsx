// src/components/problem/LeftPanel.js

import { BsCpu, BsFileText, BsJournalText, BsLightbulb, BsChatDots } from "react-icons/bs";
import { FaHistory } from "react-icons/fa";
// NEW: Import the maximize/minimize icons
import { FiMaximize, FiMinimize2 } from 'react-icons/fi';

import SubmissionHistory from '../SubmissionHistory';
import ChatAi from '../ChatAi';
import SolutionCard from '../SolutionCard';
import ProblemDescription from './ProblemDescription';
import SubmissionResultView from './SubmissionResultView';
import Editorial from "../Editorial";

// A local helper component for tabs
const LeftPanelTab = ({ name, label, icon, activeTab, onTabChange }) => (
    <button
      className={`px-2 py-2 text-m font-medium transition-colors duration-200 cursor-pointer flex items-center gap-2 ${
        activeTab === name
          ? 'text-yellow-400 border-b-2 border-yellow-500'
          : 'text-gray-400 hover:text-white'
      }`}
      onClick={() => onTabChange(name)}
    >
      {icon}
      {label}
    </button>
);

const ReferenceSolutions = ({ solutions }) => (
  <div>
    <h2 className="text-2xl font-bold mb-6 text-slate-100 border-b border-zinc-700 pb-3">Reference Solutions</h2>
    <div className="space-y-8">
      {solutions && solutions.length > 0 ? (
        solutions.map((solution, index) => <SolutionCard key={index} language={solution.language} completeCode={solution.completeCode} />)
      ) : (
        <div className="flex flex-col items-center justify-center text-center pt-10">
          <div className="p-12 bg-zinc-800 rounded-lg border border-dashed border-zinc-700">
            <h3 className="text-lg font-semibold text-slate-400">No Solutions Available Yet</h3>
            <p className="text-zinc-500 mt-2">Solutions will be available after you solve the problem. Keep trying!</p>
          </div>
        </div>
      )}
    </div>
  </div>
);

// MODIFIED: Accept onMaximize and isMaximized props
const LeftPanel = ({ 
    problem, 
    activeTab, 
    onTabChange, 
    submitResult, 
    problemId, 
    code, 
    language,
    onMaximize,
    isMaximized,
    chatMessages,
    setChatMessages
}) => {
  return (
    <div className="h-full flex flex-col border-r border-gray-700 overflow-hidden">
      {/* MODIFIED: The header is now a flex container with justify-between */}
      <div className="flex-shrink-0 flex justify-between items-center px-4 border-b border-gray-700 min-h-13 bg-[#262626]">
        {/* Container for tabs */}
        <div className="flex items-center space-x-4 overflow-x-auto whitespace-nowrap">
          <LeftPanelTab name="description" label="Description" icon={<BsFileText className="text-lg" />} activeTab={activeTab} onTabChange={onTabChange} />
          {submitResult && (
            <LeftPanelTab name="submissionResult" label="Result" icon={<BsCpu className="text-lg" />} activeTab={activeTab} onTabChange={onTabChange} />
          )}
          <LeftPanelTab name="editorial" label="Editorial" icon={<BsJournalText className="text-lg" />} activeTab={activeTab} onTabChange={onTabChange} />
          <LeftPanelTab name="solutions" label="Solutions" icon={<BsLightbulb className="text-lg" />} activeTab={activeTab} onTabChange={onTabChange} />
          <LeftPanelTab name="submissions" label="Submissions" icon={<FaHistory className="text-lg" />} activeTab={activeTab} onTabChange={onTabChange} />
          <LeftPanelTab name="chatAI" label="ChatAI" icon={<BsChatDots className="text-lg" />} activeTab={activeTab} onTabChange={onTabChange} />
        </div>

        {/* NEW: Maximize/Minimize button */}
        <div className="flex items-center text-gray-400 text-lg pl-4">
            <button
                onClick={onMaximize}
                className="cursor-pointer hover:text-white"
                title={isMaximized ? 'Restore' : 'Maximize'}
            >
                {isMaximized ? <FiMinimize2 /> : <FiMaximize />}
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-3">
        {activeTab === 'description' && <ProblemDescription problem={problem} />}
        {activeTab === 'editorial' && (
            <div className="prose max-w-none">
              <h2 className="text-xl font-bold mb-4">Editorial</h2>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  <Editorial secureUrl={problem.secureUrl} thumbnailUrl={problem.thumbnailUrl} duration={problem.duration}/>
              </div>
            </div>
        )}
        {activeTab === 'solutions' && <ReferenceSolutions solutions={problem?.referenceSolution} />}
        {activeTab === 'submissions' && <SubmissionHistory problemId={problemId} />}
        {activeTab === 'chatAI' && <ChatAi problem={problem} messages={chatMessages} setMessages={setChatMessages}/>}
        {activeTab === 'submissionResult' && <SubmissionResultView result={submitResult} submittedCode={code} language={language}/>}
      </div>
    </div>
  );
};

export default LeftPanel;