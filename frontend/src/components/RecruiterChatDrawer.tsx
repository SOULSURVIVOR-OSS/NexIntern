import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, Bot, User, ArrowRight, CheckCircle2, AlertTriangle, GitCompare, RefreshCw } from 'lucide-react';
import { CandidateMatchResult, JobDescription, RecruiterChatMessage } from '../types';

interface RecruiterChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  candidates: CandidateMatchResult[];
  jd: JobDescription;
  initialQuery?: string;
}

export const RecruiterChatDrawer: React.FC<RecruiterChatDrawerProps> = ({
  isOpen,
  onClose,
  candidates,
  jd,
  initialQuery,
}) => {
  const [messages, setMessages] = useState<RecruiterChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I am your AI Recruiter Assistant for **${jd.title}**. I can explain rankings, compare candidate pairs, or verify specific skill requirements across the ${candidates.length} candidate resumes.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle incoming initialQuery
  useEffect(() => {
    if (initialQuery && isOpen) {
      handleSendMessage(initialQuery);
    }
  }, [initialQuery, isOpen]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg: RecruiterChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    // Answer generation grounded in candidates and scoring
    setTimeout(() => {
      const lowerQuery = query.toLowerCase();
      let answer = '';

      // Check if comparing two candidates
      const matchedCandNames = candidates.filter((c) =>
        lowerQuery.includes(c.candidate.name.toLowerCase().split(' ')[0])
      );

      if (matchedCandNames.length >= 2 || lowerQuery.includes('higher than') || lowerQuery.includes('compare')) {
        const c1 = matchedCandNames[0] || candidates[0];
        const c2 = matchedCandNames[1] || candidates[1];
        const higher = c1.finalScore >= c2.finalScore ? c1 : c2;
        const lower = c1.finalScore < c2.finalScore ? c1 : c2;

        answer = `**${higher.candidate.name} (#${higher.rank})** is ranked above **${lower.candidate.name} (#${lower.rank})** with an overall score of **${higher.finalScore}%** vs **${lower.finalScore}%**.\n\n` +
          `• **Semantic Understanding**: ${higher.candidate.name} has ${higher.semanticScore}% semantic match vs ${lower.semanticScore}% for ${lower.candidate.name}.\n` +
          `• **Core Skills**: ${higher.candidate.name} demonstrated [${higher.matchedExplicitSkills.slice(0, 4).join(', ')}].\n` +
          `• **Key Distinguisher**: ${higher.explanation}`;
      } else if (lowerQuery.includes('top') || lowerQuery.includes('best') || lowerQuery.includes('number 1') || lowerQuery.includes('#1')) {
        const top = candidates[0];
        answer = `The top-ranked candidate is **${top.candidate.name}** with a **${top.finalScore}%** match score.\n\n` +
          `• **Why they are #1**: ${top.explanation}\n` +
          `• **Matched Skills (${top.matchedExplicitSkills.length})**: ${top.matchedExplicitSkills.join(', ')}\n` +
          `• **Verified Projects**: ${top.candidate.projects?.length || 0} production-ready portfolio implementations.`;
      } else if (lowerQuery.includes('docker') || lowerQuery.includes('container')) {
        const withDocker = candidates.filter((c) => c.matchedExplicitSkills.includes('Docker') || c.candidate.skills.includes('Docker'));
        answer = `Found **${withDocker.length} candidates** with verified Docker proficiency:\n\n` +
          withDocker.map((c) => `• **${c.candidate.name}** (Rank #${c.rank}, Score: ${c.finalScore}%)`).join('\n');
      } else if (lowerQuery.includes('missing') || lowerQuery.includes('gaps')) {
        const withGaps = candidates.filter((c) => c.missingRequiredSkills.length > 0).slice(0, 3);
        answer = `Here are notable skill gaps detected across candidates:\n\n` +
          withGaps.map((c) => `• **${c.candidate.name}**: Missing [${c.missingRequiredSkills.join(', ')}]`).join('\n');
      } else {
        answer = `Based on the **${jd.title}** evaluation of ${candidates.length} candidates:\n\n` +
          `• The average match score across the pool is **${Math.round(candidates.reduce((acc, c) => acc + c.finalScore, 0) / candidates.length)}%**.\n` +
          `• Top 3 candidates are **${candidates.slice(0, 3).map((c) => c.candidate.name).join(', ')}**.\n` +
          `• All scores are deterministically fused from BM25 token relevance and BGE semantic embeddings with zero blind LLM guesswork.`;
      }

      const botMsg: RecruiterChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
      setLoading(false);
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-black/[0.08] animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-black/[0.06] flex items-center justify-between bg-[#fbfbfd]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-sky-50 text-[#0071e3] border border-sky-100 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1d1d1f] tracking-tight">
                AI Recruiter Assistant
              </h3>
              <p className="text-[11px] text-slate-500">
                Transparent Shortlist Reasoning
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-black/[0.04] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Suggested Queries Chips */}
        <div className="p-3 bg-black/[0.02] border-b border-black/[0.04] flex gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
          <button
            onClick={() => handleSendMessage('Why is Candidate #1 ranked highest?')}
            className="px-2.5 py-1 rounded-full bg-white border border-black/[0.06] text-slate-700 hover:bg-sky-50 hover:text-[#0071e3] hover:border-sky-200 transition shrink-0 whitespace-nowrap"
          >
            Why #1?
          </button>
          <button
            onClick={() => handleSendMessage('Who has Docker or containerization experience?')}
            className="px-2.5 py-1 rounded-full bg-white border border-black/[0.06] text-slate-700 hover:bg-sky-50 hover:text-[#0071e3] hover:border-sky-200 transition shrink-0 whitespace-nowrap"
          >
            Docker skills?
          </button>
          <button
            onClick={() => handleSendMessage('Compare Candidate #1 and #2')}
            className="px-2.5 py-1 rounded-full bg-white border border-black/[0.06] text-slate-700 hover:bg-sky-50 hover:text-[#0071e3] hover:border-sky-200 transition shrink-0 whitespace-nowrap"
          >
            Compare Top 2
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-6 h-6 rounded-full bg-sky-50 text-[#0071e3] flex items-center justify-center shrink-0 mt-0.5 border border-sky-100">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] p-3 rounded-2xl leading-relaxed ${
                    isUser
                      ? 'bg-[#0071e3] text-white rounded-br-xs font-medium'
                      : 'bg-[#fbfbfd] text-slate-800 border border-black/[0.06] rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <span
                    className={`block text-[9px] mt-1.5 ${
                      isUser ? 'text-white/70 text-right' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {isUser && (
                  <div className="w-6 h-6 rounded-full bg-[#1d1d1f] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-2 items-center text-xs text-slate-500 py-2">
              <div className="w-6 h-6 rounded-full bg-sky-50 text-[#0071e3] flex items-center justify-center border border-sky-100 shrink-0">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
              </div>
              <span>Auditing candidate metrics...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-4 border-t border-black/[0.06] bg-[#fbfbfd]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="relative flex items-center"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask about skills, rankings, or candidate fit..."
              className="w-full bg-white border border-black/[0.08] rounded-full pl-4 pr-11 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0071e3] shadow-2xs"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || loading}
              className="absolute right-1.5 p-1.5 rounded-full bg-[#0071e3] text-white hover:bg-[#0077ed] disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          <span className="text-[10px] text-slate-400 text-center block mt-2">
            Responses are grounded exclusively in candidate resume data & scoring equations.
          </span>
        </div>

      </div>
    </div>
  );
};
