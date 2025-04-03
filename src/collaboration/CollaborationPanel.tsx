import React from 'react';
import { useCollaboration } from './CollaborationContext';

interface CollaborationPanelProps {
  layoutId: string;
}

const CollaborationPanel: React.FC<CollaborationPanelProps> = ({ layoutId }) => {
  const { 
    isConnected, 
    isCollaborating, 
    participants, 
    joinSession, 
    leaveSession 
  } = useCollaboration();

  const handleToggleCollaboration = () => {
    if (isCollaborating) {
      leaveSession();
    } else {
      joinSession(layoutId);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Collaboration</h3>
        <div className="flex items-center">
          <span className={`inline-block w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>

      <button
        onClick={handleToggleCollaboration}
        className={`w-full py-2 px-4 rounded mb-4 ${
          isCollaborating
            ? 'bg-red-100 text-red-700 hover:bg-red-200'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
        disabled={!isConnected}
      >
        {isCollaborating ? 'Leave Session' : 'Start Collaborating'}
      </button>

      {isCollaborating && (
        <>
          <div className="mb-2">
            <h4 className="font-medium text-sm text-gray-700 mb-2">Participants ({participants.length})</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {participants.map(participant => (
                <div key={participant.id} className="flex items-center p-2 rounded bg-gray-50">
                  {participant.avatar_url ? (
                    <img
                      src={participant.avatar_url}
                      alt={participant.full_name}
                      className="w-8 h-8 rounded-full mr-2"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center mr-2">
                      {participant.full_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm">{participant.full_name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-gray-500 mt-3">
            <p>Changes are synced automatically.</p>
            <p>Others can see your cursor position and edits in real-time.</p>
          </div>
        </>
      )}
    </div>
  );
};

export default CollaborationPanel; 