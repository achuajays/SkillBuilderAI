
import React from 'react';
import ArrowLeftIcon from './icons/ArrowLeftIcon'; // Using for right arrow with rotation

const QuizCard: React.FC<{ onStartQuiz: () => void }> = ({ onStartQuiz }) => {
  return (
    <div 
      className="flex flex-col justify-between rounded-xl border-2 border-dashed border-primary-400 dark:border-primary-600 bg-primary-50 dark:bg-primary-900/20 p-6 transition-all duration-300 ease-in-out hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:shadow-lg cursor-pointer group"
      onClick={onStartQuiz}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onStartQuiz()}
    >
      <div className="text-center">
        <h3 className="text-xl font-bold text-primary-700 dark:text-primary-300 mb-2">Ready to Test Your Knowledge?</h3>
        <p className="text-primary-600 dark:text-primary-400">Take a quick quiz to see how much you've learned about your new skill.</p>
      </div>
      <div className="mt-6 text-center">
        <span className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-transform group-hover:scale-105">
          Start Quiz
          <ArrowLeftIcon className="w-5 h-5 transform -rotate-180" />
        </span>
      </div>
    </div>
  );
};

export default QuizCard;
