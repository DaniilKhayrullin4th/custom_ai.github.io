import React, { useState } from 'react';
import { Header } from './components/Header';
import { InputArea } from './components/InputArea';
import { OutputDisplay } from './components/OutputDisplay';
import { generateScript } from './services/geminiService';
import { ScriptData, Tone } from './types';

export default function App() {
  const [scriptData, setScriptData] = useState<ScriptData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (topic: string, tone: Tone) => {
    setIsGenerating(true);
    try {
      const generatedText = await generateScript(topic, tone);
      
      setScriptData({
        title: topic.substring(0, 30) + "...",
        content: generatedText,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error("Failed to generate script:", error);
      alert("Failed to generate content. Please check your connection or API limit.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col font-sans selection:bg-brand-neon selection:text-black">
      <Header />
      
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 relative">
        {/* Background Grid Decoration */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0" 
             style={{
               backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
               backgroundSize: '40px 40px'
             }}>
        </div>

        <div className="relative z-10 flex flex-col gap-8">
          
          <div className="text-center mb-4">
             <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-2">
               Create <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-neon to-brand-accent">God-Tier</span> Analysis
             </h2>
             <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto">
               Turn raw match stats and reddit drama into professional, engaging esports commentary scripts in seconds.
             </p>
          </div>

          <InputArea 
            onGenerate={handleGenerate} 
            isGenerating={isGenerating} 
          />
          
          <OutputDisplay data={scriptData} />
          
        </div>
      </main>

      <footer className="w-full py-6 text-center text-gray-600 text-xs font-mono border-t border-white/5">
        <p>POWERED BY GEMINI 2.5 FLASH & PREVIEW TTS</p>
      </footer>
    </div>
  );
}