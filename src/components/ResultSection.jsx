import { History as HistoryIcon, Bot as BotIcon, User as UserIcon, Send as SendIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';

const ResultSection = ({ result, chatHistory, isChatting, chatMessage, setChatMessage, handleSendMessage }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isChatting, result]);

  return (
    <div className="flex flex-col h-full bg-[#0e1117] border border-white/8 rounded-2xl overflow-hidden">

      {/* Chat header */}
      <div className="px-6 py-4 border-b border-white/6 flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold text-sm">Analysis Output</h3>
          <p className="text-white/30 text-xs">Results will appear here after analysis</p>
        </div>
        {/* Clear / History button */}
        <button
          onClick={() => alert("History feature coming soon.")}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
        >
          <HistoryIcon className="w-4 h-4 text-white/40" />
        </button>
      </div>

      {/* Chat messages area — scrollable */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-3 md:gap-4 scrollbar-thin scrollbar-thumb-white/10"
      >

        {/* Empty state — when no messages */}
        {!result && chatHistory.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#00FF88]/10 flex items-center justify-center mb-3">
              <BotIcon className="w-5 h-5 md:w-6 md:h-6 text-[#00FF88]/60" />
            </div>
            <p className="text-white/20 text-xs md:text-sm">Upload a document and start analysis</p>
            <p className="text-white/10 text-[10px] md:text-xs mt-1">AI insights will appear here</p>
          </div>
        )}

        {/* Executive Summary automatically populated as the first interaction if result exists */}
        {result && (
          <div className="flex gap-2 md:gap-3">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#00FF88]/15 mt-1">
              <BotIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#00FF88]" />
            </div>
            <div className="max-w-[90%] md:max-w-[85%] px-3 py-2.5 md:px-4 md:py-3 rounded-xl text-xs md:text-sm leading-relaxed bg-white/5 border border-white/6 text-white/80">
              <div className="font-semibold text-[#00FF88] mb-2 md:mb-3 uppercase tracking-widest text-[10px] md:text-xs flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00FF88] animate-pulse"></div>
                Executive Summary
              </div>
              <div className="whitespace-pre-wrap">{result.summary}</div>
              {result.key_points && result.key_points.length > 0 && (
                <div className="mt-4 md:mt-5 space-y-1.5 md:space-y-2 border-t border-white/5 pt-3 md:pt-4">
                  {result.key_points.map((kp, i) => (
                    <div key={i} className="flex gap-2 text-xs md:text-sm text-white/70">
                      <span className="text-[#00FF88] mt-0.5 font-bold">›</span>
                      <span>{kp}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Message bubbles */}
        {chatHistory.map((msg, i) => (
          <div key={i} className={`flex gap-2 md:gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 ${msg.role === 'assistant' ? 'bg-[#00FF88]/15' : 'bg-white/10'
              }`}>
              {msg.role === 'assistant'
                ? <BotIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#00FF88]" />
                : <UserIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-white/60" />
              }
            </div>
            {/* Bubble */}
            <div className={`max-w-[88%] md:max-w-[80%] px-3 py-2.5 md:px-4 md:py-3 rounded-xl text-xs md:text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'assistant'
                ? 'bg-white/5 border border-white/6 text-white/80'
                : msg.role === 'error'
                  ? 'bg-red-500/10 border border-red-500/20 text-red-500'
                  : 'bg-[#00FF88]/10 border border-[#00FF88]/15 text-[#00FF88] font-medium'
              }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {isChatting && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#00FF88]/15">
              <BotIcon className="w-4 h-4 text-[#00FF88]" />
            </div>
            <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/6 flex items-center gap-1.5 h-10">
              <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce delay-100"></div>
              <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}
      </div>

      {/* Chat input — pinned to bottom */}
      <div className="p-3 md:p-4 border-t border-white/6">
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-2 md:gap-3 items-end bg-white/5 border border-white/8 rounded-xl px-3 py-2 md:px-4 md:py-3 focus-within:border-[#00FF88]/30 transition-all">
          <textarea
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            disabled={isChatting || !result}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            placeholder="Ask about your document..."
            rows={1}
            className="flex-1 bg-transparent text-white/80 text-xs md:text-sm resize-none outline-none placeholder-white/20 leading-relaxed py-1"
          />
          <button
            type="submit"
            disabled={isChatting || !chatMessage.trim() || !result}
            className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-[#00FF88] flex items-center justify-center flex-shrink-0 hover:bg-[#00ffaa] transition-all disabled:opacity-30 disabled:cursor-not-allowed mb-0.5"
          >
            <SendIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-black" />
          </button>
        </form>
        <p className="text-white/15 text-[9px] md:text-[10px] mt-1.5 md:mt-2 text-center">Analysis powered by Axon AI</p>
      </div>

    </div>
  );
};

export default ResultSection;
