const { Client } = require('@square/sqip')
const QRCode = require('qrcode')
const nodemailer = require('nodemailer')

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405 }

  const body = JSON.parse(event.body)
  if (body.type !== 'PAYMENT.UPDATED') return { statusCode: 200 }

  const payment = body.data.object
  if (payment.status !== 'COMPLETED') return { statusCode: 200 }

  // Vérifier paiement via Square API
  const client = new Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN,
    environment: 'production'
  })

  try {
    const paymentDetails = await client.paymentsApi.retrievePayment(payment.id)
    const amount = paymentDetails.result.payment.amountMoney.amount / 100 // cents → €

    // Générer billet unique + QR
    const ticketId = `SOUTH-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
    const qrData = `SOUTHEVENTS:${ticketId}:${paymentDetails.result.payment.orderId}`
    const qrUrl = await QRCode.toDataURL(qrData)

    // Email au client
    const transporter = nodemailer.createTransport({
      service: 'gmail', // ou SendGrid
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    })

    await transporter.sendMail({
      to: paymentDetails.result.payment.buyerEmailAddress,
      subject: `Votre billet Southevents - ${ticketId}`,
      html: `
        <h1>Votre billet est confirmé !</h1>
        <p>ID: <strong>${ticketId}</strong></p>
        <img src="${qrUrl}" alt="QR Code billet" />
        <p>Présentez ce QR à l'entrée</p>
      `
    })

    return { statusCode: 200 }
  } catch (error) {
    console.error('Erreur webhook:', error)
    return { statusCode: 500 }
  }
}