require('dotenv').config({ path: '.env.local' })

const username = 'ipierette'
const token = process.env.GITHUB_TOKEN

async function testEvent() {
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'CatBytes-Portfolio',
    'Authorization': `Bearer ${token}`
  }

  const eventsResponse = await fetch(
    `https://api.github.com/users/${username}/events/public?per_page=5`,
    { headers }
  )

  const events = await eventsResponse.json()
  
  console.log('📝 Primeiros 5 eventos:\n')
  events.forEach((event, index) => {
    console.log(`\n[${index + 1}] ${event.type} - ${event.repo.name}`)
    console.log(`    Created: ${event.created_at}`)
    
    if (event.type === 'PushEvent') {
      console.log(`    Payload:`, JSON.stringify(event.payload, null, 2))
    }
  })
}

testEvent()
