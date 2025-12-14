document.addEventListener('DOMContentLoaded', () => {
  // --- Configuration ---
  // The URL of your app's server.
  // IMPORTANT: Replace with your actual server URL in a production environment.
  const APP_URL = 'https://shopifyadminpanel.onrender.com'; // e.g., https://my-shopify-app.onrender.com

  // --- Helper Function ---
  /**
   * Sends event data to your backend.
   * @param {object} eventData - The data to send.
   */
  async function trackEvent(eventData) {
    try {
      await fetch(`${APP_URL}/track-fb-event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  // --- Facebook Pixel Event Listeners ---

  /**
   * Listener for the 'ViewContent' event.
   * This event typically fires when a user visits a product page.
   */
  if (window.location.pathname.includes('/products/')) {
    setTimeout(() => {
        const productHandle = window.location.pathname.split('/products/')[1];
        if(productHandle) {
            fetch(`/products/${productHandle}.js`)
            .then(response => response.json())
            .then(product => {
                trackEvent({
                    eventName: 'ViewContent',
                    productId: product.id,
                    productName: product.title,
                    timestamp: new Date().toISOString()
                });
            });
        }
    }, 500);
  }


  /**
   * Listener for the 'AddToCart' event.
   * This needs to be hooked into the 'click' event of the Add to Cart button.
   */
  // Find all 'Add to Cart' buttons on the page.
  // The selector might need to be adjusted based on your theme's structure.
  const addToCartButtons = document.querySelectorAll('form[action*="/cart/add"] button[type="submit"], .add-to-cart-button');

  addToCartButtons.forEach(button => {
    button.addEventListener('click', async () => {
      // Find the product form
      const form = button.closest('form[action*="/cart/add"]');
      if (!form) return;

      // Extract the selected variant ID
      const variantIdInput = form.querySelector('[name="id"]');
      if (!variantIdInput) return;
      
      const variantId = variantIdInput.value;
      
      // Get product data using the product handle from the URL
      const productHandle = window.location.pathname.split('/products/')[1];
        if(productHandle) {
            fetch(`/products/${productHandle}.js`)
            .then(response => response.json())
            .then(product => {
                const variant = product.variants.find(v => v.id == variantId);
                if(variant) {
                     trackEvent({
                        eventName: 'AddToCart',
                        productId: product.id,
                        productName: product.title,
                        variantId: variant.id,
                        variantName: variant.title,
                        timestamp: new Date().toISOString()
                    });
                }
            });
        }
    });
  });

  /**
   * Listener for the 'InitiateCheckout' event.
   * This fires when a user clicks the checkout button.
   */
  const checkoutButtons = document.querySelectorAll('[name="checkout"], .checkout-button, [href*="/checkout"]');
  checkoutButtons.forEach(button => {
    button.addEventListener('click', () => {
      fetch('/cart.js')
        .then(response => response.json())
        .then(cart => {
          trackEvent({
            eventName: 'InitiateCheckout',
            cart: cart,
            timestamp: new Date().toISOString()
          });
        });
    });
  });


  /**
   * Listener for the 'Purchase' event.
   * This fires on the 'Thank You' or order confirmation page.
   */
  if (window.location.pathname.includes('/checkouts/') || window.location.pathname.includes('/orders/')) {
    if (typeof Shopify !== 'undefined' && Shopify.checkout) {
      const order = Shopify.checkout;
      order.line_items.forEach(item => {
        trackEvent({
            eventName: 'Purchase',
            orderId: order.order_id,
            productId: item.product_id,
            productName: item.title,
            variantId: item.variant_id,
            variantName: item.variant_title,
            quantity: item.quantity,
            price: item.price,
            timestamp: new Date().toISOString()
        });
      });
    }
  }
});
