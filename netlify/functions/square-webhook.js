exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') return { statusCode: 405 }

    const body = JSON.parse(event.body || '{}')
    
    // Structure CORRECTE Square
    const payment = body.data?.object?.payment || {}
    
    console.log('Payment details:', {
      id: payment.id,
      status: payment.status,
      amount: payment.amount_money?.amount / 100,
      currency: payment.amount_money?.currency
    })

    if (payment.status === 'COMPLETED') {
      const ticketId = `SOUTH-${Date.now().toString().slice(-6)}`
      const qrData = `SOUTHEVENTS:${ticketId}:${payment.id}`
      
      // QR Code direct
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`
      
      console.log('✅ BILLET GÉNÉRÉ:', {
        ticketId,
        qrUrl,
        paymentId: payment.id,
        amount: `${payment.amount_money?.amount / 100} ${payment.amount_money?.currency}`
      })

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true, ticketId, qrUrl })
      }
    }

    return { statusCode: 200, body: 'OK' }
  } catch (error) {
    console.error('Erreur:', error.message)
    return { statusCode: 200 }
  }
}