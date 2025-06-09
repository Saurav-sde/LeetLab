import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";
import { Send, Bot, ThumbsUp, ThumbsDown, Copy } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

// Helper function to get user initials
const getInitials = (name = "") => {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
};

function ChatAi({ problem }) {
    // --- CORE LOGIC REMAINS UNCHANGED ---
    const { user } = useSelector((state) => state.auth);
    const [messages, setMessages] = useState([
        { role: 'model', parts: [{ text: `Hi ${user?.firstName}, how can I help you with this problem?` }] }
    ]);
    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
      defaultValues: { message: "" }
    });
    const messageValue = watch("message");
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages]);

    const onSubmit = async (data) => {
        if (!data.message.trim()) return;
        const newUserMessage = { role: 'user', parts: [{ text: data.message }] };
        const currentMessages = [...messages, newUserMessage];
        
        setMessages(currentMessages);
        reset();

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
        }
    };
    // --- END OF UNCHANGED LOGIC ---

    return (
        <div className="flex flex-col h-screen max-h-[80vh] min-h-[500px] bg-[#1A1A1A] text-gray-300 font-sans">
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
                            className={`flex items-start gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            {/* AI 'Model' Message Style */}
                            {msg.role === 'model' && (
                                <div className="flex items-start gap-4 max-w-full">
                                    <div className="flex-shrink-0 w-8 h-8 mt-1 rounded-full bg-zinc-800 flex items-center justify-center">
                                        <Bot className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <p className="whitespace-pre-wrap leading-relaxed text-gray-200">
                                            {msg.parts[0].text}
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <button className="text-gray-500 hover:text-gray-300 transition-colors"><ThumbsUp size={16} /></button>
                                            <button className="text-gray-500 hover:text-gray-300 transition-colors"><ThumbsDown size={16} /></button>
                                            <button className="text-gray-500 hover:text-gray-300 transition-colors"><Copy size={16} /></button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* User Message Style */}
                            {msg.role === 'user' && (
                                <>
                                    <div className="max-w-md md:max-w-lg p-3 rounded-lg bg-zinc-800">
                                        <p className="whitespace-pre-wrap leading-relaxed text-gray-200">{msg.parts[0].text}</p>
                                    </div>
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-700 text-gray-300 flex items-center justify-center font-semibold text-sm">
                                        {getInitials(user?.firstName)}
                                    </div>
                                </>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form Area - Styled to match the image */}
            <div className="p-4 pt-2">
                <form onSubmit={handleSubmit(onSubmit)} className="relative">
                    <textarea
                        placeholder="Ask your doubt"
                        className="w-full h-28 p-4 pr-16 bg-zinc-800 border border-yellow-500/50 rounded-xl resize-none text-gray-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-all"
                        {...register("message")}
                        maxLength={3000}
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
                        className="absolute bottom-3 right-4 btn btn-circle btn-sm bg-yellow-600 hover:bg-yellow-500 border-none cursor-pointer"
                        disabled={!messageValue.trim()}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleSubmit(onSubmit)}
                    >
                        <Send size={16} className="text-white" />
                    </motion.button>
                </form>
            </div>
        </div>
    );
}

export default ChatAi;