import React, { useState, useEffect } from 'react';
import { 
  EventType, 
  RequirementCategory, 
  RequirementStatus, 
  RequirementPriority,
  Requirement,
  EventRequirements,
  generateRequirements,
  calculateCompletionPercentage,
  getRequirementsByCategory
} from '../../utils/requirementsChecker';

interface EventRequirementsChecklistProps {
  eventType: EventType;
  attendeeCount: number;
  venueId: string;
  savedRequirements?: EventRequirements | null;
  onSave?: (requirements: EventRequirements) => void;
  className?: string;
}

const EventRequirementsChecklist: React.FC<EventRequirementsChecklistProps> = ({
  eventType,
  attendeeCount,
  venueId,
  savedRequirements = null,
  onSave,
  className = '',
}) => {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [activeCategory, setActiveCategory] = useState<RequirementCategory | 'all'>('all');
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [expandedRequirements, setExpandedRequirements] = useState<string[]>([]);
  const [editingRequirement, setEditingRequirement] = useState<string | null>(null);
  const [newNotes, setNewNotes] = useState<string>('');
  const [newResponsible, setNewResponsible] = useState<string>('');
  const [eventId] = useState(() => savedRequirements?.eventId || `event_${Math.random().toString(36).substring(2, 9)}`);

  // Initialize requirements on mount or when event type changes
  useEffect(() => {
    if (savedRequirements) {
      setRequirements(savedRequirements.requirements);
    } else {
      const generatedRequirements = generateRequirements(eventType, attendeeCount);
      setRequirements(generatedRequirements);
    }
  }, [eventType, attendeeCount, savedRequirements]);

  // Update completion percentage when requirements change
  useEffect(() => {
    const percentage = calculateCompletionPercentage(requirements);
    setCompletionPercentage(percentage);
  }, [requirements]);

  // Handle status change for a requirement
  const handleStatusChange = (requirementId: string, newStatus: RequirementStatus) => {
    const updatedRequirements = requirements.map(req => {
      if (req.id === requirementId) {
        return { ...req, status: newStatus, updatedAt: new Date() };
      }
      return req;
    });
    
    setRequirements(updatedRequirements);
    
    if (onSave) {
      saveRequirements(updatedRequirements);
    }
  };

  // Toggle expanded state for a requirement
  const toggleExpanded = (requirementId: string) => {
    if (expandedRequirements.includes(requirementId)) {
      setExpandedRequirements(expandedRequirements.filter(id => id !== requirementId));
    } else {
      setExpandedRequirements([...expandedRequirements, requirementId]);
    }
  };

  // Start editing a requirement
  const startEditing = (requirement: Requirement) => {
    setEditingRequirement(requirement.id);
    setNewNotes(requirement.notes || '');
    setNewResponsible(requirement.responsible || '');
  };

  // Save requirement details
  const saveRequirementDetails = (requirementId: string) => {
    const updatedRequirements = requirements.map(req => {
      if (req.id === requirementId) {
        return { 
          ...req, 
          notes: newNotes,
          responsible: newResponsible,
          updatedAt: new Date() 
        };
      }
      return req;
    });
    
    setRequirements(updatedRequirements);
    setEditingRequirement(null);
    
    if (onSave) {
      saveRequirements(updatedRequirements);
    }
  };

  // Save all requirements
  const saveRequirements = (updatedRequirements: Requirement[]) => {
    if (onSave) {
      const eventRequirements: EventRequirements = {
        eventId,
        eventType,
        venueId,
        attendeeCount,
        requirements: updatedRequirements,
        lastUpdated: new Date()
      };
      
      onSave(eventRequirements);
    }
  };

  // Get filtered requirements based on active category
  const getFilteredRequirements = () => {
    if (activeCategory === 'all') {
      return requirements;
    }
    
    return requirements.filter(req => req.category === activeCategory);
  };

  // Get the CSS class for requirement status
  const getStatusClass = (status: RequirementStatus): string => {
    switch (status) {
      case RequirementStatus.COMPLETED:
        return 'bg-green-100 text-green-800 border-green-200';
      case RequirementStatus.NOT_APPLICABLE:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  // Get the CSS class for requirement priority
  const getPriorityClass = (priority: RequirementPriority): string => {
    switch (priority) {
      case RequirementPriority.CRITICAL:
        return 'bg-red-100 text-red-800 border-red-200';
      case RequirementPriority.HIGH:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case RequirementPriority.MEDIUM:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  // Get icon for requirement category
  const getCategoryIcon = (category: RequirementCategory): string => {
    switch (category) {
      case RequirementCategory.SEATING:
        return '🪑';
      case RequirementCategory.CATERING:
        return '🍽️';
      case RequirementCategory.AUDIOVISUAL:
        return '🎬';
      case RequirementCategory.LIGHTING:
        return '💡';
      case RequirementCategory.DECOR:
        return '🎭';
      case RequirementCategory.ACCESSIBILITY:
        return '♿';
      case RequirementCategory.STAFFING:
        return '👥';
      case RequirementCategory.LOGISTICS:
        return '📦';
      case RequirementCategory.SAFETY:
        return '🛡️';
      default:
        return '📋';
    }
  };

  // Format category name for display
  const formatCategoryName = (category: RequirementCategory | 'all'): string => {
    if (category === 'all') return 'All Requirements';
    return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  };

  // Get requirements grouped by category for the category filter
  const categorizedRequirements = getRequirementsByCategory(requirements);

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      <div className="bg-blue-600 px-4 py-3">
        <h2 className="text-lg font-medium text-white">Event Requirements Checklist</h2>
      </div>
      
      <div className="p-4">
        {/* Event info summary */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-medium text-gray-900">{eventType.replace('_', ' ').charAt(0).toUpperCase() + eventType.replace('_', ' ').slice(1).toLowerCase()}</h3>
              <p className="text-gray-500 text-sm">Attendees: {attendeeCount}</p>
            </div>
            <div className="text-right">
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                      {completionPercentage}% Complete
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200 w-48">
                  <div 
                    style={{ width: `${completionPercentage}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Category filter */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center space-x-2">
            <button
              className={`mb-2 inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium 
                ${activeCategory === 'all' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
              onClick={() => setActiveCategory('all')}
            >
              All ({requirements.length})
            </button>
            
            {Object.entries(categorizedRequirements).map(([category, reqs]) => (
              reqs.length > 0 && (
                <button
                  key={category}
                  className={`mb-2 inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium
                    ${activeCategory === category ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                  onClick={() => setActiveCategory(category as RequirementCategory)}
                >
                  <span className="mr-1.5">{getCategoryIcon(category as RequirementCategory)}</span>
                  {formatCategoryName(category as RequirementCategory)} ({reqs.length})
                </button>
              )
            ))}
          </div>
        </div>
        
        {/* Requirements list */}
        <div className="space-y-4">
          {getFilteredRequirements().map((requirement) => (
            <div 
              key={requirement.id} 
              className={`border rounded-lg overflow-hidden ${
                requirement.status === RequirementStatus.COMPLETED 
                  ? 'border-green-200' 
                  : requirement.status === RequirementStatus.NOT_APPLICABLE 
                    ? 'border-gray-200' 
                    : 'border-gray-300'
              }`}
            >
              {/* Requirement header */}
              <div 
                className={`px-4 py-3 flex items-center justify-between cursor-pointer ${
                  requirement.status === RequirementStatus.COMPLETED 
                    ? 'bg-green-50' 
                    : requirement.status === RequirementStatus.NOT_APPLICABLE 
                      ? 'bg-gray-50' 
                      : 'bg-white'
                }`}
                onClick={() => toggleExpanded(requirement.id)}
              >
                <div className="flex items-center">
                  {requirement.status === RequirementStatus.COMPLETED ? (
                    <svg className="h-5 w-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : requirement.status === RequirementStatus.NOT_APPLICABLE ? (
                    <svg className="h-5 w-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    </svg>
                  )}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{requirement.title}</h4>
                    <div className="flex items-center mt-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 ${getStatusClass(requirement.status)}`}
                      >
                        {requirement.status.replace('_', ' ').charAt(0).toUpperCase() + requirement.status.replace('_', ' ').slice(1).toLowerCase()}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 ${getPriorityClass(requirement.priority)}`}
                      >
                        {requirement.priority.charAt(0).toUpperCase() + requirement.priority.slice(1).toLowerCase()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-lg mr-2">{getCategoryIcon(requirement.category)}</span>
                  <svg className={`h-5 w-5 text-gray-500 transform ${expandedRequirements.includes(requirement.id) ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              
              {/* Expanded requirement details */}
              {expandedRequirements.includes(requirement.id) && (
                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                  <p className="text-sm text-gray-600 mb-4">{requirement.description}</p>
                  
                  {/* Details section */}
                  {editingRequirement === requirement.id ? (
                    <div className="mb-4">
                      <div className="mb-3">
                        <label htmlFor={`responsible-${requirement.id}`} className="block text-xs font-medium text-gray-700 mb-1">
                          Responsible person/vendor
                        </label>
                        <input
                          type="text"
                          id={`responsible-${requirement.id}`}
                          value={newResponsible}
                          onChange={(e) => setNewResponsible(e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor={`notes-${requirement.id}`} className="block text-xs font-medium text-gray-700 mb-1">
                          Notes
                        </label>
                        <textarea
                          id={`notes-${requirement.id}`}
                          rows={3}
                          value={newNotes}
                          onChange={(e) => setNewNotes(e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => setEditingRequirement(null)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => saveRequirementDetails(requirement.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Save Details
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4">
                      {requirement.responsible && (
                        <div className="mb-2">
                          <span className="text-xs font-medium text-gray-500">Responsible:</span>
                          <span className="ml-2 text-sm text-gray-900">{requirement.responsible}</span>
                        </div>
                      )}
                      
                      {requirement.notes && (
                        <div className="mb-2">
                          <span className="text-xs font-medium text-gray-500">Notes:</span>
                          <p className="mt-1 text-sm text-gray-600">{requirement.notes}</p>
                        </div>
                      )}
                      
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() => startEditing(requirement)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <svg className="h-3.5 w-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          Add Details
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Status buttons */}
                  <div className="flex flex-wrap mt-2 space-x-2">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(requirement.id, RequirementStatus.PENDING)}
                      className={`inline-flex items-center px-2.5 py-1.5 border text-xs font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                        requirement.status === RequirementStatus.PENDING
                          ? 'border-yellow-300 bg-yellow-100 text-yellow-800'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Pending
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(requirement.id, RequirementStatus.COMPLETED)}
                      className={`inline-flex items-center px-2.5 py-1.5 border text-xs font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                        requirement.status === RequirementStatus.COMPLETED
                          ? 'border-green-300 bg-green-100 text-green-800'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <svg className="h-3.5 w-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Completed
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(requirement.id, RequirementStatus.NOT_APPLICABLE)}
                      className={`inline-flex items-center px-2.5 py-1.5 border text-xs font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                        requirement.status === RequirementStatus.NOT_APPLICABLE
                          ? 'border-gray-300 bg-gray-100 text-gray-800'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <svg className="h-3.5 w-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Not Applicable
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {getFilteredRequirements().length === 0 && (
            <div className="text-center py-6">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No requirements in this category</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try selecting a different category or event type.
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-gray-50 px-4 py-3 text-right">
        <button
          type="button"
          onClick={() => saveRequirements(requirements)}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Save Requirements
        </button>
      </div>
    </div>
  );
};

export default EventRequirementsChecklist; 