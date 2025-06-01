import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProjectManagement from './ProjectManagement';

describe('ProjectManagement Component', () => {
  const mockAddProject = jest.fn();
  const mockDeleteProject = jest.fn();
  const sampleProjects = [
    { id: 'p1', name: 'Project Phoenix' },
    { id: 'p2', name: 'Project Dragon' },
  ];

  beforeEach(() => {
    mockAddProject.mockClear();
    mockDeleteProject.mockClear();
  });

  test('renders with no projects and shows "No projects yet" message', () => {
    render(<ProjectManagement projects={[]} addProject={mockAddProject} deleteProject={mockDeleteProject} />);
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('No projects yet. Add one!')).toBeInTheDocument();
    expect(screen.queryByText('Project Phoenix')).not.toBeInTheDocument();
  });

  test('renders list of projects', () => {
    render(<ProjectManagement projects={sampleProjects} addProject={mockAddProject} deleteProject={mockDeleteProject} />);
    expect(screen.getByText('Project Phoenix')).toBeInTheDocument();
    expect(screen.getByText('Project Dragon')).toBeInTheDocument();
    expect(screen.queryByText('No projects yet. Add one!')).not.toBeInTheDocument();
  });

  test('calls addProject when add button is clicked with valid name', () => {
    render(<ProjectManagement projects={[]} addProject={mockAddProject} deleteProject={mockDeleteProject} />);
    const input = screen.getByPlaceholderText('New project name');
    const button = screen.getByRole('button', { name: 'Add Project' });

    fireEvent.change(input, { target: { value: 'New Initiative' } });
    fireEvent.click(button);

    expect(mockAddProject).toHaveBeenCalledWith('New Initiative');
    expect(input).toHaveValue(''); // Input should be cleared
  });

  test('does not call addProject if name is empty or whitespace', () => {
    render(<ProjectManagement projects={[]} addProject={mockAddProject} deleteProject={mockDeleteProject} />);
    const input = screen.getByPlaceholderText('New project name');
    const button = screen.getByRole('button', { name: 'Add Project' });

    fireEvent.change(input, { target: { value: '   ' } }); // Whitespace
    fireEvent.click(button);
    expect(mockAddProject).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: '' } }); // Empty
    fireEvent.click(button);
    expect(mockAddProject).not.toHaveBeenCalled();
  });

  test('calls deleteProject with correct id when delete button is clicked', () => {
    render(<ProjectManagement projects={sampleProjects} addProject={mockAddProject} deleteProject={mockDeleteProject} />);
    const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });

    fireEvent.click(deleteButtons[0]);
    expect(mockDeleteProject).toHaveBeenCalledWith('p1');

    fireEvent.click(deleteButtons[1]);
    expect(mockDeleteProject).toHaveBeenCalledWith('p2');
  });
});
