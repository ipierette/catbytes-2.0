-- Tabela de Landing Pages geradas
CREATE TABLE IF NOT EXISTS landing_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  niche VARCHAR(100) NOT NULL,
  problem TEXT NOT NULL,
  solution TEXT NOT NULL,
  cta_text VARCHAR(100) NOT NULL,
  theme_color VARCHAR(50) NOT NULL,
  
  -- Conteúdo gerado pela IA
  headline TEXT,
  subheadline TEXT,
  benefits JSONB, -- Array de benefícios
  hero_image_url TEXT,
  html_content TEXT,
  
  -- Deploy info
  deploy_url TEXT,
  deploy_status VARCHAR(50) DEFAULT 'pending', -- pending, deploying, published, failed
  github_repo_url TEXT,
  vercel_project_id TEXT,
  
  -- Analytics
  views_count INTEGER DEFAULT 0,
  leads_count INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Status
  status VARCHAR(50) DEFAULT 'draft', -- draft, published, archived
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  
  -- Índices para busca rápida
  CONSTRAINT landing_pages_status_check CHECK (status IN ('draft', 'published', 'archived')),
  CONSTRAINT landing_pages_deploy_status_check CHECK (deploy_status IN ('pending', 'deploying', 'published', 'failed'))
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS landing_pages_status_idx ON landing_pages(status);
CREATE INDEX IF NOT EXISTS landing_pages_slug_idx ON landing_pages(slug);
CREATE INDEX IF NOT EXISTS landing_pages_created_at_idx ON landing_pages(created_at DESC);

-- Tabela de Leads capturados
CREATE TABLE IF NOT EXISTS landing_page_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  landing_page_id UUID REFERENCES landing_pages(id) ON DELETE CASCADE,
  
  -- Dados do lead
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  company VARCHAR(255),
  message TEXT,
  
  -- Tracking
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  utm_term VARCHAR(100),
  utm_content VARCHAR(100),
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  device_type VARCHAR(50), -- mobile, desktop, tablet
  browser VARCHAR(100),
  country VARCHAR(100),
  city VARCHAR(100),
  
  -- Status de follow-up
  status VARCHAR(50) DEFAULT 'new', -- new, contacted, qualified, converted, lost
  sales_notes TEXT,
  contacted_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT landing_page_leads_status_check CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost'))
);

-- Índices para analytics
CREATE INDEX IF NOT EXISTS landing_page_leads_landing_page_id_idx ON landing_page_leads(landing_page_id);
CREATE INDEX IF NOT EXISTS landing_page_leads_status_idx ON landing_page_leads(status);
CREATE INDEX IF NOT EXISTS landing_page_leads_created_at_idx ON landing_page_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS landing_page_leads_email_idx ON landing_page_leads(email);

-- Tabela de Analytics (pageviews)
CREATE TABLE IF NOT EXISTS landing_page_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  landing_page_id UUID REFERENCES landing_pages(id) ON DELETE CASCADE,
  
  -- Tracking info
  referrer TEXT,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  user_agent TEXT,
  ip_address INET,
  device_type VARCHAR(50),
  browser VARCHAR(100),
  country VARCHAR(100),
  city VARCHAR(100),
  
  -- Timestamps
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS landing_page_views_landing_page_id_idx ON landing_page_views(landing_page_id);
CREATE INDEX IF NOT EXISTS landing_page_views_viewed_at_idx ON landing_page_views(viewed_at DESC);

-- Function para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_landing_pages_updated_at BEFORE UPDATE ON landing_pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_landing_page_leads_updated_at BEFORE UPDATE ON landing_page_leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function para atualizar conversion_rate automaticamente
CREATE OR REPLACE FUNCTION update_landing_page_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE landing_pages
    SET 
        leads_count = (SELECT COUNT(*) FROM landing_page_leads WHERE landing_page_id = NEW.landing_page_id),
        conversion_rate = CASE 
            WHEN views_count > 0 THEN 
                (SELECT COUNT(*) FROM landing_page_leads WHERE landing_page_id = NEW.landing_page_id)::DECIMAL / views_count * 100
            ELSE 0
        END
    WHERE id = NEW.landing_page_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_stats_on_new_lead AFTER INSERT ON landing_page_leads
    FOR EACH ROW EXECUTE FUNCTION update_landing_page_stats();

-- Comentários para documentação
COMMENT ON TABLE landing_pages IS 'Landing pages geradas automaticamente pela IA para captura de leads';
COMMENT ON TABLE landing_page_leads IS 'Leads capturados através das landing pages';
COMMENT ON TABLE landing_page_views IS 'Pageviews para analytics das landing pages';
