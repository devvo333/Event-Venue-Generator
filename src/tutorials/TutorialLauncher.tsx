import React, { useState } from 'react';
import { useTutorial } from './TutorialContext';

interface TutorialLauncherProps {
  trigger?: React.ReactNode;
  className?: string;
}

export const TutorialLauncher: React.FC<TutorialLauncherProps> = ({
  trigger,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { availableTutorials, completedTutorials, startTutorial, resetAllTutorials } = useTutorial();

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleStartTutorial = (tutorialId: string) => {
    startTutorial(tutorialId);
    setIsOpen(false);
  };

  const handleResetTutorials = async () => {
    if (window.confirm('Are you sure you want to reset all tutorials? This will mark them as not completed.')) {
      await resetAllTutorials();
    }
  };

  // Custom default trigger if none provided
  const defaultTrigger = (
    <button
      className="p-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-md flex items-center"
      onClick={toggleOpen}
      aria-label="Open tutorials"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      Help & Tutorials
    </button>
  );

  return (
    <div className={`relative ${className}`}>
      {/* Trigger element */}
      {trigger ? (
        <div onClick={toggleOpen}>{trigger}</div>
      ) : (
        defaultTrigger
      )}

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg z-50 overflow-hidden border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium">Help & Tutorials</h3>
            <p className="text-sm text-gray-500 mt-1">
              Learn how to use the Event Venue Generator with interactive guides
            </p>
          </div>

          <div className="max-h-80 overflow-y-auto">
            <div className="p-2">
              {availableTutorials.length === 0 ? (
                <p className="text-sm text-gray-500 p-2">No tutorials available</p>
              ) : (
                availableTutorials.map((tutorial) => {
                  const isCompleted = completedTutorials.includes(tutorial.id);
                  return (
                    <div
                      key={tutorial.id}
                      className="p-2 hover:bg-gray-50 rounded-md cursor-pointer flex items-center"
                      onClick={() => handleStartTutorial(tutorial.id)}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">{tutorial.name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {tutorial.steps.length} steps
                          {isCompleted && " • Completed"}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {isCompleted ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Done
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            Start
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <button
              className="text-xs text-gray-600 hover:text-blue-600"
              onClick={handleResetTutorials}
            >
              Reset all tutorials
            </button>
          </div>
        </div>
      )}
    </div>
  );
}; 