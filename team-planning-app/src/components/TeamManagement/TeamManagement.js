import React, { useState } from 'react';
import './TeamManagement.css';

function TeamManagement({ groups, addGroup, deleteGroup }) {
  const [newMemberName, setNewMemberName] = useState('');

  const handleAddMember = () => {
    if (newMemberName.trim() === '') return;
    addGroup(newMemberName.trim());
    setNewMemberName('');
  };

  return (
    <div className="team-management">
      <h2>Team Members</h2>
      <div className="add-member">
        <input
          type="text"
          value={newMemberName}
          onChange={(e) => setNewMemberName(e.target.value)}
          placeholder="New member name"
        />
        <button onClick={handleAddMember}>Add Member</button>
      </div>
      <ul>
        {groups.map(group => (
          <li key={group.id}>
            {group.title}
            <button onClick={() => deleteGroup(group.id)} className="delete-btn">Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TeamManagement;
