import { useState } from "react";
import { Bot, ThumbsUp, ThumbsDown, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Helper function - no changes needed
const getInitials = (name = "") => {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
};

// Custom CodeBlock renderer - no changes needed, it's already perfect!
const CodeBlock = ({ node, inline, className, children, ...props }) => {
    const [isCopied, setIsCopied] = useState(false);
    const match = /language-(\w+)/.exec(className || '');
    const codeString = String(children).replace(/\n$/, '');

    const handleCopy = () => {
        navigator.clipboard.writeText(codeString);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return !inline && match ? (
        <div className="my-4 rounded-lg bg-[#0D0D0D] overflow-hidden border border-zinc-800">
            <div className="flex justify-between items-center px-4 py-1 bg-zinc-800 text-xs text-gray-400">
                <span>{match[1]}</span>
                <button onClick={handleCopy} className="flex items-center gap-1.5 p-1 rounded-md hover:bg-zinc-700 transition-colors">
                    {isCopied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                    {isCopied ? 'Copied!' : 'Copy'}
                </button>
            </div>
            <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" {...props}>
                {codeString}
            </SyntaxHighlighter>
        </div>
    ) : (
        <code className="bg-zinc-700 text-yellow-300 px-1 py-0.5 rounded-sm text-sm" {...props}>
            {children}
        </code>
    );
};


// ====================================================================
// =================== THE REFACTORED COMPONENT =======================
// ====================================================================
function ChatMessage({ msg, user }) {
    const [feedback, setFeedback] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const handleFeedback = (type) => {
        if (feedback) return;
        setFeedback(type);
        setShowConfirmation(true);
        setTimeout(() => setShowConfirmation(false), 3000);
    };

    // --- User Message ---
    // Minor tweaks for better visual distinction (e.g., color and border radius)
    if (msg.role === 'user') {
        return (
            <div className="flex items-start gap-4 justify-end">
                <div className="max-w-xl p-4 rounded-xl bg-blue-600 text-white">
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.parts[0].text}</p>
                </div>
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-zinc-700 text-gray-300 flex items-center justify-center font-bold text-sm border-2 border-zinc-600">
                    {getInitials(user?.firstName)}
                </div>
            </div>
        );
    }

    // --- Bot (Model) Message ---
    // This is where the main UI changes are applied.
    return (
        <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 mt-1 rounded-full bg-zinc-800 flex items-center justify-center border-2 border-zinc-700">
                <Bot className="w-6 h-6 text-gray-400" />
            </div>
            
            <div className="flex flex-col gap-2 min-w-0 flex-1">
                {/* 1. The Message Bubble: We wrap the content in a styled container */}
                <div className="p-4 rounded-xl bg-zinc-800 border border-zinc-700 prose prose-invert max-w-none prose-p:leading-relaxed prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline">
                    <ReactMarkdown components={{ code: CodeBlock }}>
                        {msg.parts[0].text}
                    </ReactMarkdown>
                </div>

                {/* 2. The Feedback Actions: Moved outside and below the bubble for a cleaner look */}
                <div className="flex items-center gap-3 text-sm">
                    <button
                        onClick={() => handleFeedback('up')}
                        disabled={feedback !== null}
                        className={`p-1 rounded-md transition-colors ${
                            feedback === 'up' 
                                ? 'text-green-500 bg-green-500/10' 
                                : 'text-gray-400 hover:text-gray-200 hover:bg-zinc-700 disabled:text-gray-600 disabled:cursor-not-allowed'
                        }`}
                    >
                        <ThumbsUp size={16} />
                    </button>
                    <button
                        onClick={() => handleFeedback('down')}
                        disabled={feedback !== null}
                        className={`p-1 rounded-md transition-colors ${
                            feedback === 'down' 
                                ? 'text-red-500 bg-red-500/10' 
                                : 'text-gray-400 hover:text-gray-200 hover:bg-zinc-700 disabled:text-gray-600 disabled:cursor-not-allowed'
                        }`}
                    >
                        <ThumbsDown size={16} />
                    </button>
                    {showConfirmation && (
                        <p className="text-gray-500 animate-pulse">Thank you for your feedback!</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ChatMessage;