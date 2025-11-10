const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔧 Testing Supabase connection...')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseKey ? '✅ Present' : '❌ Missing')

const supabase = createClient(supabaseUrl, supabaseKey)

async function testQueries() {
  // Test 1: Check if tables exist
  console.log('\n📊 Test 1: Checking tables...')
  
  const { data: pageViews, error: pvError } = await supabase
    .from('analytics_page_views')
    .select('*')
    .limit(5)
  
  console.log('Page Views:', {
    count: pageViews?.length || 0,
    error: pvError?.message || null,
    sample: pageViews?.[0] || null
  })
  
  const { data: blogViews, error: bvError } = await supabase
    .from('analytics_blog_views')
    .select('*')
    .limit(5)
  
  console.log('Blog Views:', {
    count: blogViews?.length || 0,
    error: bvError?.message || null
  })
  
  // Test 2: Count total records
  console.log('\n📈 Test 2: Counting records...')
  
  const { count: totalPageViews } = await supabase
    .from('analytics_page_views')
    .select('*', { count: 'exact', head: true })
  
  const { count: totalBlogViews } = await supabase
    .from('analytics_blog_views')
    .select('*', { count: 'exact', head: true })
  
  console.log('Total Page Views:', totalPageViews)
  console.log('Total Blog Views:', totalBlogViews)
  
  // Test 3: Last 24 hours
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  
  const { count: last24h } = await supabase
    .from('analytics_page_views')
    .select('*', { count: 'exact', head: true })
    .gte('timestamp', oneDayAgo)
  
  console.log('Last 24h Page Views:', last24h)
}

testQueries().catch(console.error)
