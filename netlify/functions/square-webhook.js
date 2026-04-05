const { Client, Environment } = require('square')

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const body = JSON.parse(event.body)
  if (body.type !== 'PAYMENT.UPDATED') {
    return { statusCode: 200, body: 'OK' }
  }

  const payment = body.data.object
  if (payment.status !== 'COMPLETED') {
    return { statusCode: 200, body: 'OK' }
  }

  try {
    const client = new Client({
      accessToken: process.env.SQUARE_ACCESS_TOKEN,
      environment: Environment.Sandbox
    })

    const paymentDetails = await client.paymentsApi.retrievePayment(payment.id)
    
    const ticketId = `SOUTH-${Date.now()}`
    const qrData = `SOUTHEVENTS:${ticketId}:${payment.id}`
    
    // Génère QR code SVG
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`
    
    // Log pour debug (visible dans Netlify Logs)
    console.log('Billet créé:', { ticketId, paymentId: payment.id, amount: payment.amount_money.amount })
    
    return { 
      statusCode: 200, 
      body: JSON.stringify({ 
        success: true, 
        ticketId, 
        qrUrl,
        paymentId: payment.id 
      })
    }
  } catch (error) {
    console.error('Webhook error:', error)
    return { statusCode: 500, body: 'Error: ' + error.message }
  }
}