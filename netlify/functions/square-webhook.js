exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405 }
    }

    const body = JSON.parse(event.body || '{}')
    
    // Log tout pour debug
    console.log('Webhook reçu:', {
      type: body.type,
      paymentId: body?.data?.object?.id,
      status: body?.data?.object?.status,
      timestamp: new Date().toISOString()
    })

    // Répond IMMÉDIATEMENT à Square
    return { 
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ received: true })
    }
  } catch (error) {
    console.error('Webhook error:', error)
    return { statusCode: 200 } // Même en erreur, répond 200
  }
}