import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import Editor from '@monaco-editor/react';
import { useParams } from 'react-router';
import axiosClient from "../utils/axiosClient";
import SubmissionHistory from '../components/SubmissionHistory';
import ChatAi from '../components/ChatAi';
import SolutionCard from '../components/SolutionCard';

// Importing icons from react-icons
import { FiSettings, FiMaximize, FiChevronLeft, FiChevronRight, FiClock } from 'react-icons/fi';
import { FaCheckCircle, FaTimesCircle, FaAngleDown, FaCode } from 'react-icons/fa';
import { BsLightningChargeFill, BsList, BsCpu } from "react-icons/bs";

// import resizable panel components
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";


const ProblemPage2 = () => {
  const { user } = useSelector((state) => state.auth);
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('cpp');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  
  const [lastAction, setLastAction] = useState(null); 
  const [activeResultCase, setActiveResultCase] = useState(0); 

  const editorRef = useRef(null);
  let { problemId } = useParams();

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get(`/problem/problemById/${problemId}`);
        if (!response.data.difficulty) {
            response.data.difficulty = "Easy"; 
        }
        setProblem(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching problem:', error);
        setLoading(false);
      }
    };
    fetchProblem();
  }, [problemId]);

  const languageMap = { cpp: "C++", java: "Java", javascript: "JavaScript" };

  useEffect(() => {
    if (problem) {
      const initialCode = problem.startCode.find(sc => sc.language === languageMap[selectedLanguage])?.initialCode || '';
      setCode(initialCode);
    }
  }, [selectedLanguage, problem]);

  const handleEditorChange = (value) => setCode(value || '');
  const handleEditorDidMount = (editor) => editorRef.current = editor;
  const handleLanguageChange = (language) => setSelectedLanguage(language);

  const handleLanguageSelect = (language) => {
      handleLanguageChange(language);
      if (document.activeElement) {
        document.activeElement.blur();
      }
  };

  const handleRun = async () => {
    setLoading(true);
    setLastAction('run');
    setSubmitResult(null); // Clear previous submission result
    try {
      const response = await axiosClient.post(`/submission/run/${problemId}`, { code, language: selectedLanguage });
      setRunResult(response.data);
    } catch (error) {
      console.error('Error running code:', error);
      setRunResult({ success: false, error: 'Execution Failed', testCases: [] });
    }
    setActiveResultCase(0);
    setLoading(false);
  };

  // --- MODIFIED: handleSubmitCode now updates the activeLeftTab ---
  const handleSubmitCode = async () => {
    setLoading(true);
    setLastAction('submit');
    setRunResult(null); // Clear previous run result
    try {
      const response = await axiosClient.post(`/submission/submit/${problemId}`, { code, language: selectedLanguage });
      setSubmitResult(response.data);
      setActiveLeftTab('submissionResult'); // Switch to the new result tab
    } catch (error) {
      console.error('Error submitting code:', error);
      const errorResult = { accepted: false, error: 'Submission Failed' };
      setSubmitResult(errorResult);
      setActiveLeftTab('submissionResult'); // Also switch to result tab on error
    }
    setLoading(false);
  };
  
  const renderDescription = (text = '') => {
    return text.split(/(`[^`]+`|\*[^*]+\*)/g).map((part, index) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={index} className="bg-gray-700 text-yellow-300 rounded-md px-1.5 py-0.5 text-sm font-mono">{part.slice(1, -1)}</code>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <strong key={index} className="font-semibold text-gray-100">{part.slice(1, -1)}</strong>
      }
      return part;
    });
  };

  const getLanguageForMonaco = (lang) => {
      switch (lang) {
          case 'javascript': return 'javascript';
          case 'java': return 'java';
          case 'cpp': return 'cpp';
          default: return 'javascript';
      }
  };

  const getDifficultyStyles = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-900/50 text-green-400 border border-green-700';
      case 'medium': return 'bg-yellow-900/50 text-yellow-400 border border-yellow-700';
      case 'hard': return 'bg-red-900/50 text-red-400 border border-red-700';
      default: return 'bg-gray-700 text-gray-300';
    }
  };
  
  if (loading && !problem) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#1a1a1a]">
        <span className="loading loading-spinner loading-lg text-yellow-400"></span>
      </div>
    );
  }

  const LeftPanelTab = ({ name, label, icon }) => (
    <button
      className={`px-3 py-2 text-m font-medium transition-colors duration-200 cursor-pointer flex items-center gap-2 ${
        activeLeftTab === name
          ? 'text-yellow-400 border-b-2 border-yellow-500'
          : 'text-gray-400 hover:text-white'
      }`}
      onClick={() => setActiveLeftTab(name)}
    >
      {icon}
      {label}
    </button>
  );

  const renderResultCaseDetails = (testCase) => (
    <div className="space-y-4 text-sm mt-4 font-mono">
      <div>
        <p className="text-gray-400 text-xs mb-1 font-sans">Input</p>
        <div className="bg-[#1a1a1a] p-3 rounded-md text-gray-200 w-full whitespace-pre-wrap">{testCase.stdin}</div>
      </div>
      <div>
        <p className="text-gray-400 text-xs mb-1 font-sans">Your Output</p>
        <div className="bg-[#1a1a1a] p-3 rounded-md text-gray-200 w-full whitespace-pre-wrap">{testCase.stdout}</div>
      </div>
      <div>
        <p className="text-gray-400 text-xs mb-1 font-sans">Expected Output</p>
        <div className="bg-[#1a1a1a] p-3 rounded-md text-gray-200 w-full whitespace-pre-wrap">{testCase.expected_output}</div>
      </div>
    </div>
  );
  
  // --- NEW: A component to render the detailed submission result view ---
  const SubmissionResultView = ({ result }) => {
    if (!result) return null;
    return (
        <div className="w-full">
            {result.accepted ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-10">
                    <FaCheckCircle className="text-green-400 text-7xl mx-auto mb-5" />
                    <h2 className="text-4xl font-bold text-green-400">Accepted</h2>
                    <p className="text-gray-400 mt-2">Congratulations! Your solution passed all test cases.</p>
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md mx-auto">
                        <div className="bg-[#282828] p-4 rounded-lg flex items-center gap-4 border border-zinc-700">
                            <FiClock className="text-2xl text-gray-400"/>
                            <div>
                                <p className="text-gray-400 text-sm">Runtime</p>
                                <p className="text-white text-lg font-semibold">{result.runtime} s</p>
                            </div>
                        </div>
                        <div className="bg-[#282828] p-4 rounded-lg flex items-center gap-4 border border-zinc-700">
                            <BsCpu className="text-2xl text-gray-400"/>
                            <div>
                                <p className="text-gray-400 text-sm">Memory</p>
                                <p className="text-white text-lg font-semibold">{result.memory} KB</p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className='w-full text-left'>
                    <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-3xl font-bold flex items-center gap-2 text-red-400">
                            <FaTimesCircle/>
                            {result.error || 'Wrong Answer'}
                        </h3>
                    </div>
                    {(result.passedTestCases !== undefined && result.totalTestCases) &&
                        <div className="mb-6">
                            <div className="flex justify-between items-center text-sm font-medium">
                                <span className="text-gray-300">Testcases Passed</span>
                                <span className="text-white">{result.passedTestCases} / {result.totalTestCases}</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                                <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(result.passedTestCases / result.totalTestCases) * 100}%` }}></div>
                            </div>
                        </div>
                    }
                    {result.testCase ? (
                        renderResultCaseDetails(result.testCase)
                    ) : (
                        result.error && (
                            <div className="bg-[#282828] p-4 rounded-md text-red-300 font-mono border border-red-500/30">
                                <p className="font-sans font-semibold text-red-300 mb-2">Error Details:</p>
                                <pre className="whitespace-pre-wrap">{result.errorDetails || result.error}</pre>
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
};


  return (
    <div className="bg-[#1a1a1a] text-white h-screen font-sans flex flex-col">
      {/* Top Navbar */}
      <header className="bg-[#282828] flex items-center justify-between px-4 py-2 border-b border-gray-700 h-[48px] flex-shrink-0">
        <div className="flex items-center gap-4">
          <BsLightningChargeFill className="text-orange-400 text-2xl" />
          <div className="flex items-center gap-2 text-gray-400">
            <BsList className="cursor-pointer hover:text-white"/>
            <span>Problem List</span>
          </div>
          <div className="flex items-center gap-3 text-gray-400">
            <FiChevronLeft className="cursor-pointer hover:text-white"/>
            <FiChevronRight className="cursor-pointer hover:text-white"/>
          </div>
        </div>
        <div className="flex items-center gap-4">
            <button className={`btn btn-sm bg-gray-600 hover:bg-gray-500 text-white border-0 ${loading?'loading':''}`} onClick={handleRun} disabled={loading}>Run</button>
            <button className={`btn btn-sm bg-green-600 hover:bg-green-700 text-white border-0 ${loading?'loading':''}`} onClick={handleSubmitCode} disabled={loading}>Submit</button>
        </div>
        <div className="flex items-center gap-4">
            <button className="btn btn-sm bg-orange-500 text-white border-0">Premium</button>
            <button className='btn btn-ghost'>{user?.firstName}</button>
        </div>
      </header>
      
      <main className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          {/* Left Panel */}
          <Panel defaultSize={50} minSize={30}>
            <div className="h-full flex flex-col border-r border-gray-700 overflow-hidden">
              <div className="flex-shrink-0 px-4 border-b border-gray-700 min-h-13">
                {/* --- MODIFIED: Tab bar now conditionally renders the "Result" tab --- */}
                <div className="flex items-center space-x-4">
                  <LeftPanelTab name="description" label="Description" />
                  <LeftPanelTab name="editorial" label="Editorial" />
                  <LeftPanelTab name="solutions" label="Solutions" />
                  <LeftPanelTab name="submissions" label="Submissions" />
                  <LeftPanelTab name="chatAI" label="ChatAI" />
                  {submitResult && (
                    <LeftPanelTab name="submissionResult" label="Result" icon={<BsCpu className="text-lg" />} />
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {problem && (
                  <>
                    {activeLeftTab === 'description' && (
                      <div className="space-y-8">
                        <h1 className="text-3xl font-bold text-gray-50">{problem.title}</h1>
                        <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getDifficultyStyles(problem.difficulty)}`}>
                                {problem.difficulty}
                            </span>
                            {problem.tags && (
                              <div className="badge badge-outline border-zinc-600 text-zinc-400">{problem.tags}</div>
                            )}
                        </div>
                        <div className="text-base text-gray-300 leading-relaxed space-y-4">
                            {renderDescription(problem.description)}
                        </div>
                        <div className="space-y-6">
                          {problem.visibleTestCases.map((example, index) => (
                            <div key={index}>
                              <p className="font-semibold text-gray-100 mb-3 text-lg">Example {index + 1}:</p>
                              <div className="bg-[#282828] p-4 rounded-lg text-sm font-mono space-y-3 border border-zinc-700">
                                <div><strong className="text-gray-400 font-medium">Input:</strong> {example.input}</div>
                                <div><strong className="text-gray-400 font-medium">Output:</strong> {example.output}</div>
                                {example.explanation && <div><strong className="text-gray-400 font-medium">Explanation:</strong> <span className="whitespace-pre-wrap">{example.explanation}</span></div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {activeLeftTab === 'editorial' && <div className="prose max-w-none"><h2 className="text-xl font-bold mb-4">Editorial</h2><div className="whitespace-pre-wrap text-sm leading-relaxed">{'Editorial is here for the problem'}</div></div>}
                    {activeLeftTab === 'solutions' && (
                      <div>
                        <h2 className="text-2xl font-bold mb-6 text-slate-100 border-b border-zinc-700 pb-3">Reference Solutions</h2>
                        <div className="space-y-8">
                          {problem.referenceSolution && problem.referenceSolution.length > 0 ? (
                            problem.referenceSolution.map((solution, index) => <SolutionCard key={index} language={solution.language} completeCode={solution.completeCode} />)
                          ) : (
                            <div className="flex flex-col items-center justify-center text-center pt-10"><div className="p-12 bg-zinc-800 rounded-lg border border-dashed border-zinc-700"><h3 className="text-lg font-semibold text-slate-400">No Solutions Available Yet</h3><p className="text-zinc-500 mt-2">Solutions will be available after you solve the problem. Keep trying!</p></div></div>
                          )}
                        </div>
                      </div>
                    )}
                    {activeLeftTab === 'submissions' && <SubmissionHistory problemId={problemId} />}
                    {activeLeftTab === 'chatAI' && <ChatAi problem={problem} />}
                    
                    {/* --- NEW: Content for the "Result" tab --- */}
                    {activeLeftTab === 'submissionResult' && <SubmissionResultView result={submitResult} />}
                  </>
                )}
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className="w-1 bg-transparent hover:bg-yellow-500/50 active:bg-yellow-500 transition-colors duration-200" />
          
          <Panel defaultSize={50} minSize={30}>
            <PanelGroup direction="vertical">
              <Panel defaultSize={60} minSize={20}>
                <div className="h-full flex flex-col">
                    <div className="flex-shrink-0 flex justify-between items-center px-3 py-2 bg-[#282828] border-b border-gray-700 min-h-13">
                        <div className="dropdown">
                          <label tabIndex={0} className="btn btn-sm btn-outline btn-warning text-md normal-case hover:btn-active hover:text-white">
                              <strong>{languageMap[selectedLanguage]}</strong>
                              <FaAngleDown/>
                          </label>
                          <ul tabIndex={0} className="dropdown-content menu p-2 mt-1 shadow-lg bg-[#2D2D2D] text-gray-300 rounded-md w-40 z-[1]">
                              <li><a onClick={() => handleLanguageSelect('cpp')} className="hover:bg-neutral-700 hover:text-white rounded-md">C++</a></li>
                              <li><a onClick={() => handleLanguageSelect('java')} className="hover:bg-neutral-700 hover:text-white rounded-md">Java</a></li>
                              <li><a onClick={() => handleLanguageSelect('javascript')} className="hover:bg-neutral-700 hover:text-white rounded-md">JavaScript</a></li>
                          </ul>
                        </div>
                        <div className="flex items-center gap-3 text-gray-400 text-lg">
                            <FiSettings className="cursor-pointer hover:text-white"/>
                            <FiMaximize className="cursor-pointer hover:text-white"/>
                        </div>
                    </div>
                    <div className="flex-1 bg-[#1e1e1e]">
                      <Editor
                        height="100%"
                        language={getLanguageForMonaco(selectedLanguage)}
                        value={code}
                        onChange={handleEditorChange}
                        onMount={handleEditorDidMount}
                        theme="vs-dark"
                        options={{ fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false, automaticLayout: true, tabSize: 2, insertSpaces: true, wordWrap: 'on', lineNumbers: 'on', glyphMargin: false, folding: true, lineDecorationsWidth: 10, lineNumbersMinChars: 3, renderLineHighlight: 'line', selectOnLineNumbers: true, roundedSelection: false, readOnly: false, cursorStyle: 'line', mouseWheelZoom: true }}
                      />
                    </div>
                </div>
              </Panel>
              
              <PanelResizeHandle className="h-1 bg-transparent hover:bg-yellow-500/50 active:bg-yellow-500 transition-colors duration-200" />

              {/* Console Panel */}
              <Panel defaultSize={40} minSize={10}>
                <div className="h-full flex flex-col bg-[#282828] font-sans">
                  <div className="flex-shrink-0 flex items-center justify-between px-4 py-1 border-b border-gray-700">
                      <p className="text-sm font-medium text-gray-300">Console</p>
                      <div className="flex items-center gap-3 text-gray-400 text-lg">
                          <FiMaximize className="cursor-pointer hover:text-white" />
                      </div>
                  </div>
                  
                  <div className="flex-1 bg-[#1a1a1a] overflow-y-auto p-4">
                    {!lastAction && !loading && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <FaCode className="text-4xl mb-3"/>
                            <p className="text-center">Your code's output will appear here.</p>
                            <p className="text-xs text-center mt-1">Click "Run" to test against examples, or "Submit" to judge.</p>
                        </div>
                    )}
                    {loading && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                          <span className="loading loading-spinner loading-md mb-3"></span>
                          <p className="text-lg font-medium animate-pulse">
                            {lastAction === 'run' ? 'Executing...' : 'Judging...'}
                          </p>
                        </div>
                    )}
                    {lastAction === 'run' && !loading && runResult && (
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <h3 className={`text-2xl font-semibold flex items-center gap-2 ${runResult.success ? 'text-green-400' : 'text-red-400'}`}>
                            {runResult.success ? <FaCheckCircle/> : <FaTimesCircle/>}
                            {runResult.success ? 'Accepted' : 'Wrong Answer'}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 mb-4 flex-wrap">
                          {runResult.testCases.map((tc, index) => (
                            <button
                              key={index}
                              onClick={() => setActiveResultCase(index)}
                              className={`btn btn-sm normal-case font-medium border-2 ${
                                activeResultCase === index 
                                  ? (tc.status_id === 3 ? 'btn-success text-white' : 'btn-error text-white')
                                  : (tc.status_id === 3 ? 'border-green-500/50 text-green-400' : 'border-red-500/50 text-red-400')
                              } ${activeResultCase !== index && 'bg-transparent hover:bg-gray-700'}`}
                            >
                              Case {index + 1}
                            </button>
                          ))}
                        </div>
                        {runResult.testCases[activeResultCase] && renderResultCaseDetails(runResult.testCases[activeResultCase])}
                      </div>
                    )}
                    {/* --- MODIFIED: Console now shows a simple message on submit --- */}
                    {lastAction === 'submit' && !loading && submitResult && (
                         <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <FaCheckCircle className="text-4xl mb-3 text-green-500"/>
                            <p className="text-lg font-medium">Submission complete.</p>
                            <p className="text-center text-gray-500 mt-1">
                                View the detailed results in the <strong className="text-yellow-400">Result</strong> tab on the left.
                            </p>
                        </div>
                    )}
                  </div>
                </div>
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </main>
    </div>
  );
};
  
export default ProblemPage2;