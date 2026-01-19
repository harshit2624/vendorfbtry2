// ==============================
// PIXEL TRACKER – SHOPIFY SAFE (FIXED)
// ==============================

// -------- CONFIG --------
const STORE_CODE = 'cccc';
const BRAND_NAME = 'CROSCROW';
const YOUR_SERVER_URL = 'https://pixeltracker24.onrender.com';
// ------------------------

const firedEvents = {};

function trackEvent(eventData) {
  const source = eventData.source || 'dom';
  const key = `${eventData.eventName}_${source}`;
  if (firedEvents[key]) return;
  firedEvents[key] = true;

  const payload = JSON.stringify({
    storeCode: STORE_CODE,
    brandName: BRAND_NAME,
    timestamp: new Date().toISOString(),
    ...eventData
  });

  const url = `${YOUR_SERVER_URL}/track-event`;

  // ✅ MUST USE sendBeacon for checkout-related events
  if (eventData.eventName === 'InitiateCheckout') {
    navigator.sendBeacon(
      url,
      new Blob([payload], { type: 'application/json' })
    );
    return;
  }

  // normal events
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    keepalive: true
  }).catch(() => {});
}

/* ===============================
   VIEW CONTENT
================================ */
document.addEventListener('DOMContentLoaded', () => {
  if (!location.pathname.includes('/products/')) return;

  const handle = location.pathname.split('/products/')[1]?.split('?')[0];
  if (!handle) return;

  fetch(`/products/${handle}.js`)
    .then(r => r.json())
    .then(product => {
      trackEvent({
        eventName: 'ViewContent',
        source: 'dom',
        productName: product.title,
        productImage: product.featured_image || product.images?.[0] || 'N/A'
      });
    })
    .catch(() => {});
});

/* ===============================
   ADD TO CART
================================ */
document.addEventListener('click', e => {
  const btn = e.target.closest(
    'form[action*="/cart/add"] button[type="submit"], .add-to-cart-button'
  );
  if (!btn) return;

  const handle = location.pathname.split('/products/')[1]?.split('?')[0];
  if (!handle) return;

  fetch(`/products/${handle}.js`)
    .then(r => r.json())
    .then(product => {
      trackEvent({
        eventName: 'AddToCart',
        source: 'dom',
        productName: product.title,
        productImage: product.featured_image || product.images?.[0] || 'N/A'
      });
    })
    .catch(() => {});
});

/* ===============================
   INITIATE CHECKOUT (100% RELIABLE)
================================ */
(function initiateCheckoutTracker() {
  let fired = false;

  function fireInitiateCheckout() {
    if (fired) return;
    fired = true;

    fetch('/cart.js')
      .then(r => r.json())
      .then(cart => {
        trackEvent({
          eventName: 'InitiateCheckout',
          source: 'theme',
          value: cart.total_price / 100,
          currency: cart.currency,
          contents: cart.items.map(i => ({
            id: i.product_id,
            variantId: i.variant_id,
            quantity: i.quantity,
            productName: i.product_title,
            variantName: i.variant_title,
            productImage: i.featured_image?.url || i.image || 'N/A',
            price: i.price / 100,
            linePrice: i.line_price / 100
          }))
        });
      })
      .catch(() => {
        trackEvent({
          eventName: 'InitiateCheckout',
          source: 'theme'
        });
      });
  }

  // Normal checkout
  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn-checkout, [name="checkout"]');
    if (!btn || btn.hasAttribute('disabled')) return;
    fireInitiateCheckout();
  });

  // Dynamic checkout (Shop Pay / Apple Pay / GPay)
  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn-checkout-dynamic');
    if (!btn || btn.classList.contains('disabled')) return;
    fireInitiateCheckout();
  });

  // Redirect fallback
  let lastUrl = location.href;
  setInterval(() => {
    if (!fired && lastUrl !== location.href && location.href.includes('/checkout')) {
      fireInitiateCheckout();
    }
    lastUrl = location.href;
  }, 250);
})();
