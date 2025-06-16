import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FaRegCopy, FaCheck } from "react-icons/fa";


const codeTheme = {
  ...vscDarkPlus,
  'pre[class*="language-"]': {
    ...vscDarkPlus['pre[class*="language-"]'],
    backgroundColor: '#1E1E1E',
    padding: '1.25rem',
    borderRadius: '0 0 0.5rem 0.5rem',
    fontSize: '1rem', 
    lineHeight: '1.6', 
  },
  'code[class*="language-"]': {
    ...vscDarkPlus['code[class*="language-"]'],
    fontSize: '1rem', 
  },
};

// Language map for syntax highlighter
const lang  = {
    "C++" : "cpp",
    "Java" : 'java',
    "JavaScript" : 'javascript',
    "c++" : "cpp",
    "java" : "java",
    "javascript": "javascript",
    "cpp" : "cpp"
}

const SolutionCard = ({language, completeCode}) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (!completeCode) return; // Prevent copying empty string
    navigator.clipboard.writeText(completeCode);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <div className="border border-zinc-700/80 rounded-lg shadow-lg bg-[#1E1E1E]">
      <div className="flex justify-between items-center bg-[#252526] px-4 py-3 rounded-t-lg border-b border-zinc-700/80">
        <h3 className="text-slate-300 font-medium text-base">
          <span className="font-semibold text-slate-100">{language}</span>
        </h3>
        <button
          onClick={handleCopy}
          className={`flex items-center space-x-2 px-4 py-2 text-sm rounded-md transition-all duration-200 border ${
            isCopied
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-transparent text-slate-300 border-zinc-600 hover:bg-zinc-700 hover:border-zinc-500'
          }`}
        >
          {isCopied ? <FaCheck size="1em" /> : <FaRegCopy size="1em" />}
          <span>{isCopied ? 'Copied!' : 'Copy Code'}</span>
        </button>
      </div>

      <SyntaxHighlighter
        language={lang[language]}
        style={codeTheme}
        showLineNumbers={true}
        lineNumberStyle={{ color: '#6e7681', paddingRight: '1em' }}
        wrapLines={true}
      >
        {String(completeCode).trim()}
      </SyntaxHighlighter>
    </div>
  );
};

export default SolutionCard;