'use client';

import { useTranslations } from 'next-intl';
import { DailyTopic } from '../core/LearningApi';

interface DailyTopicsViewProps {
  topics: DailyTopic[];
  completedCount: number;
  onSelectTopic: (topicId: string, difficulty: 'SIMPLE' | 'MEDIUM' | 'ADVANCED') => void;
  onRefreshTopics?: () => void;
  darkMode?: boolean;
}

export default function DailyTopicsView({
  topics,
  completedCount,
  onSelectTopic,
  onRefreshTopics,
  darkMode = false
}: DailyTopicsViewProps) {
  const t = useTranslations();
  
  const gradients = [
    { light: 'from-indigo-600 via-purple-600 to-blue-700', dark: 'from-indigo-500 via-purple-500 to-blue-600' },
    { light: 'from-purple-600 via-fuchsia-600 to-pink-600', dark: 'from-purple-500 via-fuchsia-500 to-pink-500' },
    { light: 'from-blue-700 via-indigo-600 to-purple-700', dark: 'from-blue-600 via-indigo-500 to-purple-600' }
  ];

  return (
    <div>
      <div className="flex justify-center mb-12">
        <div className={`w-full max-w-xl px-6 py-4 rounded-2xl backdrop-blur-lg border ${
          darkMode
            ? 'bg-slate-900/50 border-slate-700'
            : 'bg-white/70 border-slate-200 shadow-lg'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-sm font-medium ${
              darkMode ? 'text-slate-300' : 'text-slate-700'
            }`}>
              {t('topics.todaysProgress')}
            </span>
            <span className={`text-sm font-bold ${
              darkMode ? 'text-purple-400' : 'text-purple-700'
            }`}>
              {completedCount}/3
            </span>
          </div>
          <div className={`relative h-3 rounded-full overflow-hidden ${
            darkMode ? 'bg-slate-800' : 'bg-slate-200'
          }`}>
            <div 
              className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 transition-all duration-1000 rounded-full"
              style={{ width: `${(completedCount / 3) * 100}%` }}
            >
              <div className="absolute inset-0 bg-white/20" style={{ animation: 'shimmer 2s infinite' }} />
            </div>
          </div>
        </div>
      </div>

      {onRefreshTopics && (
        <div className="flex justify-center mb-8">
          <button
            onClick={onRefreshTopics}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 ${
              darkMode
                ? 'bg-purple-900/40 text-purple-300 hover:bg-purple-900/60 border-2 border-purple-700'
                : 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 hover:from-purple-200 hover:to-blue-200 border-2 border-purple-300'
            }`}
          >
            <span className="text-lg">🔄</span>
            {t('topics.refreshTopics')}
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {topics.map((topic, index) => {
          const gradient = gradients[index % 3];
          
          return (
            <div
              key={topic.id}
              className="relative group"
            >
              <div className={`absolute -inset-1 bg-gradient-to-br ${
                darkMode ? gradient.dark : gradient.light
              } rounded-3xl blur-xl transition-all duration-700 opacity-30 group-hover:opacity-60 group-hover:scale-105`} />

              <div className={`relative rounded-3xl overflow-hidden border-2 transition-all duration-500 cursor-pointer ${
                darkMode
                  ? 'bg-slate-900/90 border-slate-700'
                  : 'bg-white/95 border-slate-200'
              } backdrop-blur-xl group-hover:scale-105 shadow-xl group-hover:shadow-2xl`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${
                  darkMode ? gradient.dark : gradient.light
                } opacity-10`} />
                
                <div className="relative p-8">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl mb-6 ${
                    darkMode
                      ? 'bg-slate-800/80'
                      : 'bg-white/80'
                  } backdrop-blur-sm border border-purple-400`}>
                    <span className="text-base">{topic.category.icon || ''}</span>
                    <span className={`text-xs font-bold uppercase tracking-wide ${
                      darkMode ? 'text-purple-400' : 'text-purple-700'
                    }`}>
                      {topic.category.name}
                    </span>
                  </div>

                  <h3 className={`text-lg font-bold mb-6 leading-snug ${
                    darkMode ? 'text-slate-100' : 'text-slate-900'
                  }`}>
                    {topic.title}
                  </h3>

                  <div className={`h-px mb-6 rounded-full bg-gradient-to-r ${
                    darkMode ? gradient.dark : gradient.light
                  } opacity-30`} />

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">⏱️</span>
                      <div>
                        <p className={`text-xs font-medium ${
                          darkMode ? 'text-slate-500' : 'text-slate-500'
                        }`}>
                          {t('topics.duration')}
                        </p>
                        <p className={`text-sm font-semibold ${
                          darkMode ? 'text-slate-300' : 'text-slate-700'
                        }`}>
                          {topic.estimatedReadTime} {t('topics.minutes')}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className={`text-xs font-medium ${
                        darkMode ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        {t('topics.chooseDifficulty')}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onSelectTopic(topic.id, 'SIMPLE')}
                          className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                            darkMode
                              ? 'bg-green-900/30 text-green-300 hover:bg-green-900/50'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {t('topics.simple')}
                        </button>
                        <button
                          onClick={() => onSelectTopic(topic.id, 'MEDIUM')}
                          className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                            darkMode
                              ? 'bg-blue-900/30 text-blue-300 hover:bg-blue-900/50'
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          }`}
                        >
                          {t('topics.medium')}
                        </button>
                        <button
                          onClick={() => onSelectTopic(topic.id, 'ADVANCED')}
                          className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                            darkMode
                              ? 'bg-purple-900/30 text-purple-300 hover:bg-purple-900/50'
                              : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                          }`}
                        >
                          {t('topics.advanced')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}