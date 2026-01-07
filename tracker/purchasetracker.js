// Subscribe to checkout completed event
analytics.subscribe("checkout_completed", (event) => {
  const checkout = event.data.checkout;
  
  const payload = {
    storeCode: 'cccc',
    brandName: 'CROSCROW',
    timestamp: new Date().toISOString(),
    eventName: 'Purchase',
    source: 'customer_events',
    orderId: checkout.order.id,
    orderNumber: checkout.order.id, // Customer events doesn't expose order_number
    value: parseFloat(checkout.totalPrice.amount),
    currency: checkout.currencyCode,
    contents: checkout.lineItems.map(item => ({
      id: item.variant.product.id.split('/').pop(),
      variantId: item.variant.id.split('/').pop(),
      quantity: item.quantity,
      productName: item.title,
      variantName: item.variant.title,
      productImage: item.variant.image?.src || 'N/A',
      price: parseFloat(item.variant.price.amount),
      linePrice: parseFloat(item.finalLinePrice.amount)
    }))
  };

  fetch('https://pixeltracker-32pl.onrender.com/track-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true
  }).catch(() => {});
});
