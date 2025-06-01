import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TeamManagement from './TeamManagement';

describe('TeamManagement Component', () => {
  const mockAddGroup = jest.fn();
  const mockDeleteGroup = jest.fn();
  const sampleGroups = [
    { id: 'g1', title: 'Team Alpha' },
    { id: 'g2', title: 'Team Beta' },
  ];

  beforeEach(() => {
    mockAddGroup.mockClear();
    mockDeleteGroup.mockClear();
  });

  test('renders with no groups', () => {
    render(<TeamManagement groups={[]} addGroup={mockAddGroup} deleteGroup={mockDeleteGroup} />);
    expect(screen.getByText('Team Members')).toBeInTheDocument();
    expect(screen.queryByText('Team Alpha')).not.toBeInTheDocument();
  });

  test('renders list of groups', () => {
    render(<TeamManagement groups={sampleGroups} addGroup={mockAddGroup} deleteGroup={mockDeleteGroup} />);
    expect(screen.getByText('Team Alpha')).toBeInTheDocument();
    expect(screen.getByText('Team Beta')).toBeInTheDocument();
  });

  test('calls addGroup when add button is clicked with valid name', () => {
    render(<TeamManagement groups={[]} addGroup={mockAddGroup} deleteGroup={mockDeleteGroup} />);
    const input = screen.getByPlaceholderText('New member name');
    const button = screen.getByRole('button', { name: 'Add Member' });

    fireEvent.change(input, { target: { value: 'Newbie' } });
    fireEvent.click(button);

    expect(mockAddGroup).toHaveBeenCalledWith('Newbie');
    expect(input).toHaveValue(''); // Input should be cleared
  });

  test('does not call addGroup if name is empty or whitespace', () => {
    render(<TeamManagement groups={[]} addGroup={mockAddGroup} deleteGroup={mockDeleteGroup} />);
    const input = screen.getByPlaceholderText('New member name');
    const button = screen.getByRole('button', { name: 'Add Member' });

    fireEvent.change(input, { target: { value: '   ' } }); // Whitespace
    fireEvent.click(button);
    expect(mockAddGroup).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: '' } }); // Empty
    fireEvent.click(button);
    expect(mockAddGroup).not.toHaveBeenCalled();
  });

  test('calls deleteGroup with correct id when delete button is clicked', () => {
    render(<TeamManagement groups={sampleGroups} addGroup={mockAddGroup} deleteGroup={mockDeleteGroup} />);
    const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });

    // Click delete for "Team Alpha" (first group)
    fireEvent.click(deleteButtons[0]);
    expect(mockDeleteGroup).toHaveBeenCalledWith('g1');

    // Click delete for "Team Beta" (second group)
    fireEvent.click(deleteButtons[1]);
    expect(mockDeleteGroup).toHaveBeenCalledWith('g2');
  });
});
