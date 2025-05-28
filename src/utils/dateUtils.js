/**
 * Checks if a single date overlaps with any existing assignment for a specific team member.
 * @param {string} date - The date to check (YYYY-MM-DD).
 * @param {Array} assignments - Array of assignment objects { teamMemberId, startDate, endDate }.
 * @param {string|number} teamMemberId - The ID of the team member.
 * @returns {boolean} True if there is an overlap, false otherwise.
 */
export const isDateOverlapping = (date, assignments, teamMemberId) => {
  if (!date || !assignments || !teamMemberId) return false;
  return assignments.some(ass =>
    ass.teamMemberId === teamMemberId &&
    date >= ass.startDate && date <= ass.endDate
  );
};

/**
 * Checks if a given date range overlaps with any existing assignment for a specific team member,
 * optionally excluding a specific assignment (e.g., the one being modified).
 * @param {string} startDate - The start date of the range to check (YYYY-MM-DD).
 * @param {string} endDate - The end date of the range to check (YYYY-MM-DD).
 * @param {Array} assignments - Array of assignment objects { id, teamMemberId, startDate, endDate }.
 * @param {string|number} teamMemberId - The ID of the team member.
 * @param {string|null} excludeAssignmentId - The ID of an assignment to exclude from the check.
 * @returns {boolean} True if there is an overlap, false otherwise.
 */
export const isRangeOverlapping = (startDate, endDate, assignments, teamMemberId, excludeAssignmentId = null) => {
  if (!startDate || !endDate || !assignments || !teamMemberId) return false;
  
  return assignments.some(otherAss => {
    if (otherAss.id === excludeAssignmentId || otherAss.teamMemberId !== teamMemberId) {
      return false; // Don't check against itself or assignments of other team members
    }
    // Standard overlap condition: A.startDate <= B.endDate && A.endDate >= B.startDate
    return startDate <= otherAss.endDate && endDate >= otherAss.startDate;
  });
};
