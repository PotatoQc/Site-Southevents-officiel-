const PRICE_PER_SHIRT = 50
const INTERAC_EMAIL = 'sevirements@southevents.ca'
const ORDER_NOTIFICATION_ENDPOINT = 'https://discord.com/api/webhooks/1514018361917309029/0a26KLuz5BzkGINgLGYKkdAzKfYUSdL_-MRIzbVj-S0NOPBo7OI9loK6eiNTYjLzkSd2'

const designs = {
  'design-1': {
    label: 'Design 01',
    image: 'design1.png',
  },
  'design-2': {
    label: 'Design 02',
    image: 'design2.png',
  },
  'design-3': {
    label: 'Design 03',
    image: 'design3.png',
  },
}

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

const form = document.getElementById('merchOrderForm')
const fullNameInput = document.getElementById('fullNameInput')
const quantityInput = document.getElementById('quantityInput')
const sizeGrid = document.getElementById('sizeGrid')
const deliverySelect = document.getElementById('deliverySelect')
const deliveryHelp = document.getElementById('deliveryHelp')
const addressGroup = document.getElementById('addressGroup')
const addressInput = document.getElementById('addressInput')
const contactInput = document.getElementById('contactInput')
const noteInput = document.getElementById('noteInput')
const confirmation = document.getElementById('orderConfirmation')
const orderPopup = document.getElementById('orderPopup')
const orderPopupClose = document.getElementById('orderPopupClose')
const popupOrderNumber = document.getElementById('popupOrderNumber')
const designImage = document.getElementById('orderDesignImage')
const designFallback = document.getElementById('orderDesignFallback')
const designFilename = document.getElementById('orderDesignFilename')
const summaryDesign = document.getElementById('summaryDesign')
const summaryQuantity = document.getElementById('summaryQuantity')
const summaryTotal = document.getElementById('summaryTotal')
const formTotal = document.getElementById('formTotal')
const submitButton = form.querySelector('button[type="submit"]')

const params = new URLSearchParams(window.location.search)
const designFromUrl = params.get('design')
const defaultDesignKey = designs[designFromUrl] ? designFromUrl : 'design-1'

function money(amount) {
  return `${amount}$`
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  })[char])
}

function normalizedQuantity() {
  const value = Number.parseInt(quantityInput.value, 10)
  if (Number.isNaN(value) || value < 1) return 1
  return Math.min(value, 20)
}

function generateOrderNumber() {
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replace(/-/g, '')
  const time = now.toTimeString().slice(0, 8).replace(/:/g, '')
  const random = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `SE-${date}-${time}-${random}`
}

function designOptions(selectedKey) {
  return Object.entries(designs).map(([key, design]) => (
    `<option value="${key}"${key === selectedKey ? ' selected' : ''}>${design.label}</option>`
  )).join('')
}

function sizeOptions(selectedSize) {
  return sizes.map(size => (
    `<option value="${size}"${size === selectedSize ? ' selected' : ''}>${size}</option>`
  )).join('')
}

function currentItems() {
  const rows = Array.from(sizeGrid.querySelectorAll('.size-item'))

  return rows.map((row, index) => {
    const designKey = row.querySelector('.shirt-design-select')?.value || defaultDesignKey
    const size = row.querySelector('.shirt-size-select')?.value || 'M'
    const design = designs[designKey] || designs[defaultDesignKey]

    return {
      number: index + 1,
      designKey,
      design: design.label,
      designImage: design.image,
      size,
    }
  })
}

function designSummary(items) {
  const counts = items.reduce((acc, item) => {
    acc[item.design] = (acc[item.design] || 0) + 1
    return acc
  }, {})

  return Object.entries(counts)
    .map(([design, count]) => `${count}x ${design}`)
    .join(', ')
}

function renderItemFields() {
  const quantity = normalizedQuantity()
  const previousItems = currentItems()

  sizeGrid.innerHTML = Array.from({ length: quantity }, (_, index) => {
    const previous = previousItems[index] || { designKey: defaultDesignKey, size: 'M' }

    return `
      <div class="size-item order-item-row">
        <div class="order-item-title">Chandail ${index + 1}</div>
        <label for="shirtDesign${index + 1}">Design</label>
        <select class="shirt-design-select" id="shirtDesign${index + 1}" name="shirtDesign${index + 1}" required>
          ${designOptions(previous.designKey)}
        </select>
        <label for="shirtSize${index + 1}">Grandeur</label>
        <select class="shirt-size-select" id="shirtSize${index + 1}" name="shirtSize${index + 1}" required>
          ${sizeOptions(previous.size)}
        </select>
      </div>`
  }).join('')
}

function updateSummary() {
  const quantity = normalizedQuantity()
  const items = currentItems()
  const total = quantity * PRICE_PER_SHIRT
  const previewItem = items[0] || { designKey: defaultDesignKey, design: designs[defaultDesignKey].label, designImage: designs[defaultDesignKey].image }

  quantityInput.value = quantity
  summaryDesign.textContent = designSummary(items) || designs[defaultDesignKey].label
  summaryQuantity.textContent = quantity
  summaryTotal.textContent = money(total)
  formTotal.textContent = money(total)
  designFallback.textContent = previewItem.design
  designFilename.textContent = previewItem.designImage
  designImage.src = previewItem.designImage
  designImage.alt = previewItem.design
}

