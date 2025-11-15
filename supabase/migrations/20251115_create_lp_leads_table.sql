-- Cria tabela para armazenar leads das Landing Pages
CREATE TABLE IF NOT EXISTS lp_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  message TEXT,
  source VARCHAR(100) DEFAULT 'lp_rica',
  landing_page_slug VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'new' -- new, contacted, converted, lost
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_lp_leads_email ON lp_leads(email);
CREATE INDEX IF NOT EXISTS idx_lp_leads_created_at ON lp_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lp_leads_status ON lp_leads(status);
CREATE INDEX IF NOT EXISTS idx_lp_leads_source ON lp_leads(source);

-- Comentários
COMMENT ON TABLE lp_leads IS 'Leads capturados pelas Landing Pages';
COMMENT ON COLUMN lp_leads.source IS 'Origem do lead: lp_rica, lp_simples, etc.';
COMMENT ON COLUMN lp_leads.status IS 'Status do lead: new, contacted, converted, lost';
