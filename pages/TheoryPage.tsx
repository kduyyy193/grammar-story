import React, { useState, useEffect } from 'react';
import { TENSES_THEORY } from '../constants';
import { SparklesIcon, XCircleIcon } from '../components/icons';
import type { TenseDetail, TenseFormula } from '../types';
import { generateTenseExamples } from '../services/geminiService';
import { useDailyTheme } from '@/hooks/useDailyTheme';

type ExampleMap = Record<string, string[]>;

type StoredExamples = {
  expires: number;
  examples: ExampleMap;
};

const FormulaTable: React.FC<{ title: string; formula: TenseFormula }> = ({ title, formula }) => (
  <div className="mt-4">
    <h4 className="font-semibold text-slate-700 text-sm mb-2">{title}</h4>
    <table className="w-full text-left text-sm border-collapse">
      <tbody>
        <tr className="border-b border-slate-200">
          <td className="py-2 pr-2 font-medium text-slate-500 w-1/4 min-w-28">(+) Affirmative</td>
          <td className="py-2 pl-2 font-mono text-blue-700">{formula.affirmative}</td>
        </tr>
        <tr className="border-b border-slate-200">
          <td className="py-2 pr-2 font-medium text-slate-500">(-) Negative</td>
          <td className="py-2 pl-2 font-mono text-blue-700">{formula.negative}</td>
        </tr>
        <tr className="border-b border-slate-200">
          <td className="py-2 pr-2 font-medium text-slate-500">(?) Yes/No</td>
          <td className="py-2 pl-2 font-mono text-blue-700">{formula.yesNoQuestion}</td>
        </tr>
        <tr>
          <td className="py-2 pr-2 font-medium text-slate-500">(?) WH-</td>
          <td className="py-2 pl-2 font-mono text-blue-700">{formula.whQuestion}</td>
        </tr>
      </tbody>
    </table>
  </div>
);


const TenseCard: React.FC<{ tense: TenseDetail, examples: string[], isLoading: boolean }> = ({ tense, examples, isLoading }) => {
  return (
    <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex flex-col">
      <h3 className={`"text-xl font-bold font-serif text-slate-900`}>{tense.name}</h3>
      <p className="text-slate-600 text-sm mt-1 mb-4">{tense.definition}</p>

      <div className="bg-slate-50 p-4 rounded-lg">
        {tense.tobeFormula && <FormulaTable title="With Verb 'to be'" formula={tense.tobeFormula} />}
        <FormulaTable title={tense.tobeFormula ? "With Regular Verbs" : "Formulas"} formula={tense.regularFormula} />
      </div>

      <div className="mt-4">
        <h4 className="font-semibold text-slate-700 text-sm mb-2">How to Use</h4>
        <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
          {tense.usage.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      </div>

      <div className="mt-4">
        <h4 className="font-semibold text-slate-700 text-sm mb-2">Common Signals</h4>
        <div className="flex flex-wrap gap-1">
          {tense.signals.map((item, i) => <span key={i} className="bg-yellow-100 text-yellow-800 text-xs font-mono px-2 py-0.5 rounded">{item}</span>)}
        </div>
      </div>

      <div className="border-t border-slate-200 pt-4 mt-4">
        <h4 className="text-sm font-semibold text-slate-700 mb-2">AI Generated Examples</h4>
        {isLoading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
            <div className="h-4 bg-slate-200 rounded w-4/6"></div>
            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
          </div>
        ) : (
          <ul className="list-disc list-inside space-y-1">
            {examples.map((ex, i) => (
              <li key={i} className="text-slate-800 text-sm italic">"{ex}"</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}


const TheoryPage: React.FC = () => {
  const dailyTheme = useDailyTheme()
  const [examples, setExamples] = useState<ExampleMap>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchOrLoadExamples = async () => {
      setIsLoading(true);
      setError(null);
      const now = new Date().getTime();

      const localExamplesItem = localStorage.getItem('tenseTheoryExamples');
      if (localExamplesItem) {
        try {
          const localData: StoredExamples = JSON.parse(localExamplesItem);
          if (localData && localData.expires > now) {
            setExamples(localData.examples);
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.error("Failed to parse local examples cache", e);
          localStorage.removeItem('tenseTheoryExamples');
        }
      }

      try {
        const allTenses = TENSES_THEORY.theory.sections.flatMap(s => s.tenses);
        const examplePromises = allTenses.map(tense => generateTenseExamples(tense));

        const results = await Promise.all(examplePromises);

        const newExamples: ExampleMap = allTenses.reduce((acc, tense, index) => {
          acc[tense.name] = results[index];
          return acc;
        }, {} as ExampleMap);

        const expirationTime = now + 12 * 60 * 60 * 1000;
        const newStoredData: StoredExamples = {
          expires: expirationTime,
          examples: newExamples,
        };
        localStorage.setItem('tenseTheoryExamples', JSON.stringify(newStoredData));
        setExamples(newExamples);

      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load AI examples.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrLoadExamples();
  }, []);

  const getTodayTense = () => {
    let todayTense: TenseDetail
    TENSES_THEORY.theory.sections.forEach(section => {
      todayTense = section.tenses.find(v => v.name === dailyTheme.title)
    })
    return todayTense
  }

  return (
    <div>
      <div className="mb-20">
        <h2 className="text-4xl font-bold text-slate-800 mb-2 font-serif mb-4">Day Of {dailyTheme.title}</h2>
        <TenseCard
          key={getTodayTense().name}
          tense={getTodayTense()}
          examples={examples[getTodayTense().name] || []}
          isLoading={isLoading}
        />
      </div>

      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-slate-800 mb-2 font-serif">{TENSES_THEORY.title}</h2>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto">{TENSES_THEORY.theory.introduction}</p>
      </div>

      <div className="max-w-5xl mx-auto space-y-10">
        {error && (
          <div className="flex flex-col items-center gap-2 text-red-600 bg-red-100 p-4 rounded-lg mt-16 max-w-md mx-auto">
            <XCircleIcon className="w-8 h-8" />
            <p className="font-semibold text-center">{error}</p>
          </div>
        )}

        {!error && TENSES_THEORY.theory.sections.map(section => (
          <div key={section.title}>
            <h2 className="text-3xl font-bold font-serif text-slate-800 mb-6 pb-2 border-b-2 border-blue-500">{section.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {section.tenses.map(tense => (
                <TenseCard
                  key={tense.name}
                  tense={tense}
                  examples={examples[tense.name] || []}
                  isLoading={isLoading}
                />
              ))}
            </div>
          </div>
        ))}
        <div className="text-center text-sm text-slate-400 pt-8 flex items-center justify-center gap-2">
          <SparklesIcon className="w-4 h-4 text-blue-500" />
          <span>Examples are dynamically generated by AI and refresh every 12 hours.</span>
        </div>
      </div>
    </div>
  );
};

export default TheoryPage;