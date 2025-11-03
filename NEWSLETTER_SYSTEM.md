# 📧 Newsletter System - CatBytes Blog

Complete newsletter system for automatically sending blog posts to subscribers via email.

## 🎯 Overview

The newsletter system allows users to subscribe to receive new blog posts directly via email. When a new post is automatically generated (via cron job), it's sent to all verified subscribers with a beautifully formatted HTML email.

## 🏗️ Architecture

### Database Tables

#### newsletter_subscribers
Stores all newsletter subscribers with verification and engagement tracking.

```sql
- id: UUID (primary key)
- email: TEXT (unique, required)
- name: TEXT (optional)
- subscribed: BOOLEAN (default: true)
- subscribed_at: TIMESTAMP
- verification_token: TEXT (unique)
- verified: BOOLEAN (default: false)
- emails_sent_count: INTEGER
- emails_opened_count: INTEGER
- emails_clicked_count: INTEGER
```

#### newsletter_campaigns
Tracks each newsletter campaign (email blast for a blog post).

```sql
- id: UUID (primary key)
- blog_post_id: UUID (foreign key to blog_posts)
- subject: TEXT
- sent_at: TIMESTAMP
- recipients_count: INTEGER
- opened_count: INTEGER
```

### API Routes

#### 1. `/api/newsletter/subscribe` (POST)
Handles new newsletter subscriptions.

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "source": "blog"
}
```

**Features:**
- Email validation
- Duplicate detection
- Verification token generation
- Welcome email with anti-spam instructions
- Beautiful HTML email template

#### 2. `/api/newsletter/send-post` (POST)
Sends a blog post to all verified subscribers.

**Request Body:**
```json
{
  "blogPostId": "uuid-here"
}
```

**Authorization:**
- Requires `CRON_SECRET` in Authorization header
- Format: `Bearer YOUR_CRON_SECRET`

**Features:**
- Fetches blog post details
- Gets all verified, subscribed users
- Sends emails in batches (50 per batch)
- Updates subscriber stats
- Creates campaign record
- Rate limit protection

#### 3. `/api/newsletter/unsubscribe` (GET)
Unsubscribes a user from the newsletter.

**Query Parameters:**
- `email`: User's email address

**Features:**
- One-click unsubscribe
- Beautiful HTML confirmation page
- Updates subscription status
- Maintains compliance with email regulations

### Components

#### NewsletterSignup Component
Reusable newsletter signup form with two variants:

**Blog Variant:**
- Full-width section with newsletter image
- Prominent anti-spam warning
- Name and email fields
- Success/error states
- Loading indicators

**Footer Variant (Not Currently Used):**
- Compact inline form
- Email-only subscription
- Minimal design

**Usage:**
```tsx
import { NewsletterSignup } from '@/components/newsletter/newsletter-signup'

// In blog page
<NewsletterSignup variant="blog" />

// In footer (if needed)
<NewsletterSignup variant="footer" />
```

## 🔄 Automated Workflow

### Blog Post Generation + Newsletter Flow

1. **Cron Job Triggers** (Tuesdays, Thursdays, Saturdays at 10:00 AM BRT)
   - Vercel Cron hits `/api/blog/cron`

2. **Generate Blog Post**
   - Cron calls `/api/blog/generate`
   - OpenAI generates content
   - DALL-E creates cover image
   - Post saved to Supabase

3. **Send to Subscribers**
   - Cron calls `/api/newsletter/send-post` with new post ID
   - System fetches all verified subscribers
   - Emails sent in batches of 50
   - Campaign record created
   - Subscriber stats updated

4. **Email Delivered**
   - Resend service delivers emails
   - Anti-spam headers included
   - Unsubscribe link in footer
   - Beautiful HTML formatting

## 📧 Email Templates

### Welcome Email
Sent when user subscribes to newsletter.

**Features:**
- CatBytes logo and gradient header
- Personalized greeting
- Anti-spam warning (add to contacts)
- Beautiful styling matching site design
- Unsubscribe link

### Blog Post Email
Sent when new post is published.

**Features:**
- Post cover image
- Category badge
- Title and excerpt
- Tags
- "Read More" button linking to blog
- Anti-spam reminder
- Unsubscribe link
- Responsive design

## 🛡️ Security & Compliance

### Anti-Spam Best Practices

1. **Sender Reputation**
   - Use dedicated sending domain: `contato@catbytes.site`
   - Configure SPF, DKIM, DMARC records
   - Monitor bounce rates

2. **User Guidance**
   - Prominent warnings to add sender to contacts
   - Clear unsubscribe links
   - Honest subject lines

3. **Double Opt-in** (Optional - Currently Single Opt-in)
   - Verification tokens generated
   - Can be extended to require email verification

4. **List Hygiene**
   - Track engagement metrics
   - Remove bounced emails
   - Honor unsubscribe requests immediately

### Authorization
- All sensitive endpoints require `CRON_SECRET`
- Prevents unauthorized access
- Protects subscriber data

## 🔧 Environment Variables

Required in `.env.local`:

```bash
# Resend API Key (for email delivery)
RESEND_API_KEY=re_your_key_here

