
import React, { useState, useEffect, useCallback } from 'react';
import { LearningPlan, QuizQuestion } from '../types';
import { generateQuiz } from '../services/geminiService';
import SpinnerIcon from './icons/SpinnerIcon';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import XCircleIcon from './icons/XCircleIcon';
import ResetIcon from './icons/ResetIcon';


interface QuizViewProps {
  plan: LearningPlan;
  onBack: () => void;
}

const QuizView: React.FC<QuizViewProps> = ({ plan, onBack }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isQuizFinished, setIsQuizFinished] = useState(false);

  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswerIndex(null);
    setScore(0);
    setIsQuizFinished(false);
    try {
      const quizQuestions = await generateQuiz(plan);
      if (quizQuestions.length === 0) {
        throw new Error("The AI failed to generate any questions for your quiz. Please try again.");
      }
      setQuestions(quizQuestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred while creating your quiz.');
    } finally {
      setIsLoading(false);
    }
  }, [plan]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleAnswerSelect = (index: number) => {
    if (selectedAnswerIndex !== null) return; // Prevent changing answer

    setSelectedAnswerIndex(index);
    if (index === questions[currentQuestionIndex].correctAnswerIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswerIndex(null);
    } else {
      setIsQuizFinished(true);
    }
  };

  const getOptionClasses = (index: number) => {
    if (selectedAnswerIndex === null) {
      return 'border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20';
    }
    const isCorrect = index === questions[currentQuestionIndex].correctAnswerIndex;
    const isSelected = index === selectedAnswerIndex;

    if (isCorrect) {
      return 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500';
    }
    if (isSelected && !isCorrect) {
      return 'border-red-500 bg-red-50 dark:bg-red-900/20 ring-2 ring-red-500';
    }
    return 'border-gray-300 dark:border-gray-600 opacity-60 cursor-not-allowed';
  };
  
  const renderIcon = (index: number) => {
    if (selectedAnswerIndex === null) return null;
    const isCorrect = index === questions[currentQuestionIndex].correctAnswerIndex;
    const isSelected = index === selectedAnswerIndex;

    if(isCorrect) return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
    if(isSelected && !isCorrect) return <XCircleIcon className="h-6 w-6 text-red-500" />;
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-center mt-16 animate-fade-in">
        <SpinnerIcon className="h-12 w-12 text-primary-500 animate-spin" />
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Generating your quiz...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-8 p-4 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-600 rounded-lg text-red-700 dark:text-red-300 animate-fade-in">
        <p className="font-bold">Quiz Creation Failed</p>
        <p>{error}</p>
        <div className="mt-4">
           <button onClick={fetchQuestions} className="mr-4 flex items-center gap-2 mx-auto rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500">
             <ResetIcon className="h-4 w-4"/> Try Again
           </button>
        </div>
      </div>
    );
  }
  
  if(isQuizFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
       <div className="text-center max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 sm:p-12 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 animate-fade-in">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Quiz Complete!</h2>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">You scored</p>
        <p className="my-4 text-6xl font-extrabold text-primary-500">{percentage}%</p>
        <p className="text-lg text-gray-600 dark:text-gray-400">({score} out of {questions.length} correct)</p>
        <div className="mt-8 flex justify-center gap-4">
          <button onClick={fetchQuestions} className="flex items-center gap-2 rounded-md bg-gray-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-500">
            <ResetIcon className="h-5 w-5"/> Try Again
          </button>
          <button onClick={onBack} className="flex items-center gap-2 rounded-md bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500">
            Back to Plan
          </button>
        </div>
      </div>
    )
  }

  if (questions.length === 0) return null;

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
       <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Plan
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
        {/* Progress Bar */}
        <div className="mb-6">
            <div className="flex justify-between items-baseline mb-2">
                 <p className="text-sm font-semibold text-primary-600 dark:text-primary-400">Question {currentQuestionIndex + 1} of {questions.length}</p>
                 <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Score: {score}</p>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div className="bg-primary-500 h-2.5 rounded-full" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`, transition: 'width 0.3s ease-in-out' }}></div>
            </div>
        </div>

        {/* Question */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">{currentQuestion.questionText}</h2>

        {/* Options */}
        <div className="space-y-4">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={selectedAnswerIndex !== null}
              className={`w-full flex items-center justify-between text-left p-4 rounded-lg border-2 transition-all duration-200 ${getOptionClasses(index)}`}
            >
              <span className="font-medium text-gray-800 dark:text-gray-200">{option}</span>
              {renderIcon(index)}
            </button>
          ))}
        </div>
        
        {/* Feedback and Next Button */}
        {selectedAnswerIndex !== null && (
            <div className="mt-6 p-4 rounded-lg bg-gray-100 dark:bg-gray-900/50 animate-fade-in">
                <h4 className="font-bold text-gray-800 dark:text-gray-200">Explanation</h4>
                <p className="mt-1 text-gray-700 dark:text-gray-300">{currentQuestion.explanation}</p>
                <button
                    onClick={handleNextQuestion}
                    className="w-full mt-4 rounded-md bg-primary-600 px-3 py-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-colors"
                >
                    {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default QuizView;
