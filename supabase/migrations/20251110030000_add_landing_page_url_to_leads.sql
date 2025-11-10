-- Migration: Add landing_page_url to leads and archive/relaunch fields
-- Description: Track full URL of landing page + lifecycle timestamps

-- 1. Add landing_page_url to leads table
ALTER TABLE landing_page_leads 
ADD COLUMN IF NOT EXISTS landing_page_url TEXT;

-- 2. Add archived_at and relaunched_at to landing_pages table
ALTER TABLE landing_pages
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS relaunched_at TIMESTAMPTZ;

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS landing_page_leads_landing_page_url_idx 
ON landing_page_leads(landing_page_url);

CREATE INDEX IF NOT EXISTS landing_pages_status_idx 
ON landing_pages(status);

CREATE INDEX IF NOT EXISTS landing_pages_archived_at_idx 
ON landing_pages(archived_at) WHERE archived_at IS NOT NULL;

-- 4. Add comment for documentation
COMMENT ON COLUMN landing_page_leads.landing_page_url IS 
'Full URL where lead was captured (e.g., https://lp-consultorio-123.vercel.app)';

COMMENT ON COLUMN landing_pages.archived_at IS 
'Timestamp when landing page was archived (status changed to archived)';

COMMENT ON COLUMN landing_pages.relaunched_at IS 
'Timestamp when archived landing page was relaunched';


