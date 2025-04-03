import React, { useEffect, useState, useRef } from 'react';
import { useTutorial } from './TutorialContext';

interface Position {
  top: number;
  left: number;
}

// Add static CSS to the document head
const addGlobalStyles = () => {
  if (typeof document !== 'undefined' && !document.getElementById('tutorial-tooltip-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'tutorial-tooltip-styles';
    styleEl.innerHTML = `
      .tutorial-highlight {
        position: relative;
        z-index: 41;
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5);
        border-radius: 4px;
      }
      
      .tutorial-tooltip::before {
        content: '';
        position: absolute;
        width: 0;
        height: 0;
        border: 8px solid transparent;
      }
      
      .tutorial-arrow-top::before {
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        border-bottom-color: white;
      }
      
      .tutorial-arrow-right::before {
        left: 100%;
        top: 50%;
        transform: translateY(-50%);
        border-left-color: white;
      }
      
      .tutorial-arrow-bottom::before {
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border-top-color: white;
      }
      
      .tutorial-arrow-left::before {
        right: 100%;
        top: 50%;
        transform: translateY(-50%);
        border-right-color: white;
      }
    `;
    document.head.appendChild(styleEl);
  }
};

export const TutorialTooltip: React.FC = () => {
  const {
    activeTutorial,
    activeStep,
    isPlaying,
    nextStep,
    previousStep,
    skipTutorial
  } = useTutorial();

  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });
  const [arrowPosition, setArrowPosition] = useState<string>('top');
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Add global styles on mount
  useEffect(() => {
    addGlobalStyles();
  }, []);

  // Update position when active step changes
  useEffect(() => {
    if (!isPlaying || !activeTutorial) return;

    const step = activeTutorial.steps[activeStep];
    if (!step) return;

    // If there's a target element, position the tooltip near it
    if (step.targetSelector) {
      const targetElement = document.querySelector(step.targetSelector);
      if (targetElement) {
        positionTooltipNearElement(targetElement as HTMLElement, step.placement || 'bottom');
      } else {
        // Default position in the center if target element not found
        setPosition({
          top: window.innerHeight / 2,
          left: window.innerWidth / 2
        });
        setArrowPosition('none');
      }
    } else {
      // Default position in the center if no target selector
      setPosition({
        top: window.innerHeight / 2,
        left: window.innerWidth / 2
      });
      setArrowPosition('none');
    }

    // Add highlight to the target element
    if (step.targetSelector) {
      const targetElement = document.querySelector(step.targetSelector);
      if (targetElement) {
        targetElement.classList.add('tutorial-highlight');
      }
    }

    // Clean up highlight when step changes
    return () => {
      if (step.targetSelector) {
        const targetElement = document.querySelector(step.targetSelector);
        if (targetElement) {
          targetElement.classList.remove('tutorial-highlight');
        }
      }
    };
  }, [activeTutorial, activeStep, isPlaying]);

  // Position the tooltip near the target element
  const positionTooltipNearElement = (element: HTMLElement, placement: string) => {
    if (!tooltipRef.current) return;

    const elementRect = element.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const spacing = 12; // Space between element and tooltip

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top = elementRect.top - tooltipRect.height - spacing;
        left = elementRect.left + (elementRect.width - tooltipRect.width) / 2;
        setArrowPosition('bottom');
        break;
      case 'right':
        top = elementRect.top + (elementRect.height - tooltipRect.height) / 2;
        left = elementRect.right + spacing;
        setArrowPosition('left');
        break;
      case 'bottom':
        top = elementRect.bottom + spacing;
        left = elementRect.left + (elementRect.width - tooltipRect.width) / 2;
        setArrowPosition('top');
        break;
      case 'left':
        top = elementRect.top + (elementRect.height - tooltipRect.height) / 2;
        left = elementRect.left - tooltipRect.width - spacing;
        setArrowPosition('right');
        break;
      default:
        // Center on the element
        top = elementRect.top + elementRect.height / 2 - tooltipRect.height / 2;
        left = elementRect.left + elementRect.width / 2 - tooltipRect.width / 2;
        setArrowPosition('none');
    }

    // Ensure the tooltip stays within viewport bounds
    if (top < 0) top = spacing;
    if (left < 0) left = spacing;
    if (top + tooltipRect.height > window.innerHeight) {
      top = window.innerHeight - tooltipRect.height - spacing;
    }
    if (left + tooltipRect.width > window.innerWidth) {
      left = window.innerWidth - tooltipRect.width - spacing;
    }

    setPosition({ top, left });
  };

  // Don't render anything if not playing a tutorial
  if (!isPlaying || !activeTutorial) {
    return null;
  }

  const step = activeTutorial.steps[activeStep];
  if (!step) {
    return null;
  }

  return (
    <>
      {/* Overlay to prevent interaction with the rest of the page during tutorial */}
      <div className="fixed inset-0 bg-black bg-opacity-20 z-40" onClick={skipTutorial} />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={`fixed z-50 p-4 bg-white rounded-lg shadow-lg max-w-sm tutorial-tooltip tutorial-arrow-${arrowPosition}`}
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`
        }}
      >
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">{step.title}</h3>
          <button
            onClick={skipTutorial}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close tutorial"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="mb-4 text-sm">{step.content}</div>

        <div className="flex justify-between">
          <div>
            {activeStep > 0 && (
              <button
                onClick={previousStep}
                className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded mr-2"
              >
                Previous
              </button>
            )}
          </div>
          <div className="text-sm text-gray-500">
            {activeStep + 1} of {activeTutorial.steps.length}
          </div>
          <div>
            <button
              onClick={nextStep}
              className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded"
            >
              {activeStep < activeTutorial.steps.length - 1 ? 'Next' : 'Finish'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}; 