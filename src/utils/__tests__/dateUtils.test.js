import { isDateOverlapping, isRangeOverlapping } from '../dateUtils';

describe('dateUtils', () => {
  const mockAssignments = [
    { id: '1', teamMemberId: 'tm1', startDate: '2024-08-05', endDate: '2024-08-07' }, // Mon-Wed
    { id: '2', teamMemberId: 'tm1', startDate: '2024-08-09', endDate: '2024-08-09' }, // Fri (single day)
    { id: '3', teamMemberId: 'tm2', startDate: '2024-08-05', endDate: '2024-08-06' }, 
  ];

  // Tests for isDateOverlapping
  describe('isDateOverlapping', () => {
    it('should return false if date is null', () => {
      expect(isDateOverlapping(null, mockAssignments, 'tm1')).toBe(false);
    });

    it('should return false if assignments array is null', () => {
      expect(isDateOverlapping('2024-08-05', null, 'tm1')).toBe(false);
    });
    
    it('should return false if teamMemberId is null', () => {
      expect(isDateOverlapping('2024-08-05', mockAssignments, null)).toBe(false);
    });

    it('should return false for a date with no overlap for the given team member', () => {
      expect(isDateOverlapping('2024-08-01', mockAssignments, 'tm1')).toBe(false); // Before any assignment
      expect(isDateOverlapping('2024-08-08', mockAssignments, 'tm1')).toBe(false); // Between assignments
      expect(isDateOverlapping('2024-08-10', mockAssignments, 'tm1')).toBe(false); // After all assignments
    });

    it('should return true if the date is the start date of an assignment', () => {
      expect(isDateOverlapping('2024-08-05', mockAssignments, 'tm1')).toBe(true);
    });

    it('should return true if the date is the end date of an assignment', () => {
      expect(isDateOverlapping('2024-08-07', mockAssignments, 'tm1')).toBe(true);
    });

    it('should return true if the date is within an assignment range', () => {
      expect(isDateOverlapping('2024-08-06', mockAssignments, 'tm1')).toBe(true);
    });

    it('should return true for a single-day assignment', () => {
      expect(isDateOverlapping('2024-08-09', mockAssignments, 'tm1')).toBe(true);
    });

    it('should return false if the date overlaps but for a different team member', () => {
      expect(isDateOverlapping('2024-08-05', mockAssignments, 'tm2')).toBe(true); // Control check for tm2
      expect(isDateOverlapping('2024-08-07', mockAssignments, 'tm2')).toBe(false); // tm2's assignment ends on 08-06
    });
  });

  // Tests for isRangeOverlapping
  describe('isRangeOverlapping', () => {
    const assignmentsForRangeTest = [
      { id: 'r1', teamMemberId: 'tm1', startDate: '2024-08-05', endDate: '2024-08-07' },
      { id: 'r2', teamMemberId: 'tm1', startDate: '2024-08-10', endDate: '2024-08-12' },
      { id: 'r3', teamMemberId: 'tm2', startDate: '2024-08-05', endDate: '2024-08-06' },
    ];

    it('should return false if startDate is null', () => {
      expect(isRangeOverlapping(null, '2024-08-05', assignmentsForRangeTest, 'tm1')).toBe(false);
    });
    
    it('should return false if endDate is null', () => {
      expect(isRangeOverlapping('2024-08-05', null, assignmentsForRangeTest, 'tm1')).toBe(false);
    });

    it('should return false if assignments array is null', () => {
      expect(isRangeOverlapping('2024-08-05', '2024-08-05', null, 'tm1')).toBe(false);
    });

    it('should return false if teamMemberId is null', () => {
      expect(isRangeOverlapping('2024-08-05', '2024-08-05', assignmentsForRangeTest, null)).toBe(false);
    });

    it('should return false for a range with no overlap', () => {
      expect(isRangeOverlapping('2024-08-01', '2024-08-03', assignmentsForRangeTest, 'tm1')).toBe(false); // Before
      expect(isRangeOverlapping('2024-08-08', '2024-08-09', assignmentsForRangeTest, 'tm1')).toBe(false); // Between
      expect(isRangeOverlapping('2024-08-13', '2024-08-15', assignmentsForRangeTest, 'tm1')).toBe(false); // After
    });

    it('should return true if new range (A) starts during existing (B) (A.start <= B.end && A.end >= B.start)', () => {
      // A: 08-06 to 08-08, B: 08-05 to 08-07 (r1)
      expect(isRangeOverlapping('2024-08-06', '2024-08-08', assignmentsForRangeTest, 'tm1')).toBe(true);
    });
    
    it('should return true if new range (A) ends during existing (B)', () => {
      // A: 08-04 to 08-06, B: 08-05 to 08-07 (r1)
      expect(isRangeOverlapping('2024-08-04', '2024-08-06', assignmentsForRangeTest, 'tm1')).toBe(true);
    });

    it('should return true if new range (A) contains existing (B)', () => {
      // A: 08-04 to 08-08, B: 08-05 to 08-07 (r1)
      expect(isRangeOverlapping('2024-08-04', '2024-08-08', assignmentsForRangeTest, 'tm1')).toBe(true);
    });

    it('should return true if existing (B) contains new range (A)', () => {
      // A: 08-06 to 08-06, B: 08-05 to 08-07 (r1)
      expect(isRangeOverlapping('2024-08-06', '2024-08-06', assignmentsForRangeTest, 'tm1')).toBe(true);
    });
    
    it('should return true for exact match with an existing assignment', () => {
      expect(isRangeOverlapping('2024-08-05', '2024-08-07', assignmentsForRangeTest, 'tm1')).toBe(true);
    });

    it('should return true if new range starts before and ends after existing (B)', () => {
      // A: 08-04 to 08-11, B: 08-05 to 08-07 (r1) and B: 08-10 to 08-12 (r2)
      // This should catch overlap with r1 or r2
      expect(isRangeOverlapping('2024-08-04', '2024-08-11', assignmentsForRangeTest, 'tm1')).toBe(true);
    });

    it('should exclude the assignment with excludeAssignmentId', () => {
      // Overlaps with r1, but r1 is excluded
      expect(isRangeOverlapping('2024-08-06', '2024-08-08', assignmentsForRangeTest, 'tm1', 'r1')).toBe(false);
      // Still overlaps with r2
      expect(isRangeOverlapping('2024-08-08', '2024-08-11', assignmentsForRangeTest, 'tm1', 'r1')).toBe(true);
    });

    it('should return false if range overlaps but for a different team member', () => {
      expect(isRangeOverlapping('2024-08-05', '2024-08-05', assignmentsForRangeTest, 'tm2')).toBe(true); // for tm2
      expect(isRangeOverlapping('2024-08-07', '2024-08-07', assignmentsForRangeTest, 'tm2')).toBe(false); // tm2's r3 ends 08-06
    });
  });
});