function syncOrder() {
  renderItemFields()
  updateSummary()
}

function syncDeliveryFields() {
  const isDelivery = deliverySelect.value === 'delivery'
  addressGroup.hidden = !isDelivery
  addressInput.required = isDelivery
  deliveryHelp.textContent = isDelivery
    ? 'Indique ton adresse complète pour qu’on puisse organiser la livraison.'
    : "On va te contacter pour te donner l'adresse de ramassage."
}

function openOrderPopup(orderNumber) {
  popupOrderNumber.textContent = orderNumber
  orderPopup.hidden = false
  orderPopupClose.focus()
}

function closeOrderPopup() {
  orderPopup.hidden = true
}

async function sendOrderNotification(order) {
  const deliveryText = order.deliveryMethod === 'delivery'
    ? `Livraison - ${order.address}`
    : "Ramassage - contacter la personne pour l'adresse"
  const itemText = order.items
    .map(item => `#${item.number}: ${item.design} - ${item.size}`)
    .join('\n')

  const discordPayload = {
    content: `<@480164876107513867> Nouvelle commande merch Southevents - ${order.orderNumber}`,
    embeds: [{
      title: order.designSummary,
      color: 0xf5f2ec,
      fields: [
        { name: 'Numero de commande', value: order.orderNumber, inline: false },
        { name: 'Nom complet', value: order.fullName, inline: false },
        { name: 'Quantite', value: String(order.quantity), inline: true },
        { name: 'Total', value: money(order.total), inline: true },
        { name: 'Chandails', value: itemText, inline: false },
        { name: 'Livraison / ramassage', value: deliveryText, inline: false },
        { name: 'Contact', value: order.contact || 'Non precise', inline: false },
        { name: 'Virement Interac', value: `${INTERAC_EMAIL} - requis pour traiter la commande`, inline: false },
        { name: 'Note', value: order.note || 'Aucune note', inline: false },
      ],
      timestamp: order.createdAt,
    }],
  }

  const response = await fetch(ORDER_NOTIFICATION_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(discordPayload),
  })

  if (!response.ok) {
    throw new Error('Order notification failed')
  }
}

designImage.addEventListener('error', () => {
  designImage.style.display = 'none'
})

designImage.addEventListener('load', () => {
  designImage.style.display = 'block'
})

quantityInput.addEventListener('input', syncOrder)
sizeGrid.addEventListener('change', event => {
  if (event.target.matches('select')) updateSummary()
})
deliverySelect.addEventListener('change', syncDeliveryFields)
orderPopupClose.addEventListener('click', closeOrderPopup)
orderPopup.addEventListener('click', event => {
  if (event.target === orderPopup) closeOrderPopup()
})

form.addEventListener('submit', async event => {
  event.preventDefault()

  const quantity = normalizedQuantity()
  const items = currentItems()
  const itemLines = items.map(item => `Chandail ${item.number}: ${item.design} - ${item.size}`)
  const total = quantity * PRICE_PER_SHIRT
  const orderNumber = generateOrderNumber()
  const fullNameValue = fullNameInput.value.trim()
  const contactValue = contactInput.value.trim()
  const noteValue = noteInput.value.trim()
  const addressValue = addressInput.value.trim()
  const deliveryMethod = deliverySelect.value
  const deliveryLabel = deliveryMethod === 'delivery' ? 'Livraison' : 'Ramassage'
  const fullName = escapeHtml(fullNameValue)
  const contact = escapeHtml(contactValue)
  const note = escapeHtml(noteValue)
  const address = escapeHtml(addressValue)
  const orderDesignSummary = designSummary(items)
  const order = {
    orderNumber,
    fullName: fullNameValue,
    designSummary: orderDesignSummary,
    quantity,
    items,
    deliveryMethod,
    address: addressValue,
    contact: contactValue,
    note: noteValue,
    interacEmail: INTERAC_EMAIL,
    pricePerShirt: PRICE_PER_SHIRT,
    total,
    createdAt: new Date().toISOString(),
  }

  confirmation.classList.add('show')
  confirmation.classList.remove('error')
  confirmation.innerHTML = '<strong>Envoi de la commande...</strong>'
  submitButton.disabled = true

  try {
    await sendOrderNotification(order)

    confirmation.innerHTML = `
      <strong>Commande envoyée.</strong><br>
      Numéro: ${orderNumber}<br>
      ${orderDesignSummary} - ${quantity} chandail${quantity > 1 ? 's' : ''} - ${money(total)}<br>
      ${itemLines.map(escapeHtml).join('<br>')}<br>
      Nom: ${fullName}<br>
      Contact: ${contact}<br>
      Mode: ${deliveryLabel}${address ? `<br>Adresse: ${address}` : ''}
      ${note ? `<br>Note: ${note}` : ''}
    `
    openOrderPopup(orderNumber)
    form.reset()
    quantityInput.value = 1
    syncOrder()
    syncDeliveryFields()
  } catch (error) {
    confirmation.classList.add('error')
    confirmation.innerHTML = `
      <strong>La commande n'a pas pu être envoyée pour le moment.</strong><br>
      Vérifie ta connexion ou réessaie dans quelques instants. Aucun numéro de commande n'a été confirmé.
    `
  } finally {
    submitButton.disabled = false
  }
})

syncOrder()
syncDeliveryFields()
