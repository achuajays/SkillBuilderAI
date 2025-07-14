
import React, { useState } from 'react';
import { DayPlan, LearningPlan } from '../types';
import Chat from './Chat';
import ArrowLeftIcon from './icons/ArrowLeftIcon';

interface DayDetailViewProps {
  plan: LearningPlan;
  dayData: DayPlan;
  onUpdateDay: (updatedDay: DayPlan) => void;
  onBack: () => void;
}

const DayDetailView: React.FC<DayDetailViewProps> = ({ plan, dayData, onUpdateDay, onBack }) => {
  const [reflection, setReflection] = useState(dayData.reflection);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateDay({ ...dayData, isCompleted: e.target.checked });
  };

  const handleReflectionBlur = () => {
    if (reflection !== dayData.reflection) {
      onUpdateDay({ ...dayData, reflection });
    }
  };
  
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Plan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
        {/* Left Column: Day Details */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-baseline gap-4 mb-4">
            <span className="bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 font-bold px-4 py-1 rounded-full">
              DAY {dayData.day}
            </span>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{dayData.title}</h2>
          </div>

          <div className="mt-8 space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-3">Today's Lessons</h3>
              <ul className="space-y-3 list-disc list-inside text-gray-700 dark:text-gray-300 pl-2">
                {dayData.lessons.map((lesson, index) => (
                  <li key={index} className="text-base">{lesson}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-3">Practice Task</h3>
              <p className="text-base text-gray-700 dark:text-gray-300">{dayData.practiceTask}</p>
            </div>
          </div>
          
          <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700/50">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">Reflection</h3>
             <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              onBlur={handleReflectionBlur}
              placeholder="What did you learn? What was challenging?"
              rows={3}
              className="w-full text-sm p-3 rounded-md bg-gray-100 dark:bg-gray-700/60 border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500 transition"
            />
            <div className="mt-4">
              <label className="flex items-center space-x-3 cursor-pointer w-fit">
                <input
                  type="checkbox"
                  checked={dayData.isCompleted}
                  onChange={handleCheckboxChange}
                  className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className={`font-semibold ${dayData.isCompleted ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}>
                  Mark as Done
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Chat */}
        <div className="lg:col-span-1 mt-8 lg:mt-0">
          <Chat topic={dayData.title} skill={plan.skill} />
        </div>
      </div>
    </div>
  );
};

export default DayDetailView;
