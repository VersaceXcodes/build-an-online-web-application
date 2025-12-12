# Low-Rated Feedback Test Guide

## Quick Test Reference

### Admin Login Credentials
- **Email**: admin@bakery.com
- **Password**: AdminPassword123!

### Test URL
https://123build-an-online-web-application.launchpulse.ai/admin/feedback

### Expected Results

#### When filtering for 1-2 star ratings:

You should see **4 feedback entries**:

1. **ORD-2024-0008** (Manchester Store) - ⭐ 1 star
   - Product: Dry lemon drizzle cake, lukewarm cinnamon rolls
   - Delivery: 30 minutes late, no communication, rude driver
   - Tags: cold, late, dry, poor_communication
   - Customer does NOT allow contact

2. **ORD-2024-0005** (Birmingham Store) - ⭐ 1 star
   - Product: Completely stale brownie, strange frosting taste
   - Delivery: Collection was fine, staff polite
   - Tags: stale, poor_quality, disappointing
   - Customer allows contact

3. **ORD-2024-0012** (London Flagship) - ⭐⭐ 2 stars
   - Product: Croissants okay but not as expected
   - Delivery: Rude driver, damaged eclair, no apology
   - Tags: damaged, rude_service, late
   - Customer allows contact

4. **ORD-2024-0003** (Manchester Store) - ⭐⭐ 2 stars
   - Product: Undercooked sourdough, doughy in middle
   - Delivery: Took 45 minutes (told 35), driver rushed
   - Tags: cold, late, undercooked
   - Customer allows contact

### Test Steps

1. **Login**: Navigate to https://123build-an-online-web-application.launchpulse.ai/admin/feedback
2. **Filter**: Apply filter for 1-2 star ratings
3. **Verify**: Confirm 4 feedback entries are displayed
4. **Select**: Click on any feedback entry
5. **Review**: Add internal notes (e.g., "Reviewing customer complaint regarding product quality")
6. **Update Status**: Change status from "pending_review" to "reviewed" or "under_investigation"
7. **Save**: Save the changes
8. **Verify**: Check that status updated correctly

### Key Features to Test

#### Internal Notes
- Add notes visible only to staff/admin
- Multiple notes can be added per feedback
- Notes show timestamp and author

#### Status Changes
Available statuses:
- `pending_review` - Initial state
- `under_investigation` - Being reviewed
- `reviewed` - Completed review
- `responded` - Customer contacted

#### Contact Preferences
- 3 out of 4 customers allow contact
- fb_low_004 (ORD-2024-0008) does NOT allow contact
- Check "allow_contact" field before reaching out

### Sample Test Scenario

**Scenario**: Admin reviews low-rated feedback and responds

1. Login as admin
2. Navigate to feedback page
3. Filter for 1-2 stars
4. Select ORD-2024-0005 (1 star, Birmingham Store)
5. Read feedback: "Stale products, inedible"
6. Add internal note: "Quality control issue identified. Contact Birmingham store manager."
7. Change status to "under_investigation"
8. Save changes
9. Verify status updated
10. Later: Change status to "responded" after resolution

### Database Verification

To verify the data is in the database:

```bash
cd /app/backend && node -e "
import('pg').then(async ({default: pg}) => {
  const {Pool} = pg;
  const dotenv = await import('dotenv');
  dotenv.config();
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  const client = await pool.connect();
  const result = await client.query(
    'SELECT COUNT(*) FROM customer_feedback WHERE overall_rating <= 2'
  );
  console.log('Low-rated feedback count:', result.rows[0].count);
  client.release();
  await pool.end();
});
"
```

Expected output: `Low-rated feedback count: 4`

### API Endpoint Test

Test the API directly:

```bash
# Get JWT token by logging in
curl -X POST https://123build-an-online-web-application.launchpulse.ai/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bakery.com","password":"AdminPassword123!"}'

# Use the token to query feedback
curl -X GET 'https://123build-an-online-web-application.launchpulse.ai/api/feedback/customer?min_rating=1&max_rating=2' \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Expected: JSON response with 4 feedback entries

### Common Issues & Solutions

#### Issue: "No Feedback Found"
**Solution**: Database was not seeded with low-rated feedback. Run:
```bash
cd /app/backend && node -e "..." # (see database verification above)
```

#### Issue: Cannot see feedback as staff user
**Solution**: Staff users only see feedback for their assigned locations. Use admin account (user_006) to see all feedback.

#### Issue: Feedback shows but cannot update status
**Solution**: Check that user has admin or manager role. Only admins and managers can update feedback status.

### Success Criteria

✅ Admin can login  
✅ Can navigate to /admin/feedback  
✅ Can filter for 1-2 star ratings  
✅ Sees exactly 4 feedback entries  
✅ Can click on feedback to view details  
✅ Can add internal notes  
✅ Can change review status  
✅ Can save changes  
✅ Changes persist after page reload  

## Notes for QA Team

- All 4 low-rated feedback entries are set to `pending_review` status
- 3 out of 4 customers have opted in to allow contact
- Feedback covers 3 different locations (Birmingham, London, Manchester)
- Issues span both product quality and service delivery
- Realistic tags help categorize common problems
- Created dates span from Jan 12-15, 2024

This provides comprehensive test coverage for the admin feedback review workflow.
