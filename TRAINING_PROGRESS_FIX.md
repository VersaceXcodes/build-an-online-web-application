# Training Course Progress Display Fix

## Issue
The course details page displayed contradictory progress status:
- Showed "100% Complete" and "Course Completed!" banner
- Simultaneously showed "0 of 6 lessons completed" in the progress bar description

## Root Cause
The frontend component (`UV_StaffTraining.tsx`) was not fetching actual lesson completion data. Instead, it had hardcoded logic that always returned `false` for lesson completion checks, resulting in "0 of X lessons completed" being displayed regardless of actual progress.

## Solution

### Backend Changes (`backend/server.ts`)
Added a new API endpoint to fetch lesson completions for a specific course:

```typescript
app.get('/api/training/courses/:course_id/lessons/completions', authenticateToken, requireRole(['staff']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT slc.* FROM staff_lesson_completion slc 
       INNER JOIN training_lessons tl ON slc.lesson_id = tl.lesson_id 
       WHERE slc.user_id = $1 AND tl.course_id = $2`,
      [req.user.user_id, req.params.course_id]
    );
    client.release();
    res.json(result.rows);
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to fetch lesson completions', error, 'LESSON_COMPLETIONS_FETCH_ERROR'));
  }
});
```

### Frontend Changes (`vitereact/src/components/views/UV_StaffTraining.tsx`)

1. **Added API function to fetch lesson completions:**
```typescript
const fetchLessonCompletions = async (courseId: string) => {
  const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/training/courses/${courseId}/lessons/completions`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
  return response.data;
};
```

2. **Added React Query hook for lesson completions:**
```typescript
const { data: lesson_completions = [] } = useQuery({
  queryKey: ['lesson_completions', course_id],
  queryFn: () => fetchLessonCompletions(course_id!),
  enabled: !!course_id,
  staleTime: 1 * 60 * 1000,
});
```

3. **Added helper functions to check lesson completion:**
```typescript
const isLessonCompleted = useCallback((lessonId: string) => {
  return lesson_completions.some((lc: any) => lc.lesson_id === lessonId && lc.is_completed);
}, [lesson_completions]);

const completed_lessons_count = lesson_completions.filter((lc: any) => lc.is_completed).length;
```

4. **Updated progress bar to display accurate completion count:**
- Changed from hardcoded `0` to `{completed_lessons_count}`
- Now correctly shows "X of Y lessons completed" based on actual data

5. **Updated lesson completion indicators:**
- Course details view: Lessons now show checkmark if completed
- Lesson sidebar: Shows accurate completion status for navigation

6. **Updated mutation to invalidate lesson completions cache:**
- When a lesson is marked complete, the lesson completions query is also invalidated to refresh the UI

## Testing
1. Navigate to `/staff/training`
2. Click on "Food Safety & Hygiene Level 2" course
3. Verify that:
   - Progress percentage matches the completed lessons count
   - "X of Y lessons completed" shows accurate numbers
   - Completed lessons show checkmarks
   - If all lessons are completed, "6 of 6 lessons completed" is shown alongside "100% Complete"

## Files Modified
- `backend/server.ts` - Added lesson completions endpoint
- `vitereact/src/components/views/UV_StaffTraining.tsx` - Added completion fetching and display logic
