const fs = require('fs').promises
const path = require('path')

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  const { ticketId } = event.queryStringParameters || {}

  if (!ticketId || !ticketId.startsWith('SOUTH-')) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ valid: false, reason: 'Format invalide' })
    }
  }

  const dataPath = path.join(__dirname, 'data/tickets.json')
  let tickets = { used: [], total: 0 }

  try {
    tickets = JSON.parse(await fs.readFile(dataPath, 'utf8'))
  } catch {}

  if (tickets.used.includes(ticketId)) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ valid: false, reason: 'Déjà scanné !' })
    }
  }

  tickets.used.push(ticketId)
  tickets.total = tickets.used.length

  try {
    await fs.mkdir(path.dirname(dataPath), { recursive: true })
    await fs.writeFile(dataPath, JSON.stringify(tickets, null, 2))
  } catch (e) {
    console.error('Write error:', e.message)
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      valid: true,
      ticketId,
      total: tickets.total,
      message: 'Billet valide !'
    })
  }
}
