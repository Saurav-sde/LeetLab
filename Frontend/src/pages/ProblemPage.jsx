// src/pages/ProblemPage.js

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router';
import { useSelector } from 'react-redux';
import axiosClient from "../utils/axiosClient";

// Resizable Panels
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

// Import the new, organized components
import ProblemPageHeader from '../components/problem/ProblemPageHeader';
import LeftPanel from '../components/problem/LeftPanel';
import CodeEditorPanel from '../components/problem/CodeEditorPanel';
import ConsolePanel from '../components/problem/ConsolePanel';

// NEW: Import icons for maximize/minimize
import { Maximize, Minimize } from 'lucide-react'; 

const ProblemPage = () => {
  const { user } = useSelector((state) => state.auth);
  const { problemId } = useParams();

  // --- State Management ---
  const [problem, setProblem] = useState(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  
  // Editor & Submission State
  const [selectedLanguage, setSelectedLanguage] = useState('cpp');
  const [code, setCode] = useState('');
  const [finalCode, setFinalCode] = useState('');
  const [finalSelectedLanguage, setFinalSelectedLanguage] = useState('');
  const editorRef = useRef(null);

  // UI State
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [lastAction, setLastAction] = useState(null); // 'run' or 'submit'
  
  // Results State
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);

  // NEW: State to track which panel is maximized
  const [maximizedPanel, setMaximizedPanel] = useState(null); // null, 'left', 'editor', 'console'

  // --- Data Fetching ---
  useEffect(() => {
    const fetchProblem = async () => {
      setIsPageLoading(true);
      try {
        const response = await axiosClient.get(`/problem/problemById/${problemId}`);
        // Ensure difficulty has a default value
        if (!response.data.difficulty) {
            response.data.difficulty = "Easy"; 
        }
        setProblem(response.data);
      } catch (error) {
        console.error('Error fetching problem:', error);
      } finally {
        setIsPageLoading(false);
      }
    };
    fetchProblem();
  }, [problemId]);

  // --- Code Initialization ---
  const languageMap = { cpp: "C++", java: "Java", javascript: "JavaScript" };
  useEffect(() => {
    if (problem) {
      const initialCode = problem.startCode.find(sc => sc.language === languageMap[selectedLanguage])?.initialCode || '';
      setCode(initialCode);
    }
  }, [selectedLanguage, problem]);

  // --- Handlers ---
  const handleRun = async () => {
    setIsActionLoading(true);
    setLastAction('run');
    setSubmitResult(null);
    try {
      const response = await axiosClient.post(`/submission/run/${problemId}`, { code, language: selectedLanguage });
      console.log(response.data);
      setRunResult(response.data);
    } catch (error) {
      console.error('Error running code:', error);
      setRunResult({ success: false, error: 'Execution Failed', testCases: [] });
    }
    setIsActionLoading(false);
  };

  const handleSubmitCode = async () => {
    setIsActionLoading(true);
    setLastAction('submit');
    setFinalCode(code);
    setFinalSelectedLanguage(selectedLanguage);
    setRunResult(null);
    try {
      const response = await axiosClient.post(`/submission/submit/${problemId}`, { code, language: selectedLanguage });
      setSubmitResult(response.data);
      console.log(response.data);
      setActiveLeftTab('submissionResult');
    } catch (error) {
      console.error('Error submitting code:', error);
      setSubmitResult({ accepted: false, error: 'Submission Failed' });
      setActiveLeftTab('submissionResult');
    }
    setIsActionLoading(false);
  };

  // NEW: Handler to toggle the maximized panel
  const handleMaximizeToggle = (panelName) => {
    setMaximizedPanel(current => (current === panelName ? null : panelName));
  };


  if (isPageLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#1a1a1a]">
        <span className="loading loading-spinner loading-lg text-yellow-400"></span>
      </div>
    );
  }

  const leftPanelComponent = (
    <LeftPanel
      problem={problem}
      activeTab={activeLeftTab}
      onTabChange={setActiveLeftTab}
      submitResult={submitResult}
      problemId={problemId}
      code={finalCode}
      language={finalSelectedLanguage}
      onMaximize={() => handleMaximizeToggle('left')}
      isMaximized={maximizedPanel === 'left'}
    />
  );

  const editorPanelComponent = (
    <CodeEditorPanel
      selectedLanguage={selectedLanguage}
      onLanguageChange={setSelectedLanguage}
      code={code}
      onCodeChange={setCode}
      onEditorMount={(editor) => editorRef.current = editor}
      languageMap={languageMap}
      onMaximize={() => handleMaximizeToggle('editor')}
      isMaximized={maximizedPanel === 'editor'}
    />
  );
  
  const consolePanelComponent = (
    <ConsolePanel
      loading={isActionLoading}
      lastAction={lastAction}
      runResult={runResult}
      submitResult={submitResult}
      onMaximize={() => handleMaximizeToggle('console')}
      isMaximized={maximizedPanel === 'console'}
    />
  );

  return (
    <div className="text-white h-screen font-sans flex flex-col">
      <ProblemPageHeader
        user={user}
        loading={isActionLoading}
        onRun={handleRun}
        onSubmit={handleSubmitCode}
      />
      
      {/* MODIFIED: The main content area now renders based on the maximizedPanel state */}
      <main className="flex-1 overflow-hidden bg-[#0F0F0F]">
        {maximizedPanel ? (
          <div className="w-full h-full p-3">
            {maximizedPanel === 'left' && <div className="bg-[#1E1E1E] rounded-2xl h-full w-full">{leftPanelComponent}</div>}
            {maximizedPanel === 'editor' && <div className="bg-[#262626] rounded-2xl h-full w-full">{editorPanelComponent}</div>}
            {maximizedPanel === 'console' && <div className="bg-[#262626] rounded-2xl h-full w-full">{consolePanelComponent}</div>}
          </div>
        ) : (
          <PanelGroup direction="horizontal">
            <Panel defaultSize={50} minSize={30} className='border border-[#262626] bg-[#1E1E1E] rounded-2xl mr-1 mt-3 mb-3 ml-3'>
              {leftPanelComponent}
            </Panel>

            <PanelResizeHandle className="w-0.5 bg-transparent hover:bg-[#007BFF] active:bg-[#007BFF] transition-colors duration-200 mb-1"/>
            
            <Panel defaultSize={50} minSize={30}>
              <PanelGroup direction="vertical">
                <Panel defaultSize={60} minSize={20} className='border border-[#262626] bg-[#262626] rounded-2xl mr-3 mt-3 mb-1 ml-1'>
                  {editorPanelComponent}
                </Panel>
                
                <PanelResizeHandle className="h-0.5 bg-transparent hover:bg-[#007BFF] active:bg-[#007BFF] transition-colors duration-200 mb-1" />

                <Panel defaultSize={40} minSize={10} className='border border-[#262626] bg-[#262626] rounded-2xl mb-3 mr-3 ml-1'>
                  {consolePanelComponent}
                </Panel>
              </PanelGroup>
            </Panel>
          </PanelGroup>
        )}
      </main>
    </div>
  );
};
  
export default ProblemPage;