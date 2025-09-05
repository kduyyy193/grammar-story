import React, { useState, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import type { GrammarError, DailyProgress, CompletedChallenge } from '../types';
import { BookmarkIcon, TrashIcon, ChartIcon, TrophyIcon, BookIcon, XCircleIcon, CheckCircleIcon } from '../components/icons';

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number | string }> = ({ icon, label, value }) => (
    <div className="bg-slate-50 p-4 rounded-lg flex items-center gap-4">
        <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-slate-500 text-sm font-medium">{label}</p>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
        </div>
    </div>
);


const ProgressPage: React.FC = () => {
  const [mistakeBank, setMistakeBank] = useLocalStorage<GrammarError[]>('mistakeBank', []);
  const [completedChallenges, setCompletedChallenges] = useLocalStorage<CompletedChallenge[]>('completedChallenges', []);
  const [dailyProgress, setDailyProgress] = useState<DailyProgress | null>(null);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const progressKey = 'dailyProgress';
    const progressDataString = localStorage.getItem(progressKey);
    
    if (progressDataString) {
        const parsed: DailyProgress = JSON.parse(progressDataString);
        if (parsed.date === today) {
            setDailyProgress(parsed);
        }
    }
  }, []);


  const removeMistake = (id: string) => {
    setMistakeBank(mistakeBank.filter(m => m.id !== id));
  };

  const removeCompletedChallenge = (challengeId: string) => {
    setCompletedChallenges(completedChallenges.filter(c => c.challengeId !== challengeId));
  };

  const challengeStats = {
    totalAttempted: completedChallenges.length,
    totalCorrect: completedChallenges.filter(c => c.isCorrect).length,
    byLevel: {
      Easy: completedChallenges.filter(c => c.level === 'Easy').length,
      Medium: completedChallenges.filter(c => c.level === 'Medium').length,
      Hard: completedChallenges.filter(c => c.level === 'Hard').length,
    },
    byCorrectness: {
      Easy: completedChallenges.filter(c => c.level === 'Easy' && c.isCorrect).length,
      Medium: completedChallenges.filter(c => c.level === 'Medium' && c.isCorrect).length,
      Hard: completedChallenges.filter(c => c.level === 'Hard' && c.isCorrect).length,
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-slate-800 mb-2 font-serif">Your Progress</h1>
        <p className="text-lg text-slate-600">Review your saved mistakes and track your daily activity.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Mistake Bank */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <BookmarkIcon className="w-6 h-6 text-blue-600" />
              Mistake Bank
            </h2>
          {mistakeBank.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-slate-500">Your saved mistakes will appear here.</p>
              <p className="text-sm text-slate-400">Save mistakes from the "Write Story" page to review them later.</p>
            </div>
          ) : (
            <ul className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {mistakeBank.map(error => (
                <li key={error.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200 group">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-red-500 line-through">{error.originalText}</p>
                      <p className="text-sm text-green-600 font-semibold">{error.correctedText}</p>
                      <p className="text-xs text-slate-500 mt-2 italic">"{error.explanation}"</p>
                    </div>
                    <button 
                      onClick={() => removeMistake(error.id)}
                      title="Remove mistake"
                      className="p-2 rounded-full text-slate-400 hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          </div>

          {/* Completed Challenges */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <TrophyIcon className="w-6 h-6 text-blue-600" />
              Completed Challenges
            </h2>
            {completedChallenges.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-slate-500">Your completed challenges will appear here.</p>
                <p className="text-sm text-slate-400">Complete challenges from the "Challenges" page to see your progress.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Challenge Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-slate-50 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-slate-800">{challengeStats.totalAttempted}</p>
                    <p className="text-xs text-slate-500">Total Attempted</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">{challengeStats.totalCorrect}</p>
                    <p className="text-xs text-slate-500">Correct</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {challengeStats.totalAttempted > 0 ? Math.round((challengeStats.totalCorrect / challengeStats.totalAttempted) * 100) : 0}%
                    </p>
                    <p className="text-xs text-slate-500">Success Rate</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-slate-800">
                      {challengeStats.totalAttempted - challengeStats.totalCorrect}
                    </p>
                    <p className="text-xs text-slate-500">Incorrect</p>
                  </div>
                </div>

                {/* Challenges List */}
                <ul className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {completedChallenges
                    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
                    .map(challenge => (
                    <li key={challenge.challengeId} className="bg-slate-50 p-4 rounded-lg border border-slate-200 group">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                              challenge.level === 'Easy' ? 'bg-green-100 text-green-800' : 
                              challenge.level === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'
                            }`}>
                              {challenge.level}
                            </span>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                              challenge.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {challenge.isCorrect ? 'Correct ✓' : 'Incorrect ✗'}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600">
                            Completed: {new Date(challenge.completedAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            Category: {challenge.category}
                          </p>
                        </div>
                        <button 
                          onClick={() => removeCompletedChallenge(challenge.challengeId)}
                          title="Remove challenge"
                          className="p-2 rounded-full text-slate-400 hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
           <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <ChartIcon className="w-6 h-6 text-blue-600" />
            Today's Session Summary
          </h2>
          {dailyProgress ? (
             <div className="space-y-4">
                <StatCard 
                    icon={<BookIcon className="w-5 h-5"/>}
                    label="Stories Analyzed"
                    value={dailyProgress.storiesAnalyzed}
                />
                 <StatCard 
                    icon={<XCircleIcon className="w-5 h-5"/>}
                    label="Mistakes Found"
                    value={dailyProgress.mistakesFound}
                />
                 <StatCard 
                    icon={<TrophyIcon className="w-5 h-5"/>}
                    label="Challenges Completed"
                    value={dailyProgress.challengesCompleted}
                />
                 <StatCard 
                    icon={<CheckCircleIcon className="w-5 h-5"/>}
                    label="Challenges Attempted"
                    value={dailyProgress.challengesAttempted || 0}
                />
                 <StatCard 
                    icon={<ChartIcon className="w-5 h-5"/>}
                    label="Success Rate"
                    value={dailyProgress.totalAnswers > 0 ? `${Math.round((dailyProgress.correctAnswers / dailyProgress.totalAnswers) * 100)}%` : '0%'}
                />
             </div>
          ) : (
            <div className="text-center py-16 bg-slate-50 rounded-lg">
                <p className="text-slate-500">No activity recorded today.</p>
                <p className="text-sm text-slate-400 mt-2">Start writing or complete a challenge to see your progress!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;