import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Loader2, Volume2, Copy, Check } from 'lucide-react';
import { generateAudio } from '../services/geminiService';
import { ScriptData } from '../types';

interface OutputDisplayProps {
  data: ScriptData | null;
}

export const OutputDisplay: React.FC<OutputDisplayProps> = ({ data }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [sourceNode, setSourceNode] = useState<AudioBufferSourceNode | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Reset audio state when new data arrives
  useEffect(() => {
    if (sourceNode) {
      try { sourceNode.stop(); } catch (e) {}
    }
    setAudioBuffer(null);
    setIsPlaying(false);
    setAudioContext(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const handlePlayAudio = async () => {
    if (!data) return;

    // If already playing, stop it
    if (isPlaying && sourceNode) {
      try {
        sourceNode.stop();
      } catch (e) {
        console.warn("Error stopping audio", e);
      }
      setIsPlaying(false);
      return;
    }

    try {
      let ctx = audioContext;
      if (!ctx) {
        ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        setAudioContext(ctx);
      }

      // Resume context if suspended (browser policy)
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      let buffer = audioBuffer;

      // Fetch if we don't have it
      if (!buffer) {
        setIsLoadingAudio(true);
        buffer = await generateAudio(data.content);
        setAudioBuffer(buffer);
        setIsLoadingAudio(false);
      }

      // Play
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.onended = () => setIsPlaying(false);
      
      source.start();
      setSourceNode(source);
      setIsPlaying(true);

    } catch (error) {
      console.error("Audio playback error:", error);
      setIsLoadingAudio(false);
      setIsPlaying(false);
      alert("Could not generate or play audio. Please try again.");
    }
  };

  const copyToClipboard = () => {
    if (data?.content) {
      navigator.clipboard.writeText(data.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!data) {
    return (
      <div className="w-full max-w-2xl mx-auto text-center py-20 opacity-50">
        <div className="inline-block p-4 rounded-full bg-white/5 mb-4 border border-white/10 border-dashed">
          <Volume2 className="w-8 h-8 text-gray-500" />
        </div>
        <p className="text-gray-400 font-mono text-sm">Waiting for input stream...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in-up">
      <div className="bg-brand-panel border border-brand-neon/30 rounded-xl overflow-hidden shadow-2xl">
        
        {/* Header Bar */}
        <div className="bg-black/40 px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></div>
            <span className="font-mono text-xs text-brand-neon tracking-widest uppercase">
              {isPlaying ? 'ON AIR' : 'SCRIPT READY'}
            </span>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={copyToClipboard}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
              title="Copy Script"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 font-sans text-lg leading-relaxed text-gray-200 whitespace-pre-wrap selection:bg-brand-neon/30 selection:text-white relative">
           {/* Teleprompter Visual Aid Line */}
           <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-brand-neon/0 via-brand-neon/20 to-brand-neon/0"></div>
           
           {data.content}
        </div>

        {/* Action Bar */}
        <div className="bg-black/20 p-4 border-t border-white/5 flex justify-center">
          <button
            onClick={handlePlayAudio}
            disabled={isLoadingAudio}
            className={`
              flex items-center gap-3 px-8 py-3 rounded-full font-bold transition-all
              ${isPlaying 
                ? 'bg-brand-hot text-white hover:bg-rose-600 shadow-[0_0_20px_rgba(244,63,94,0.4)]' 
                : 'bg-brand-neon text-brand-dark hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
              }
              ${isLoadingAudio ? 'opacity-80 cursor-wait' : ''}
            `}
          >
            {isLoadingAudio ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current" />
            )}
            <span className="uppercase tracking-wider">
              {isLoadingAudio ? 'Synthesizing Voice...' : isPlaying ? 'Stop Voice' : 'Play Voiceover'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};