# Site URL (for email links)
NEXT_PUBLIC_SITE_URL=https://catbytes.site

# Cron Secret (for securing endpoints)
CRON_SECRET=your_secure_random_string

# Supabase (for database)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 📊 Metrics & Tracking

### Subscriber Metrics
- `emails_sent_count`: Total emails sent to subscriber
- `emails_opened_count`: How many emails opened (future feature)
- `emails_clicked_count`: How many links clicked (future feature)

### Campaign Metrics
- `recipients_count`: Number of emails sent
- `opened_count`: Email open rate (future feature)

### Future Enhancements
- Track email opens with pixel
- Track link clicks
- A/B testing subject lines
- Subscriber segmentation
- Personalized content recommendations

## 🎨 Styling

All emails match CatBytes branding:
- **Primary Colors**: Purple (#8A2BE2), Pink (#FF69B4), Blue (#00BFFF)
- **Gradients**: Used in headers and buttons
- **Typography**: Sans-serif system fonts for compatibility
- **Responsive**: Mobile-optimized with inline CSS

## 🚀 Deployment Checklist

### Initial Setup

1. **Database**
   - [ ] Run `supabase/schema.sql` to create tables
   - [ ] Verify RLS policies are active

2. **Email Service**
   - [ ] Sign up for Resend.com
   - [ ] Get API key
   - [ ] Add `contato@catbytes.site` as verified sender
   - [ ] Configure DNS records (SPF, DKIM)

3. **Environment Variables**
   - [ ] Add `RESEND_API_KEY` to Vercel
   - [ ] Verify `CRON_SECRET` is set
   - [ ] Check `NEXT_PUBLIC_SITE_URL` is correct

4. **Testing**
   - [ ] Test subscription flow
   - [ ] Test welcome email delivery
   - [ ] Test blog post email
   - [ ] Test unsubscribe flow
   - [ ] Verify emails don't go to spam

### Monitoring

- Check Vercel logs for cron execution
- Monitor Resend dashboard for delivery rates
- Track subscriber growth in Supabase
- Review bounce and unsubscribe rates

## 📝 Usage Examples

### Manual Newsletter Send
If you want to manually send a post to subscribers:

```bash
curl -X POST https://catbytes.site/api/newsletter/send-post \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -d '{"blogPostId": "post-uuid-here"}'
```

### Get Subscriber Count
```sql
SELECT COUNT(*) FROM newsletter_subscribers
WHERE verified = true AND subscribed = true;
```

### View Recent Campaigns
```sql
SELECT
  c.sent_at,
  c.subject,
  c.recipients_count,
  p.title as post_title
FROM newsletter_campaigns c
JOIN blog_posts p ON c.blog_post_id = p.id
ORDER BY c.sent_at DESC
LIMIT 10;
```

## 🐛 Troubleshooting

### Emails Not Sending
1. Check Resend API key is correct
2. Verify sender domain is configured
3. Check Vercel logs for errors
4. Ensure subscribers are verified and subscribed

### Emails Going to Spam
1. Configure SPF/DKIM/DMARC records
2. Add clear unsubscribe links
3. Use dedicated sending domain
4. Avoid spam trigger words
5. Maintain good sender reputation

### Cron Not Executing
1. Verify Vercel Cron is enabled
2. Check cron schedule in `vercel.json`
3. Review cron execution logs
4. Ensure `CRON_SECRET` is set

## 🎯 Success Metrics

Track these KPIs for newsletter performance:
- **Subscriber Growth Rate**: New subscribers per week
- **Open Rate**: Percentage of emails opened (future)
- **Click-Through Rate**: Link clicks per send (future)
- **Unsubscribe Rate**: Should be < 1%
- **Bounce Rate**: Should be < 2%
- **Delivery Rate**: Should be > 98%

## 📚 Resources

- [Resend Documentation](https://resend.com/docs)
- [Email Anti-Spam Best Practices](https://sendgrid.com/blog/email-deliverability-best-practices/)
- [HTML Email Templates](https://templates.emailoctopus.com/)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

Built with ❤️ and 🐱 by CatBytes
