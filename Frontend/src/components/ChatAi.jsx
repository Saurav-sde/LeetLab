import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";
import { Send } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import ChatMessage from "./ChatMessage"; 

function ChatAi({ problem, messages, setMessages }) {
    const { user } = useSelector((state) => state.auth);
    
    const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm({
      defaultValues: { message: "" }
    });
    const messageValue = watch("message");
    const messagesEndRef = useRef(null);
    const [isAwaitingResponse, setIsAwaitingResponse] = useState(false);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages]);
    
    const onSubmit = async (data) => {
        if (!data.message.trim() || isAwaitingResponse) return;

        const newUserMessage = { role: 'user', parts: [{ text: data.message }] };
        const currentMessages = [...messages, newUserMessage];
        setMessages(currentMessages);
        
        reset();
        setIsAwaitingResponse(true);

        try {
            const response = await axiosClient.post("/ai/chat", {
                messages: currentMessages,
                title: problem.title,
                description: problem.description,
                testCases: problem.visibleTestCases,
                startCode: problem.startCode
            });

            setMessages(prev => [...prev, {
                role: 'model',
                parts: [{ text: response.data.message }]
            }]);
        } catch (error) {
            console.error("API Error:", error);
            setMessages(prev => [...prev, {
                role: 'model',
                parts: [{ text: "I'm sorry, I'm having trouble connecting right now. Please try again later." }]
            }]);
        } finally {
            setIsAwaitingResponse(false);
        }
    };

    return (
        <div className="flex flex-col h-screen max-h-[78vh] min-h-[500px] text-gray-300 font-sans">
            {/* Messages Display Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <AnimatePresence>
                    {messages.map((msg, index) => (
                        <motion.div
                            key={index}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                        >
                            <ChatMessage msg={msg} user={user} />
                        </motion.div>
                    ))}
                    {isAwaitingResponse && (
                         <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex justify-start"
                        >
                           <div className="text-gray-400 text-sm flex items-center gap-2 p-2 bg-zinc-800 rounded-md">
                                <span className="loading loading-dots loading-xs"></span>
                               <span>AI is thinking...</span>
                           </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 pt-2">
                <form onSubmit={handleSubmit(onSubmit)} className="relative">
                    <textarea
                        placeholder="Ask for a hint, explain a concept, or debug your code..."
                        className="w-full h-28 p-4 pr-16 bg-zinc-800 border border-yellow-500/50 rounded-xl resize-none text-gray-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-all"
                        {...register("message")}
                        maxLength={3000}
                        disabled={isAwaitingResponse}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(onSubmit)();
                            }
                        }}
                    />
                    <div className="absolute bottom-3 left-4 text-xs text-zinc-500">
                        {messageValue.length} / 3000
                    </div>
                    <motion.button
                        type="submit"
                        className="absolute bottom-3 right-4 btn btn-circle btn-sm bg-yellow-600 hover:bg-yellow-500 border-none disabled:bg-zinc-600 disabled:cursor-not-allowed"
                        disabled={!messageValue.trim() || isAwaitingResponse}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <Send size={16} className="text-white"/>
                    </motion.button>
                </form>
            </div>
        </div>
    );
}

export default ChatAi;