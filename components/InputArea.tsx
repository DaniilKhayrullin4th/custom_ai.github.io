import React, { useState } from 'react';
import { Send, Zap } from 'lucide-react';
import { Tone } from '../types';

interface InputAreaProps {
  onGenerate: (topic: string, tone: Tone) => void;
  isGenerating: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ onGenerate, isGenerating }) => {
  const [topic, setTopic] = useState('');
  const [selectedTone, setSelectedTone] = useState<Tone>(Tone.NEUTRAL);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && !isGenerating) {
      onGenerate(topic, selectedTone);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="bg-brand-panel border border-white/10 rounded-xl p-6 shadow-2xl relative overflow-hidden group">
        
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-20 h-20 bg-brand-neon/5 rounded-br-full -translate-x-10 -translate-y-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-500"></div>
        <div className="absolute bottom-0 right-0 w-20 h-20 bg-brand-hot/5 rounded-tl-full translate-x-10 translate-y-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-500"></div>

        <h2 className="text-lg font-display font-semibold text-gray-200 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-brand-neon" />
          Topic Briefing
        </h2>

        <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
          <div>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Paste a match result, player drama, or patch note here... (e.g. Spirit lost to G2 in semi-finals)"
              className="w-full h-32 bg-black/40 border border-white/20 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon transition-all resize-none font-sans"
              disabled={isGenerating}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2">
               {Object.values(Tone).map((tone) => (
                 <button
                  key={tone}
                  type="button"
                  onClick={() => setSelectedTone(tone)}
                  className={`px-3 py-1.5 rounded text-xs font-semibold tracking-wide uppercase transition-colors border ${
                    selectedTone === tone 
                    ? 'bg-brand-neon/20 border-brand-neon text-brand-neon shadow-[0_0_10px_rgba(6,182,212,0.3)]' 
                    : 'bg-transparent border-white/10 text-gray-500 hover:text-gray-300'
                  }`}
                 >
                   {tone.split(' ')[0]}
                 </button>
               ))}
            </div>

            <button
              type="submit"
              disabled={!topic.trim() || isGenerating}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold uppercase tracking-wider transition-all
                ${!topic.trim() || isGenerating 
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                  : 'bg-brand-hot text-white hover:bg-rose-600 shadow-lg shadow-rose-900/20 active:scale-95'
                }`}
            >
              {isGenerating ? (
                <>Processing...</>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Generate Take
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};