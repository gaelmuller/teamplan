import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import { v4 as uuidv4 } from 'uuid'; // For mocking

// Mock react-calendar-timeline and its CSS
jest.mock('react-calendar-timeline', () => ({
  __esModule: true, // This is important for ES6 modules
  default: ({ groups, items, onItemMove, onItemResize, itemRenderer }) => (
    <div data-testid="mock-timeline">
      {groups.map(g => <div key={g.id}>{g.title}</div>)}
      {items.map(i => <div key={i.id}>{itemRenderer ? itemRenderer({item: i, itemContext: {}, getItemProps: () => ({})}).props.children[1].props.children : i.title}</div>)}
    </div>
  ),
  TimelineMarkers: ({ children }) => <div data-testid="mock-timeline-markers">{children}</div>,
  TodayMarker: () => <div data-testid="mock-today-marker">Today</div>,
}));
jest.mock('react-calendar-timeline/lib/Timeline.css', () => ({}));
jest.mock('uuid', () => ({ v4: jest.fn() })); // Mock uuid

describe('App Component', () => {
  let mockUuidCounter;

  beforeEach(() => {
    // Reset counter for predictable UUIDs in tests
    mockUuidCounter = 0;
    uuidv4.mockImplementation(() => `test-uuid-${mockUuidCounter++}`);
    // Mock initialData to be empty to test default data generation
    jest.mock('./data/initialData.json', () => ({
        groups: [],
        items: [],
        projects: []
    }), { virtual: true });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('renders the application header', () => {
    render(<App />);
    expect(screen.getByText(/Team Planning Calendar/i)).toBeInTheDocument();
  });

  test('loads initial default groups and projects if initialData is empty', async () => {
    render(<App />);
    // Wait for useEffect to run and state to update
    expect(await screen.findByText('Team Member 1')).toBeInTheDocument();
    expect(await screen.findByText('Project Alpha')).toBeInTheDocument();
  });

  test('allows adding a new team member', async () => {
    render(<App />);
    await screen.findByText('Team Member 1'); // Ensure initial load

    const input = screen.getByPlaceholderText(/New member name/i);
    const addButton = screen.getByRole('button', { name: /Add Member/i });

    fireEvent.change(input, { target: { value: 'New Teammate' } });
    fireEvent.click(addButton);

    expect(await screen.findByText('New Teammate')).toBeInTheDocument();
  });

  test('allows deleting a team member', async () => {
    render(<App />);
    // Wait for "Team Member 1" to be present
    const member1Text = await screen.findByText('Team Member 1');
    expect(member1Text).toBeInTheDocument();

    // Find delete button associated with "Team Member 1"
    // Assuming delete buttons are siblings or close in structure
    const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
    // This is brittle; ideally, items would have test-ids or more specific selectors
    // For now, let's assume the first "Delete" button in TeamManagement section is for "Team Member 1"
    // A better way would be to get the list item and find the button within it.
    const teamManagementSection = screen.getByText('Team Members').closest('div');
    const member1Li = Array.from(teamManagementSection.querySelectorAll('li')).find(li => li.textContent.includes('Team Member 1'));
    const deleteButtonForMember1 = member1Li.querySelector('button[name="Delete"], button.delete-btn');


    fireEvent.click(deleteButtonForMember1);

    expect(screen.queryByText('Team Member 1')).not.toBeInTheDocument();
  });

  test('allows adding a new project', async () => {
    render(<App />);
    await screen.findByText('Project Alpha'); // Ensure initial load

    const input = screen.getByPlaceholderText(/New project name/i);
    const addButton = screen.getByRole('button', { name: /Add Project/i });

    fireEvent.change(input, { target: { value: 'New Big Project' } });
    fireEvent.click(addButton);

    expect(await screen.findByText('New Big Project')).toBeInTheDocument();
  });

  test('allows deleting a project and its associated items', async () => {
    render(<App />);
    // Wait for "Project Alpha" to be present
    const projectAlphaText = await screen.findByText('Project Alpha');
    expect(projectAlphaText).toBeInTheDocument();

    // Add an item assigned to Project Alpha to test cascade deletion
    const groupSelect = screen.getByRole('combobox', { name: '' }); // No accessible name given for selects
    const projectSelect = screen.getAllByRole('combobox', { name: '' })[1]; // Second combobox
    const startDateInput = screen.getByLabelText(/start date/i, { selector: 'input[type="date"]'}); // More robust
    const endDateInput = screen.getByLabelText(/end date/i, { selector: 'input[type="date"]'});
    const addAssignmentButton = screen.getByRole('button', { name: /Add Assignment/i });

    // Find default group and project IDs (assuming they are the first options after placeholder)
    const defaultGroupId = screen.getAllByRole('option', {name: 'Team Member 1'})[0].value;
    const projectAlphaId = screen.getAllByRole('option', {name: 'Project Alpha'})[0].value;


    fireEvent.change(groupSelect, { target: { value: defaultGroupId } });
    fireEvent.change(projectSelect, { target: { value: projectAlphaId } });
    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
    fireEvent.change(endDateInput, { target: { value: '2024-01-03' } });
    fireEvent.click(addAssignmentButton);

    // Wait for the item to appear in the mock timeline (rendered by project name)
    expect(await screen.findByText(/Project Alpha - \d{2}:\d{2} - \d{2}:\d{2}/i)).toBeInTheDocument();

    const projectManagementSection = screen.getByText('Projects').closest('div');
    const projectAlphaLi = Array.from(projectManagementSection.querySelectorAll('li')).find(li => li.textContent.includes('Project Alpha'));
    const deleteButtonForProjectAlpha = projectAlphaLi.querySelector('button.delete-btn');

    fireEvent.click(deleteButtonForProjectAlpha);

    expect(screen.queryByText('Project Alpha')).not.toBeInTheDocument();
    // Check if the item associated with Project Alpha is also removed from the mock timeline
    expect(screen.queryByText(/Project Alpha - \d{2}:\d{2} - \d{2}:\d{2}/i)).not.toBeInTheDocument();
  });

  test('adds a new assignment via the form', async () => {
    render(<App />);
    await screen.findByText('Team Member 1'); // Ensure initial data load

    const groupSelect = screen.getAllByRole('combobox')[0]; // First select is group
    const projectSelect = screen.getAllByRole('combobox')[1]; // Second select is project
    const startDateInput = screen.getByRole('textbox', {name: /start date/i});
    const endDateInput = screen.getByRole('textbox', {name: /end date/i});
    const addAssignmentButton = screen.getByRole('button', { name: /Add Assignment/i });

    const firstGroupId = screen.getAllByRole('option', {name: 'Team Member 1'})[0].value;
    const firstProjectId = screen.getAllByRole('option', {name: 'Project Alpha'})[0].value;


    fireEvent.change(groupSelect, { target: { value: firstGroupId } });
    fireEvent.change(projectSelect, { target: { value: firstProjectId } });
    fireEvent.change(startDateInput, { target: { value: '2024-02-10' } });
    fireEvent.change(endDateInput, { target: { value: '2024-02-12' } });

    act(() => {
      fireEvent.click(addAssignmentButton);
    });

    // Check if the item appears in the mock timeline (rendered by project name and times)
    // The regex needs to be flexible for time part due to moment() formatting
    expect(await screen.findByText(/Project Alpha - \d{2}:\d{2} - \d{2}:\d{2}/i)).toBeInTheDocument();
  });

});
