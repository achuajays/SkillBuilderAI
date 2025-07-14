
import React, { useState } from 'react';
import { DayPlan } from '../types';

interface DayCardProps {
  dayData: DayPlan;
  onUpdate: (updatedDay: DayPlan) => void;
  onSelect: (dayId: number) => void;
}

const DayCard: React.FC<DayCardProps> = ({ dayData, onUpdate, onSelect }) => {
  const [reflection, setReflection] = useState(dayData.reflection);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...dayData, isCompleted: e.target.checked });
  };

  const handleReflectionBlur = () => {
    if (reflection !== dayData.reflection) {
      onUpdate({ ...dayData, reflection });
    }
  };
  
  const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

  const cardClasses = `
    flex flex-col rounded-xl border
    p-6 transition-all duration-300 ease-in-out
    ${dayData.isCompleted
      ? 'bg-white/60 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700'
      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-md hover:shadow-xl hover:-translate-y-1'
    }
  `;

  return (
    <div className={cardClasses} onClick={() => onSelect(dayData.day)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onSelect(dayData.day)}>
      <div className={`flex-grow ${dayData.isCompleted ? 'opacity-60' : ''}`}>
        <div className="flex justify-between items-start mb-3">
          <div className="bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 text-xs font-bold px-3 py-1 rounded-full">
            DAY {dayData.day}
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">{dayData.title}</h3>

        <div className="mb-5">
          <p className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-2">Lessons:</p>
          <ul className="space-y-2 list-disc list-inside text-gray-700 dark:text-gray-300">
            {dayData.lessons.map((lesson, index) => (
              <li key={index}>{lesson}</li>
            ))}
          </ul>
        </div>

        <div className="mb-6">
          <p className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-2">Practice Task:</p>
          <p className="text-gray-700 dark:text-gray-300">{dayData.practiceTask}</p>
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-700/50" onClick={stopPropagation}>
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          onBlur={handleReflectionBlur}
          placeholder="Add a reflection..."
          rows={2}
          className="w-full text-sm p-2 rounded-md bg-gray-100 dark:bg-gray-700/60 border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500 transition"
        />
        <div className="mt-4">
          <label className="flex items-center space-x-3 cursor-pointer">
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
  );
};

export default DayCard;
