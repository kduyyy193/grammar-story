import React, { useState, useEffect } from 'react';
import { analyzeGrammar, generateDailyPrompt } from '../services/geminiService';
import type { GrammarError, DailyProgress } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';
import { useDailyTheme } from '../hooks/useDailyTheme';
import Loader from '../components/Loader';
import { SparklesIcon, BookmarkIcon, XCircleIcon, CheckCircleIcon } from '../components/icons';

type StoredPrompt = {
  themeCategory: string;
  expires: number;
  prompt: string;
}

const HomePage: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [errors, setErrors] = useState<GrammarError[]>([]);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [mistakeBank, setMistakeBank] = useLocalStorage<GrammarError[]>('mistakeBank', []);
  
  const dailyTheme = useDailyTheme();
  const [dailyPrompt, setDailyPrompt] = useState<string>('');
  const [isLoadingPrompt, setIsLoadingPrompt] = useState<boolean>(true);
  const [promptError, setPromptError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrLoadPrompt = async () => {
      setIsLoadingPrompt(true);
      setPromptError(null);
      const now = new Date().getTime();

      const localPromptItem = localStorage.getItem('dailyPrompt');
      if (localPromptItem) {
        try {
          const localPrompt: StoredPrompt = JSON.parse(localPromptItem);
          if (localPrompt && localPrompt.themeCategory === dailyTheme.category && localPrompt.expires > now) {
            setDailyPrompt(localPrompt.prompt);
            setIsLoadingPrompt(false);
            return;
          }
        } catch (e) {
          console.error("Failed to parse local prompt cache", e);
          localStorage.removeItem('dailyPrompt');
        }
      }

      try {
        const newPrompt = await generateDailyPrompt(dailyTheme);
        const expirationTime = new Date();
        expirationTime.setHours(23, 59, 59, 999);
        
        const newStoredPrompt: StoredPrompt = {
          themeCategory: dailyTheme.category,
          expires: expirationTime.getTime(),
          prompt: newPrompt,
        };
        localStorage.setItem('dailyPrompt', JSON.stringify(newStoredPrompt));
        setDailyPrompt(newPrompt);
      } catch (err) {
        setPromptError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoadingPrompt(false);
      }
    };
    fetchOrLoadPrompt();
  }, [dailyTheme.category]);


  const handleAnalyze = async () => {
    if (!text.trim()) {
        setApiError("Please write something before analyzing.");
        return;
    }
    setIsLoadingAnalysis(true);
    setApiError(null);
    setErrors([]);
    try {
      const foundErrors = await analyzeGrammar(text);
      setErrors(foundErrors);

      const today = new Date().toISOString().split('T')[0];
      const progressKey = 'dailyProgress';
      const progressDataString = localStorage.getItem(progressKey);
      let progressData: DailyProgress = { 
        date: today, 
        storiesAnalyzed: 0, 
        mistakesFound: 0, 
        challengesCompleted: 0,
        challengesAttempted: 0,
        correctAnswers: 0,
        totalAnswers: 0
      };
      
      if (progressDataString) {
          const parsed = JSON.parse(progressDataString);
          if (parsed.date === today) {
              progressData = {
                ...parsed,
                storiesAnalyzed: (parsed.storiesAnalyzed || 0) + 1,
                mistakesFound: (parsed.mistakesFound || 0) + foundErrors.length
              };
          } else {
              progressData = {
                ...progressData,
                storiesAnalyzed: 1,
                mistakesFound: foundErrors.length
              };
          }
      } else {
          progressData = {
            ...progressData,
            storiesAnalyzed: 1,
            mistakesFound: foundErrors.length
          };
      }
      localStorage.setItem(progressKey, JSON.stringify(progressData));

    } catch (err) {
      if (err instanceof Error) {
        setApiError(err.message);
      } else {
        setApiError("An unknown error occurred.");
      }
    } finally {
      setIsLoadingAnalysis(false);
    }
  };
  
  const saveMistake = (error: GrammarError) => {
    if (!mistakeBank.find(m => m.id === error.id)) {
      setMistakeBank([...mistakeBank, error]);
    }
  };

  const isMistakeSaved = (errorId: string) => {
    return mistakeBank.some(m => m.id === errorId);
  }

  const getHighlightedText = () => {
    if (errors.length === 0) {
      return <p>{text}</p>;
    }
  
    let lastIndex = 0;
    const parts: (string )[] = [];
    const sortedErrors = [...errors].sort((a, b) => text.indexOf(a.originalText) - text.indexOf(b.originalText));
  
    sortedErrors.forEach((error, i) => {
        const startIndex = text.indexOf(error.originalText, lastIndex);
        if (startIndex === -1) return;

        if (startIndex > lastIndex) {
            parts.push(text.substring(lastIndex, startIndex));
        }
        
        parts.push(
            <span key={i} className="bg-red-100 rounded-md px-1 py-0.5 relative group cursor-pointer">
                {error.originalText}
                <div className="absolute z-10 bottom-full mb-2 w-72 p-3 bg-slate-800 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <p className="font-bold">Correction:</p>
                    <p className="text-green-300 mb-2">{error.correctedText}</p>
                    <p className="font-semibold">Explanation:</p>
                    <p>{error.explanation}</p>
                </div>
            </span>
        );
        lastIndex = startIndex + error.originalText.length;
    });

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
  
    return <p className="leading-relaxed whitespace-pre-wrap">{parts}</p>;
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-slate-800 mb-4 font-serif">Write Your Story</h1>
        <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-4 rounded-r-lg mb-4 min-h-[90px]">
          <h2 className="font-bold">Today's Theme: {dailyTheme.title}</h2>
          {isLoadingPrompt && <p className="text-sm mt-1 animate-pulse">Generating a creative prompt for you...</p>}
          {promptError && <p className="text-sm mt-1 text-red-600">{promptError}</p>}
          {!isLoadingPrompt && !promptError && <p className="text-sm mt-1">{dailyPrompt}</p>}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-64 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200 resize-none font-serif"
          placeholder="Tell me about your day..."
          aria-label="Story writing area"
        />
        <button
          onClick={handleAnalyze}
          disabled={isLoadingAnalysis}
          className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:bg-slate-400 disabled:cursor-not-allowed"
        >
          {isLoadingAnalysis ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5" />
              Analyze My Writing
            </>
          )}
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-slate-800 mb-4 font-serif">Analysis Results</h2>
        <div className="bg-slate-50 p-4 rounded-lg min-h-[300px]">
          {isLoadingAnalysis && <Loader text="Our AI is reading your story..." />}
          {apiError && (
              <div className="flex items-center gap-2 text-red-600 bg-red-100 p-3 rounded-lg">
                  <XCircleIcon className="w-5 h-5"/>
                  <p>{apiError}</p>
              </div>
          )}
          {!isLoadingAnalysis && !apiError && errors.length === 0 && (
            <div className="text-center py-10">
                <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-2"/>
                <p className="text-slate-600 font-medium">{text.trim() ? "No errors found! Great job." : "Your analysis results will appear here."}</p>
            </div>
          )}
          {!isLoadingAnalysis && errors.length > 0 && (
            <div>
                <div className="mb-6 p-4 border border-slate-200 rounded-lg bg-white">
                    <h3 className="font-bold mb-2">Your Corrected Story:</h3>
                    <div className="text-slate-700">{getHighlightedText()}</div>
                </div>
                <h3 className="font-bold mb-2">Mistakes Found:</h3>
                <ul className="space-y-3">
                {errors.map((error) => (
                    <li key={error.id} className="bg-white p-4 rounded-lg border border-slate-200">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-red-500 line-through">{error.originalText}</p>
                                <p className="text-sm text-green-600 font-semibold">{error.correctedText}</p>
                                <p className="text-xs text-slate-500 mt-2">{error.explanation}</p>
                            </div>
                            <button onClick={() => saveMistake(error)} disabled={isMistakeSaved(error.id)} title={isMistakeSaved(error.id) ? "Saved" : "Save to Mistake Bank"} className="p-2 rounded-full hover:bg-slate-100 disabled:text-blue-500 disabled:cursor-default text-slate-500 transition-colors">
                                <BookmarkIcon className="w-5 h-5"/>
                            </button>
                        </div>
                    </li>
                ))}
                </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
