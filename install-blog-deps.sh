#!/bin/bash

# =====================================================
# Install CatBytes Blog Dependencies
# =====================================================

echo "🐱 Installing CatBytes Blog dependencies..."

# Install Supabase client
npm install @supabase/supabase-js

# Install OpenAI SDK (if not already installed)
npm install openai

# Install markdown processor for rich content
npm install marked

# Install slugify for URL-friendly slugs
npm install slugify

# Install date-fns for date formatting
npm install date-fns

echo "✅ All dependencies installed successfully!"
echo ""
echo "Next steps:"
echo "1. Configure Supabase credentials in .env.local"
echo "2. Run the schema.sql in Supabase SQL Editor"
echo "3. Test the API routes"
echo ""
echo "📖 See SUPABASE_SETUP.md for detailed instructions"
