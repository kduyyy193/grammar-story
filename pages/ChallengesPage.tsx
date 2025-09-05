import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Challenge, DailyProgress, CompletedChallenge } from '../types';
import { useDailyTheme } from '../hooks/useDailyTheme';
import { generateChallenges } from '../services/geminiService';
import useLocalStorage from '../hooks/useLocalStorage';
import Loader from '../components/Loader';
import { CheckCircleIcon, TrophyIcon, XCircleIcon } from '../components/icons';

type StoredChallenges = {
  themeCategory: string;
  expires: number;
  challenges: Challenge[];
}

const ChallengeCard: React.FC<{ 
  challenge: Challenge, 
  onComplete: (completedChallenge: CompletedChallenge) => void,
  isCompleted: boolean,
  completedResult?: CompletedChallenge
}> = ({ challenge, onComplete, isCompleted: isAlreadyCompleted, completedResult }) => {
  const [userAnswers, setUserAnswers] = useState<string[]>(() => {
    if (completedResult) {
      return completedResult.userAnswers;
    }
    return Array(challenge.solution.length).fill('');
  });
  const [submitted, setSubmitted] = useState(isAlreadyCompleted);
  const [results, setResults] = useState<boolean[]>(() => {
    if (completedResult) {
      return userAnswers.map((answer, index) => 
        answer.trim().toLowerCase() === challenge.solution[index].toLowerCase()
      );
    }
    return [];
  });
  const [isCompleted, setIsCompleted] = useState(isAlreadyCompleted);

  const handleInputChange = (index: number, value: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[index] = value;
    setUserAnswers(newAnswers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newResults = userAnswers.map((answer, index) => 
        answer.trim().toLowerCase() === challenge.solution[index].toLowerCase()
    );
    setResults(newResults);
    setSubmitted(true);
    
    const isNowCorrect = newResults.every(r => r);
    if(!isCompleted) {
      const completedChallenge: CompletedChallenge = {
        challengeId: challenge.id,
        completedAt: new Date().toISOString(),
        userAnswers: [...userAnswers],
        isCorrect: isNowCorrect,
        level: challenge.level,
        category: challenge.category
      };
      onComplete(completedChallenge);
      setIsCompleted(true);
    }
  };

  const isCorrect = submitted && results.every(r => r);

  const renderStory = () => {
    const parts = challenge.storyWithBlanks.split('___');
    return parts.map((part, index) => (
      <React.Fragment key={index}>
        {part}
        {index < parts.length - 1 && (
          <input
            type="text"
            value={userAnswers[index]}
            onChange={(e) => handleInputChange(index, e.target.value)}
            disabled={submitted}
            className={`inline-block w-32 mx-1 px-2 py-1 border-b-2 bg-transparent focus:outline-none transition-colors duration-200 ${
              submitted 
                ? results[index] 
                  ? 'border-green-500 text-green-700' 
                  : 'border-red-500 text-red-700'
                : 'border-slate-300 focus:border-blue-500'
            }`}
            aria-label={`Blank ${index + 1}`}
          />
        )}
      </React.Fragment>
    ));
  };

  return (
    <div className={`bg-white p-6 rounded-xl shadow-md border-l-4 ${
      isCorrect ? 'border-green-500' : 
      isAlreadyCompleted && !isCorrect ? 'border-red-500' : 
      'border-blue-500'
    }`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-bold font-serif text-slate-800">{challenge.title}</h3>
        {isAlreadyCompleted && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isCorrect ? 'Completed ✓' : 'Attempted'}
          </span>
        )}
      </div>
      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          challenge.level === 'Easy' ? 'bg-green-100 text-green-800' : 
          challenge.level === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
          'bg-red-100 text-red-800'
        }`}>{challenge.level}</span>
      
      <form onSubmit={handleSubmit}>
        <p className="my-4 text-slate-600 leading-loose font-serif">
          {renderStory()}
        </p>
        
        {!submitted && (
           <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
             Check Answers
           </button>
        )}
      </form>

      {submitted && (
        <div className="mt-4 p-4 rounded-lg bg-slate-50">
          {isCorrect ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircleIcon className="w-6 h-6" />
              <p className="font-semibold">Congratulations! You completed the challenge perfectly.</p>
            </div>
          ) : (
            <div>
              <p className="font-semibold text-slate-700 mb-2">Some answers were incorrect. Review the highlighted fields above.</p>
              <p className="text-sm text-slate-600">Correct answers: <span className="font-mono bg-slate-200 px-1 rounded">{challenge.solution.join(', ')}</span></p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


const ChallengesPage: React.FC = () => {
    const dailyTheme = useDailyTheme();
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeLevel, setActiveLevel] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
    const [completedChallenges, setCompletedChallenges] = useLocalStorage<CompletedChallenge[]>('completedChallenges', []);

    const handleChallengeComplete = useCallback((completedChallenge: CompletedChallenge) => {
        setCompletedChallenges(prev => {
            const existingIndex = prev.findIndex(c => c.challengeId === completedChallenge.challengeId);
            if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex] = completedChallenge;
                return updated;
            } else {
                return [...prev, completedChallenge];
            }
        });

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
                    challengesAttempted: (parsed.challengesAttempted || 0) + 1,
                    challengesCompleted: completedChallenge.isCorrect ? (parsed.challengesCompleted || 0) + 1 : (parsed.challengesCompleted || 0),
                    correctAnswers: (parsed.correctAnswers || 0) + (completedChallenge.isCorrect ? 1 : 0),
                    totalAnswers: (parsed.totalAnswers || 0) + 1
                };
            } else {
                progressData = {
                    ...progressData,
                    challengesAttempted: 1,
                    challengesCompleted: completedChallenge.isCorrect ? 1 : 0,
                    correctAnswers: completedChallenge.isCorrect ? 1 : 0,
                    totalAnswers: 1
                };
            }
        } else {
            progressData = {
                ...progressData,
                challengesAttempted: 1,
                challengesCompleted: completedChallenge.isCorrect ? 1 : 0,
                correctAnswers: completedChallenge.isCorrect ? 1 : 0,
                totalAnswers: 1
            };
        }
        localStorage.setItem(progressKey, JSON.stringify(progressData));
    }, [setCompletedChallenges]);

    useEffect(() => {
        const fetchOrLoadChallenges = async () => {
            setIsLoading(true);
            setError(null);
            const now = new Date().getTime();

            const localChallengesItem = localStorage.getItem('dailyChallenges');
            if (localChallengesItem) {
                try {
                    const localData: StoredChallenges = JSON.parse(localChallengesItem);
                    if (localData && localData.themeCategory === dailyTheme.category && localData.expires > now) {
                        setChallenges(localData.challenges);
                        setIsLoading(false);
                        return;
                    }
                } catch (e) {
                    console.error("Failed to parse local challenges cache", e);
                    localStorage.removeItem('dailyChallenges');
                }
            }
            
            try {
                const newChallenges = await generateChallenges(dailyTheme);
                if(newChallenges.length === 0) {
                  throw new Error("AI failed to generate challenges. Please try again.")
                }
                const expirationTime = new Date();
                expirationTime.setHours(23, 59, 59, 999);

                const newStoredData: StoredChallenges = {
                    themeCategory: dailyTheme.category,
                    expires: expirationTime.getTime(),
                    challenges: newChallenges,
                };
                localStorage.setItem('dailyChallenges', JSON.stringify(newStoredData));
                setChallenges(newChallenges);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrLoadChallenges();
    }, [dailyTheme.category]);

    const filteredChallenges = useMemo(() => {
        return challenges.filter(c => c.level === activeLevel);
    }, [challenges, activeLevel]);

    const isChallengeCompleted = useCallback((challengeId: string) => {
        return completedChallenges.some(c => c.challengeId === challengeId);
    }, [completedChallenges]);

    const getChallengeResult = useCallback((challengeId: string) => {
        return completedChallenges.find(c => c.challengeId === challengeId);
    }, [completedChallenges]);

    const levels: ('Easy' | 'Medium' | 'Hard')[] = ['Easy', 'Medium', 'Hard'];

    return (
        <div>
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-slate-800 mb-2 font-serif">Grammar Challenges</h1>
                <p className="text-lg text-slate-600">Test your skills with these AI-generated stories.</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-inner border border-slate-200 mb-8 z-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <TrophyIcon className="w-8 h-8 text-yellow-500 flex-shrink-0"/>
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Today's Focus: {dailyTheme.title}</h2>
                        <p className="text-slate-600 text-sm">New challenges are generated daily for this theme!</p>
                    </div>
                </div>
              </div>
            </div>
            
            {isLoading && <div className="mt-16"><Loader text="Generating today's challenges with AI..." /></div>}
            
            {error && (
            <div className="flex flex-col items-center gap-2 text-red-600 bg-red-100 p-4 rounded-lg mt-16 max-w-md mx-auto">
                <XCircleIcon className="w-8 h-8"/>
                <p className="font-semibold text-center">{error}</p>
            </div>
            )}
            
            {!isLoading && !error && challenges.length > 0 && (
            <>
                <div className="mb-6 flex justify-center border-b border-slate-200">
                {levels.map(level => (
                    <button 
                    key={level}
                    onClick={() => setActiveLevel(level)}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                        activeLevel === level 
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                    >
                    {level}
                    </button>
                ))}
                </div>
                <div className="space-y-6">
                    {filteredChallenges.map(challenge => {
                        const completed = isChallengeCompleted(challenge.id);
                        const result = getChallengeResult(challenge.id);
                        return (
                            <ChallengeCard 
                                key={challenge.id} 
                                challenge={challenge} 
                                onComplete={handleChallengeComplete}
                                isCompleted={completed}
                                completedResult={result}
                            />
                        );
                    })}
                </div>
            </>
            )}

            {!isLoading && !error && challenges.length === 0 && (
                <div className="text-center py-16 bg-white rounded-xl shadow-md">
                    <p className="text-slate-500 font-medium">No challenges could be loaded for today's theme.</p>
                    <p className="text-sm text-slate-400 mt-2">Please try refreshing the page.</p>
                </div>
            )}
        
        </div>
    );
}

export default ChallengesPage;
