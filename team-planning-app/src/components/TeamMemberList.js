import React from 'react';
import TeamMember from './TeamMember';

const TeamMemberList = ({ teamMembers }) => {
  return (
    <div className="team-member-list">
      {teamMembers.map(member => (
        <TeamMember key={member.id} name={member.name} />
      ))}
    </div>
  );
};

export default TeamMemberList;
