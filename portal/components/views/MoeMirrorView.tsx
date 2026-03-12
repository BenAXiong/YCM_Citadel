"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, Bookmark, ChevronRight, Info, Book, Globe, 
  MessageSquare, Grid, MoreHorizontal, Share2, 
  Check, Copy, Database, Layers, Beaker, FlaskConical,
  ArrowRight, List, X, ExternalLink
} from "lucide-react";

interface MoeEntry {
  dict_code: string;
  word_ab: string;
  definition: string;
  examples_json: string;
}

export default function MoeMirrorView() {
  const [searchTerm, setSearchTerm] = useState("to'as");
  const [results, setResults] = useState<any[]>([]);
  const [selectedWord, setSelectedWord] = useState("to'as");
  const [entries, setEntries] = useState<MoeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch results list for the sidebar
  const fetchSidebarResults = async (term: string) => {
    try {
      const res = await fetch(`/api/moe_shadow?keyword=${encodeURIComponent(term)}`);
      const data = await res.json();
      // Group by word to show unique headwords in sidebar
      const uniqueWords = Array.from(new Set((data.rows || []).map((r: any) => r.word_ab)));
      setResults(uniqueWords.map(w => {
        const matching = data.rows.find((r: any) => r.word_ab === w);
        return {
          word: w,
          summary: matching ? matching.definition : ""
        };
      }));
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch all dictionary entries for the selected word
  const fetchSelectedEntries = async (word: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/moe_shadow?keyword=${encodeURIComponent(word)}`);
      const data = await res.json();
      // Exact matches only
      setEntries((data.rows || []).filter((r: any) => r.word_ab === word));
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSidebarResults(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    if (selectedWord) {
      fetchSelectedEntries(selectedWord);
    }
  }, [selectedWord]);

  const renderSectionHeader = (code: string) => {
    let title = "Dictionary Source";
    let bgColor = "bg-gray-600";
    
    switch (code) {
      case 's':
        title = "蔡中涵大辭典";
        bgColor = "bg-[#3366cc]"; // Blue
        break;
      case 'p':
        title = "方敏英英字典";
        bgColor = "bg-[#2d8a3c]"; // Green
        break;
      case 'm':
        title = "吳明義阿美族語辭典"; // Labeling m as Wu for now as per user intent
        bgColor = "bg-[#c07b0c]"; // Orange/Brown
        break;
      default:
        title = "其他辭典";
        bgColor = "bg-slate-700";
    }

    return (
      <div className={`${bgColor} text-white px-4 py-2 text-sm font-bold flex justify-between items-center rounded-t-sm shadow-sm`}>
        <span>{title}</span>
        <div className="flex gap-4 opacity-80">
            <span className="text-[10px] font-normal">(詞幹: {selectedWord})</span>
            <Share2 className="w-3.5 h-3.5" />
        </div>
      </div>
    );
  };

  const parseExamples = (jsonStr: string) => {
    try {
      const examples = JSON.parse(jsonStr);
      if (!Array.isArray(examples) || examples.length === 0) return null;
      return (
        <div className="space-y-3 mt-3 ml-4 border-l-2 border-gray-100 pl-4">
          {examples.map((ex, i) => (
            <div key={i} className="text-sm">
              <div className="bg-gray-100 inline-block px-2 py-1 rounded text-gray-800 font-medium mb-1">
                {ex.ab}
              </div>
              <div className="text-gray-600 text-xs">
                {ex.zh}
              </div>
            </div>
          ))}
        </div>
      );
    } catch (e) {
      return null;
    }
  };

  return (
    <div className="flex h-full bg-[#f0f2f5] overflow-hidden -m-8 rounded-xl border border-[var(--border-dark)]">
      {/* SIDEBAR */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-inner">
        <div className="p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div className="relative group">
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜尋..." 
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm"
            />
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
          {results.length > 0 ? (
            results.map((res, i) => (
              <div 
                key={i} 
                onClick={() => setSelectedWord(res.word)}
                className={`px-4 py-3 cursor-pointer border-b border-gray-50 flex justify-between transition-colors ${selectedWord === res.word ? 'bg-blue-50/50 border-r-4 border-r-blue-500' : 'hover:bg-gray-50'}`}
              >
                <div className="font-medium text-gray-900 group-hover:text-blue-600">{res.word}</div>
                <div className="text-[11px] text-gray-400 text-right truncate max-w-[120px]" title={res.summary}>
                  {res.summary}
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-gray-400 text-sm italic font-mono uppercase tracking-widest opacity-50">
              No results found
            </div>
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f0f2f5]">
        {/* TOP NAV BAR - MOE STYLE */}
        <div className="h-10 bg-[#2c3e50] flex items-center px-4 gap-4 text-white/80 text-xs font-medium">
            <div className="flex items-center gap-1.5 hover:text-white cursor-pointer transition-colors bg-white/10 px-3 py-1.5 rounded">
                <Globe className="w-3.5 h-3.5" />
                <span>法語版</span>
            </div>
            <div className="hover:text-white cursor-pointer px-2 transition-colors">離線版下載</div>
            <div className="hover:text-white cursor-pointer px-2 transition-colors">相關資訊</div>
            <div className="ml-auto flex items-center gap-4">
                <Grid className="w-4 h-4" />
                <Settings className="w-4 h-4" />
                <HelpCircle className="w-4 h-4" />
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {selectedWord ? (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {/* HEADWORD HEADER */}
              <div className="flex items-center justify-between pb-6 border-b border-gray-200">
                <div className="flex items-baseline gap-4">
                  <h1 className="text-4xl font-bold text-gray-800 tracking-tight">{selectedWord}</h1>
                  <span className="text-gray-400 text-sm font-mono">(詞幹)</span>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-500"><Bookmark className="w-5 h-5" /></button>
                    <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-500"><Share2 className="w-5 h-5" /></button>
                </div>
              </div>

              {/* DICTIONARY SECTIONS */}
              {isLoading ? (
                <div className="flex items-center justify-center p-24">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : entries.length > 0 ? (
                entries.map((entry, idx) => (
                  <div key={idx} className="bg-white rounded shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all">
                    {renderSectionHeader(entry.dict_code)}
                    <div className="p-6">
                      <div className="flex items-baseline gap-2 mb-4">
                         <span className="text-blue-600 font-bold text-lg">1.</span>
                         <h3 className="text-xl text-gray-800 leading-relaxed font-medium">
                           {entry.definition}
                         </h3>
                      </div>
                      {parseExamples(entry.examples_json)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-xl p-12 text-center text-gray-400 border border-dashed border-gray-200">
                   找不到 "{selectedWord}" 的詳細辭典內容。
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-40 text-gray-400 space-y-4">
              <Book className="w-20 h-20" />
              <div className="text-xl font-mono tracking-widest uppercase">請從左側選擇單字</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Add these to make it work
const Settings = (props: any) => <MoreHorizontal {...props} />;
const HelpCircle = (props: any) => <Info {...props} />;
