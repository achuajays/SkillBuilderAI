import React from 'react';
import { LearningPlan, DayPlan } from '../types';
import DayCard from './DayCard';
import QuizCard from './QuizCard';

interface LearningPlanDisplayProps {
  plan: LearningPlan;
  onUpdateDay: (updatedDay: DayPlan) => void;
  onSelectDay: (dayId: number) => void;
  onStartQuiz: () => void;
}

const LearningPlanDisplay: React.FC<LearningPlanDisplayProps> = ({ plan, onUpdateDay, onSelectDay, onStartQuiz }) => {
  return (
    <div className="animate-fade-in">
        <h2 className="text-3xl font-bold text-center mb-2 text-gray-800 dark:text-gray-200">Your Plan to Master <span className="text-primary-500">{plan.skill}</span></h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-10">Follow this {plan.duration}-day guide. Click on a card to see details and chat with an AI tutor!</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plan.days.sort((a,b) => a.day - b.day).map(day => (
                <DayCard key={day.day} dayData={day} onUpdate={onUpdateDay} onSelect={onSelectDay} />
            ))}
            <QuizCard onStartQuiz={onStartQuiz} />
        </div>
    </div>
  );
};

export default LearningPlanDisplay;