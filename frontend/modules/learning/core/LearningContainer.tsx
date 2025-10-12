'use client';

import { useState, useEffect } from 'react';
import LearningApi, { DailyTopic, TopicContent, QuizQuestion, QuizResult } from './LearningApi';

export type ViewMode = 'daily' | 'reading' | 'quiz' | 'result';

interface LearningState {
  viewMode: ViewMode;
  dailyTopics: DailyTopic[];
  selectedTopic: TopicContent | null;
  selectedDifficulty: 'SIMPLE' | 'MEDIUM' | 'ADVANCED';
  quizQuestions: QuizQuestion[];
  quizResult: QuizResult | null;
  completedCount: number;
  loading: boolean;
  error: string;
}

export function useLearning() {
  const [state, setState] = useState<LearningState>({
    viewMode: 'daily',
    dailyTopics: [],
    selectedTopic: null,
    selectedDifficulty: 'MEDIUM',
    quizQuestions: [],
    quizResult: null,
    completedCount: 0,
    loading: true,
    error: ''
  });

  // Load daily topics on mount
  useEffect(() => {
    loadDailyTopics();
  }, []);

  const loadDailyTopics = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: '' }));
      const data = await LearningApi.getDailyTopics();
      setState(prev => ({
        ...prev,
        dailyTopics: data.topics,
        completedCount: data.completedCount,
        loading: false
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        error: err.response?.data?.error || 'Failed to load daily topics',
        loading: false
      }));
    }
  };

  // ✅ Manual refresh topics
  const refreshTopics = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: '' }));
      const data = await LearningApi.refreshDailyTopics();
      setState(prev => ({
        ...prev,
        dailyTopics: data.topics,
        completedCount: data.completedCount,
        loading: false
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        error: err.response?.data?.error || 'Failed to refresh topics',
        loading: false
      }));
    }
  };

  const selectTopic = async (topicId: string, difficulty: 'SIMPLE' | 'MEDIUM' | 'ADVANCED') => {
    try {
      setState(prev => ({ ...prev, loading: true, error: '' }));
      const content = await LearningApi.getTopicContent(topicId, difficulty);
      setState(prev => ({
        ...prev,
        selectedTopic: content,
        selectedDifficulty: difficulty,
        viewMode: 'reading',
        loading: false
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        error: err.response?.data?.error || 'Failed to load topic',
        loading: false
      }));
    }
  };

  const markAsRead = async () => {
    if (!state.selectedTopic) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: '' }));
      await LearningApi.markTopicAsRead(state.selectedTopic.id, state.selectedDifficulty);
      
      // Load quiz with the selected difficulty
      const quiz = await LearningApi.getQuiz(state.selectedTopic.id, state.selectedDifficulty);
      setState(prev => ({
        ...prev,
        quizQuestions: quiz.questions,
        viewMode: 'quiz',
        loading: false
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        error: err.response?.data?.error || 'Failed to load quiz',
        loading: false
      }));
    }
  };

  const submitQuiz = async (answers: { questionId: string; selectedOption: string }[]) => {
    if (!state.selectedTopic) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: '' }));
      const result = await LearningApi.submitQuiz(state.selectedTopic.id, answers);
      
      // Reload daily topics to update progress
      const dailyData = await LearningApi.getDailyTopics();
      
      setState(prev => ({
        ...prev,
        quizResult: result,
        viewMode: 'result',
        completedCount: dailyData.completedCount,
        dailyTopics: dailyData.topics,
        loading: false
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        error: err.response?.data?.error || 'Failed to submit quiz',
        loading: false
      }));
    }
  };

  const goBackToDaily = () => {
    setState(prev => ({
      ...prev,
      viewMode: 'daily',
      selectedTopic: null,
      quizQuestions: [],
      quizResult: null
    }));
  };

  return {
    ...state,
    loadDailyTopics,
    refreshTopics,  // ✅ Export refresh function
    selectTopic,
    markAsRead,
    submitQuiz,
    goBackToDaily
  };
}