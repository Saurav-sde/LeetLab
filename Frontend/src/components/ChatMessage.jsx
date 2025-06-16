import { useState } from "react";
import { Bot, ThumbsUp, ThumbsDown, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Helper function to get user initials
const getInitials = (name = "") => {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
};

// This is our custom renderer for code blocks - It's already great!
const CodeBlock = ({ node, inline, className, children, ...props }) => {
    const [isCopied, setIsCopied] = useState(false);
    const match = /language-(\w+)/.exec(className || '');
    const codeString = String(children).replace(/\n$/, '');

    const handleCopy = () => {
        navigator.clipboard.writeText(codeString);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
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
            <SyntaxHighlighter
                style={vscDarkPlus}
                language={match[1]}
                PreTag="div"
                {...props}
            >
                {codeString}
            </SyntaxHighlighter>
        </div>
    ) : (
        <code className="bg-zinc-700 text-yellow-300 px-1 py-0.5 rounded-sm text-sm" {...props}>
            {children}
        </code>
    );
};

// The main message component
function ChatMessage({ msg, user }) {
    const [feedback, setFeedback] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const handleFeedback = (type) => {
        if (feedback) return;
        setFeedback(type);
        setShowConfirmation(true);
        setTimeout(() => setShowConfirmation(false), 3000);
    };

    if (msg.role === 'user') {
        return (
            <div className="flex items-start gap-4 justify-end">
                <div className="max-w-md md:max-w-lg p-3 rounded-lg bg-zinc-800">
                    <p className="whitespace-pre-wrap leading-relaxed text-gray-200">{msg.parts[0].text}</p>
                </div>
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-700 text-gray-300 flex items-center justify-center font-semibold text-sm">
                    {getInitials(user?.firstName)}
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-start gap-4 max-w-full">
            <div className="flex-shrink-0 w-8 h-8 mt-1 rounded-full bg-zinc-800 flex items-center justify-center">
                <Bot className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex flex-col gap-2 min-w-0 flex-1">
                {/* --- THIS IS THE UPDATED PART --- */}
                <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline">
                    <ReactMarkdown
                        components={{ code: CodeBlock }}
                    >
                        {msg.parts[0].text}
                    </ReactMarkdown>
                </div>
                <div className="flex items-center gap-3 mt-1">
                    <button
                        onClick={() => handleFeedback('up')}
                        disabled={feedback !== null}
                        className={`transition-colors ${
                            feedback === 'up' 
                                ? 'text-green-500' 
                                : 'text-gray-500 hover:text-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed'
                        }`}
                    >
                        <ThumbsUp size={16} />
                    </button>
                    <button
                        onClick={() => handleFeedback('down')}
                        disabled={feedback !== null}
                        className={`transition-colors ${
                            feedback === 'down' 
                                ? 'text-red-500' 
                                : 'text-gray-500 hover:text-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed'
                        }`}
                    >
                        <ThumbsDown size={16} />
                    </button>
                    {showConfirmation && (
                        <p className="text-sm text-gray-400">Thank you for your feedback!</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ChatMessage;