
import React, { useState } from 'react';

interface InputFormProps {
  onGeneratePlan: (skill: string, duration: number) => void;
}

const InputForm: React.FC<InputFormProps> = ({ onGeneratePlan }) => {
  const [skill, setSkill] = useState('');
  const [duration, setDuration] = useState(7);
  const DURATION_OPTIONS = [3, 5, 7, 10, 14, 21, 30];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGeneratePlan(skill, duration);
  };

  return (
    <div className="max-w-xl mx-auto mt-12 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="skill" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100 mb-2">
            What do you want to learn?
          </label>
          <input
            type="text"
            name="skill"
            id="skill"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            className="block w-full rounded-md border-0 py-3 px-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 transition"
            placeholder="e.g., 'React for web development'"
          />
        </div>
        <div>
           <label htmlFor="duration" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100 mb-2">
            How many days?
          </label>
          <select
            id="duration"
            name="duration"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="block w-full rounded-md border-0 py-3 pl-4 pr-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 transition"
          >
            {DURATION_OPTIONS.map(day => (
              <option key={day} value={day}>{day} Days</option>
            ))}
          </select>
        </div>

        <div>
          <button
            type="submit"
            className="w-full flex justify-center rounded-md bg-primary-600 px-3 py-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-colors"
          >
            Build My Plan
          </button>
        </div>
      </form>
    </div>
  );
};

export default InputForm;
