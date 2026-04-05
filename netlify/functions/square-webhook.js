exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' }
    }

    const body = JSON.parse(event.body || '{}')
    
    // Debug complet
    console.log('Payload Square:', JSON.stringify(body, null, 2))

    const eventType = body.type
    const paymentData = body.data?.object || {}
    
    console.log('Analyse:', {
      type: eventType,
      paymentId: paymentData.id,
      status: paymentData.status,
      merchantId: paymentData.merchant_id
    })

    // Vérifie paiement COMPLETED
    if (eventType === 'payment.updated' && paymentData.status === 'COMPLETED') {
      const ticketId = `SOUTH-${Date.now().toString().slice(-6)}`
      const qrData = `SOUTHEVENTS:${ticketId}:${paymentData.id}`
      
      // QR Code gratuit
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`
      
      console.log('✅ BILLET CRÉÉ:', {
        ticketId,
        qrUrl,
        paymentId: paymentData.id,
        amount: paymentData.amount_money?.amount / 100 + '€'
      })

      // TODO: Appel billet.southevents.ca
      // await fetch('https://billet.southevents.ca/api/ticket', {
      //   method: 'POST',
      //   body: JSON.stringify({ ticketId, qrData, paymentData })
      // })

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          ticketId,
          qrUrl,
          message: `Billet ${ticketId} créé !`
        })
      }
    }

    return { statusCode: 200, body: 'OK' }
  } catch (error) {
    console.error('❌ ERREUR:', error.message)
    return { statusCode: 200 } // Square retente si 500
  }
}