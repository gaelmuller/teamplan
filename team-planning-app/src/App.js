import React, { useState } from 'react';
import './App.css';
import Calendar from './components/Calendar'; 
import { isDateOverlapping, isRangeOverlapping } from './utils/dateUtils'; // Import utils

function App() {
  const sampleTeamMembers = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Charlie' }
  ];

  const [projectAssignments, setProjectAssignments] = useState([]); 

  // Function to handle creating or removing assignments
  const handleAssignmentChange = (teamMemberId, date, existingAssignmentId = null) => {
    setProjectAssignments(prevAssignments => {
      if (existingAssignmentId) {
        // Remove the existing assignment block
        return prevAssignments.filter(assignment => assignment.id !== existingAssignmentId);
      } else {
        // Create a new single-day assignment
        if (sampleProjects.length === 0) {
          console.warn("No projects available to assign.");
          return prevAssignments;
        }

        // Use utility function for overlap check
        if (isDateOverlapping(date, prevAssignments, teamMemberId)) {
          console.warn(`Cannot create new assignment: Date ${date} for team member ${teamMemberId} is already covered by an existing assignment.`);
          return prevAssignments; 
        }

        const newAssignment = {
          id: Date.now().toString(), // Simple unique ID
          teamMemberId,
          projectId: sampleProjects[0].id, // Assign first project
          startDate: date,
          endDate: date, // Single day assignment initially
        };
        return [...prevAssignments, newAssignment];
      }
    });
  };

  const handleAssignmentDragEnd = (assignmentId, newEndDate) => {
    setProjectAssignments(prevAssignments => {
      const assignmentToUpdate = prevAssignments.find(ass => ass.id === assignmentId);
      if (!assignmentToUpdate) return prevAssignments;

      // Ensure newEndDate is not before startDate
      if (newEndDate < assignmentToUpdate.startDate) {
        console.warn("Cannot drag endDate before startDate.");
        // Optionally, reset to original endDate or startDate, for now, just prevent update
        return prevAssignments; 
      }

      // Use utility function for overlap check, excluding the current assignment
      if (isRangeOverlapping(assignmentToUpdate.startDate, newEndDate, prevAssignments, assignmentToUpdate.teamMemberId, assignmentId)) {
        console.warn(`Cannot extend assignment: New range ${assignmentToUpdate.startDate} - ${newEndDate} overlaps with an existing assignment for team member ${assignmentToUpdate.teamMemberId}.`);
        return prevAssignments; // Prevent update
      }

      // If no overlap, proceed with the update
      return prevAssignments.map(ass =>
        ass.id === assignmentId ? { ...ass, endDate: newEndDate } : ass
      );
    });
  };

  const globalEvents = [
    { date: '2024-07-29', name: 'Team Offsite', type: 'event' },
    { date: '2024-07-31', name: 'Mid-week Briefing', type: 'event' },
    { date: '2024-08-05', name: 'Public Holiday', type: 'pto' },
    { date: '2024-08-06', name: 'Alice PTO', type: 'pto'},
    { date: '2024-08-15', name: 'Project Deadline', type: 'event' }
  ];

  const calendarStartDate = '2024-07-29'; // Monday

  const sampleProjects = [
    { id: 'proj1', name: 'Project Alpha', color: '#FFD700' }, // Gold
    { id: 'proj2', name: 'Project Beta', color: '#ADFF2F' },  // GreenYellow
    { id: 'proj3', name: 'Project Gamma', color: '#87CEFA' }  // LightSkyBlue
  ];

  return (
    <div className="App">
      <h1>Project Planner</h1>
      {/* <TeamMemberList teamMembers={sampleTeamMembers} /> */} {/* Team member list removed as requested */}
      {/* <hr /> Optional separator removed as TeamMemberList is gone */}
      <Calendar 
        startDate={calendarStartDate} 
        events={globalEvents} 
        projects={sampleProjects}
        teamMembers={sampleTeamMembers}
        projectAssignments={projectAssignments}
        // Pass the new handlers to Calendar
        onAssignmentChange={handleAssignmentChange}
        onAssignmentDragEnd={handleAssignmentDragEnd}
        // setProjectAssignments is still needed for direct manipulations if any, 
        // or could be removed if all updates go via new handlers.
        // For now, keeping it for flexibility during refactor.
        setProjectAssignments={setProjectAssignments} 
      />
    </div>
  );
}

export default App;
