import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Calendar from './Calendar'; // Adjust path as necessary

// Mock data similar to what App.js would provide
const mockTeamMembers = [
  { id: 'tm1', name: 'Alice' },
  { id: 'tm2', name: 'Bob' },
];

const mockProjects = [
  { id: 'proj1', name: 'Project Alpha', color: '#FFD700' },
  { id: 'proj2', name: 'Project Beta', color: '#ADFF2F' },
];

const mockGlobalEvents = [
  { date: '2024-07-29', name: 'Team Offsite', type: 'event' },
  { date: '2024-08-05', name: 'Public Holiday', type: 'pto' },
];

const mockStartDate = '2024-07-29'; // A Monday

describe('Calendar Component', () => {
  let mockProjectAssignments;
  let mockOnAssignmentChange;
  let mockOnAssignmentDragEnd;

  beforeEach(() => {
    // Reset mocks for each test
    mockProjectAssignments = [];
    mockOnAssignmentChange = jest.fn();
    mockOnAssignmentDragEnd = jest.fn();
  });

  const renderCalendar = (assignments = mockProjectAssignments) => {
    return render(
      <Calendar
        startDate={mockStartDate}
        events={mockGlobalEvents}
        projects={mockProjects}
        teamMembers={mockTeamMembers}
        projectAssignments={assignments}
        onAssignmentChange={mockOnAssignmentChange}
        onAssignmentDragEnd={mockOnAssignmentDragEnd}
      />
    );
  };

  test('renders basic structure: day headers, global events, team names', () => {
    renderCalendar();

    // Day headers
    ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach(day => {
      expect(screen.getAllByText(day)[0]).toBeInTheDocument(); // getAll because day numbers also exist
    });

    // Global events row label
    expect(screen.getByText('Global')).toBeInTheDocument();
    // Check for a global event
    expect(screen.getByText('Team Offsite')).toBeInTheDocument();

    // Team member names
    mockTeamMembers.forEach(member => {
      expect(screen.getByText(member.name)).toBeInTheDocument();
    });

    // Check for a few day numbers in the global calendar part
    expect(screen.getAllByText('29').length).toBeGreaterThan(0); // July 29
    expect(screen.getAllByText('5').length).toBeGreaterThan(0);  // Aug 5
  });

  test('clicking an empty cell calls onAssignmentChange to create an assignment', () => {
    renderCalendar();
    
    // Find all assignment cells. This is tricky without specific test IDs.
    // Let's find cells for the first team member.
    // The structure is: Team Member Name -> assignment-grid -> assignment-cell elements
    // There are 35 assignment cells per team member.
    const assignmentCells = screen.getAllByRole('gridcell'); // This might be too generic.
                                                            // Using a more specific selector if possible.
                                                            // For now, assume we can target a cell.

    // Let's target the first cell of the first team member.
    // The first few "gridcell" roles might be part of the header or global row.
    // This selector needs to be robust. A data-testid attribute on cells would be best.
    // Example: Find the first cell for Alice (tm1) for date 2024-07-29
    // This requires knowing the structure or adding test-ids.
    // For this test, we'll assume a way to get a specific cell.
    // A simple way: find a cell by its key if keys were predictable for testing,
    // or by its position if structure is fixed.

    // Let's simulate clicking the first actual assignment cell for the first team member.
    // The cells are rendered in order: global cells, then Alice's cells, then Bob's cells.
    // Global row has 35 cells. So Alice's first cell is effectively the 36th "assignment-cell" like element.
    // This is fragile. A better approach:
    const aliceRow = screen.getByText('Alice').closest('.team-member-row');
    const firstAliceCell = aliceRow.querySelector('.assignment-cell'); // Get first cell in Alice's row

    fireEvent.click(firstAliceCell);

    expect(mockOnAssignmentChange).toHaveBeenCalledTimes(1);
    expect(mockOnAssignmentChange).toHaveBeenCalledWith('tm1', '2024-07-29', null);
  });

  test('clicking an existing assignment cell calls onAssignmentChange to delete it', () => {
    const existingAssignments = [
      { id: 'assign1', teamMemberId: 'tm1', projectId: 'proj1', startDate: '2024-07-29', endDate: '2024-07-29' }
    ];
    renderCalendar(existingAssignments);

    // Find the cell that represents this assignment
    // This cell should contain 'Project Alpha'
    const assignedCell = screen.getByText('Project Alpha').closest('.assignment-cell');
    fireEvent.click(assignedCell);

    expect(mockOnAssignmentChange).toHaveBeenCalledTimes(1);
    expect(mockOnAssignmentChange).toHaveBeenCalledWith('tm1', '2024-07-29', 'assign1');
  });
  
  test('drag handle on an assignment end date calls onAssignmentDragEnd', () => {
    const assignmentsWithDragHandle = [
      { id: 'assignDrag', teamMemberId: 'tm1', projectId: 'proj1', startDate: '2024-07-29', endDate: '2024-07-30' } // Tue
    ];
    renderCalendar(assignmentsWithDragHandle);

    const dragHandle = screen.getByText('Project Alpha').closest('.assignment-cell.end-date').querySelector('.assignment-drag-handle');
    expect(dragHandle).toBeInTheDocument();
    
    // Simulate drag start on the handle
    fireEvent.dragStart(dragHandle, { dataTransfer: new DataTransfer() }); // Mock DataTransfer

    // Find a target cell to drop onto - e.g., the next day (2024-07-31, Wednesday)
    // This requires a robust way to select specific date cells for a team member.
    // Assuming 'tm1' is the first team member. Dates are '2024-07-29', '2024-07-30', '2024-07-31'
    // Alice's row cells:
    const aliceRow = screen.getByText('Alice').closest('.team-member-row');
    const allAliceCells = aliceRow.querySelectorAll('.assignment-cell');
    const targetDropCell = allAliceCells[2]; // 0-indexed: 29th, 30th, 31st -> index 2 for 31st

    fireEvent.dragOver(targetDropCell); // Must be called for drop to trigger
    fireEvent.drop(targetDropCell);

    expect(mockOnAssignmentDragEnd).toHaveBeenCalledTimes(1);
    // The assignmentId is set in handleDragStart via e.dataTransfer.setData("assignmentId", assignmentId);
    // The actual dataTransfer mechanism is complex to fully mock here without a library.
    // We are checking if the handler is called. The ID check depends on dataTransfer mock.
    // For now, this test primarily checks if onAssignmentDragEnd is invoked.
    // The arguments would be (assignmentIdFromDataTransfer, '2024-07-31')
    // A more direct test for onAssignmentDragEnd is in App.test.js (testing the function itself).
    expect(mockOnAssignmentDragEnd).toHaveBeenCalledWith(expect.any(String), '2024-07-31');
  });

  test('displays project name and color for an assigned cell spanning multiple days', () => {
    const multiDayAssignment = [
      { id: 'multi1', teamMemberId: 'tm1', projectId: 'proj2', startDate: '2024-08-01', endDate: '2024-08-02' }
    ];
    renderCalendar(multiDayAssignment);

    // Cells for Aug 1 and Aug 2 for Alice should show Project Beta
    const projectBetaCells = screen.getAllByText('Project Beta');
    expect(projectBetaCells.length).toBe(2); // One for each day in the range
    
    projectBetaCells.forEach(cellNode => {
        const cell = cellNode.closest('.assignment-cell');
        expect(cell).toHaveStyle(`background-color: ${mockProjects[1].color}`);
    });
  });

});

// Basic DataTransfer mock for Jest if not running in a full browser environment
if (typeof DataTransfer === 'undefined') {
  global.DataTransfer = class {
    constructor() {
      this.store = {};
    }
    setData(format, data) {
      this.store[format] = data;
    }
    getData(format) {
      return this.store[format];
    }
  };
}
