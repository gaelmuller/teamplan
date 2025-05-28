import React from 'react';

// Helper function to get dates for the calendar grid
const getCalendarDates = (startDateStr) => {
  const dates = [];
  const currentDate = new Date(startDateStr + 'T00:00:00Z'); // Use UTC
  while (currentDate.getUTCDay() !== 1) { // Monday
    currentDate.setUTCDate(currentDate.getUTCDate() - 1);
  }
  const firstDayOfCalendar = new Date(currentDate);
  for (let i = 0; i < 35; i++) { // 5 weeks
    const date = new Date(firstDayOfCalendar);
    date.setUTCDate(firstDayOfCalendar.getUTCDate() + i);
    dates.push({
      fullDate: date.toISOString().split('T')[0],
      dayOfMonth: date.getUTCDate(),
    });
  }
  return dates;
};

const Calendar = ({ 
  startDate = '2024-07-29', 
  events = [], 
  projects = [], 
  teamMembers = [], 
  projectAssignments = [], 
  onAssignmentChange, // New handler from App.js
  onAssignmentDragEnd,  // New handler from App.js
  // setProjectAssignments // Kept for now, but ideally replaced by new handlers
}) => {
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const calendarDates = getCalendarDates(startDate);

  const globalEventsByDate = events.reduce((acc, event) => {
    const date = event.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {});

  const getProjectById = (projectId) => projects.find(p => p.id === projectId);

  // Modified to use onAssignmentChange
  const handleCellClickInternal = (teamMemberId, dateStr) => {
    // Check if this cell is part of an existing assignment for this team member
    const existingAssignment = projectAssignments.find(
      pa => pa.teamMemberId === teamMemberId && 
            dateStr >= pa.startDate && 
            dateStr <= pa.endDate
    );

    if (existingAssignment) {
      onAssignmentChange(teamMemberId, dateStr, existingAssignment.id); // Pass assignment ID to remove
    } else {
      onAssignmentChange(teamMemberId, dateStr, null); // No existing assignment ID, so create new
    }
  };
  
  // Drag and Drop Handlers
  const handleDragStart = (e, assignmentId) => {
    e.dataTransfer.setData("assignmentId", assignmentId);
    // Potentially add a class for visual feedback during drag
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e, teamMemberId, targetDate) => {
    e.preventDefault();
    const assignmentId = e.dataTransfer.getData("assignmentId");
    
    // Ensure the drop is within the same team member's row
    // This check might be more complex if assignments could move between members
    const assignmentBeingDragged = projectAssignments.find(a => a.id === assignmentId);
    if (assignmentBeingDragged && assignmentBeingDragged.teamMemberId === teamMemberId) {
        // Validate targetDate is not before startDate
        if (targetDate < assignmentBeingDragged.startDate) {
            console.warn("Cannot drag endDate before startDate.");
            onAssignmentDragEnd(assignmentId, assignmentBeingDragged.startDate); // Reset to startDate or original endDate
        } else {
            onAssignmentDragEnd(assignmentId, targetDate);
        }
    } else {
        console.warn("Invalid drop target or assignment.");
    }
  };


  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <div className="team-member-name-header-cell">Team</div>
        {daysOfWeek.map(day => (
          <div key={day} className="calendar-header-cell">{day}</div>
        ))}
      </div>
      
      <div className="global-calendar-row">
        <div className="team-member-name-cell global-events-label">Global</div>
        <div className="calendar-grid global-events-grid">
            {calendarDates.map((dateObj) => {
            const dailyGlobalEvents = globalEventsByDate[dateObj.fullDate] || [];
            return (
                <div key={`global-${dateObj.fullDate}`} className="calendar-day-cell global-day-cell">
                <div className="day-number">{dateObj.dayOfMonth}</div>
                <div className="events-in-cell">
                    {dailyGlobalEvents.map(event => (
                    <div key={event.name} className={`event-item ${event.type}`}>
                        {event.name}
                    </div>
                    ))}
                </div>
                </div>
            );
            })}
        </div>
      </div>

      <div className="team-assignments-container">
        {teamMembers.map(member => (
          <div key={member.id} className="team-member-row">
            <div className="team-member-name-cell">{member.name}</div>
            <div className="assignment-grid">
              {calendarDates.map(dateObj => {
                const assignment = projectAssignments.find(
                  pa => pa.teamMemberId === member.id && 
                        dateObj.fullDate >= pa.startDate && 
                        dateObj.fullDate <= pa.endDate
                );
                const project = assignment ? getProjectById(assignment.projectId) : null;
                
                const isStartDate = assignment && dateObj.fullDate === assignment.startDate;
                const isEndDate = assignment && dateObj.fullDate === assignment.endDate;

                let cellClassName = "assignment-cell";
                if (assignment) {
                    cellClassName += " assigned";
                    if (isStartDate) cellClassName += " start-date";
                    if (isEndDate) cellClassName += " end-date";
                }

                return (
                  <div 
                    key={`${member.id}-${dateObj.fullDate}`} 
                    className={cellClassName}
                    style={project ? { backgroundColor: project.color, position: 'relative' } : {position: 'relative'}}
                    onClick={() => handleCellClickInternal(member.id, dateObj.fullDate)}
                    onDragOver={handleDragOver} // Allow dropping onto any cell
                    onDrop={(e) => handleDrop(e, member.id, dateObj.fullDate)} // Handle drop on any cell
                  >
                    {project ? <span className="project-name-display">{project.name}</span> : ''}
                    {assignment && isEndDate && ( // Show drag handle only on the last day of an assignment
                      <div 
                        className="assignment-drag-handle"
                        draggable="true"
                        onDragStart={(e) => handleDragStart(e, assignment.id)}
                      >
                        {/* Handle visual (e.g., dots, icon) */}
                        &#x21F2; {/* Example Unicode arrow, can be replaced by SVG or styled div */}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
