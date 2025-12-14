// tracker.js

// --- Configuration ---
// The vendor will need to change this to their unique store code.
const STORE_CODE = 'your-unique-store-code';
// The URL of your backend server.
const YOUR_SERVER_URL = 'http://localhost:3000';
// ---------------------

/**
 * Tracks an event by sending data to the backend server.
 * @param {object} eventData - The data for the event to track.
 * @param {string} eventData.eventName - The name of the event.
 * @param {string} eventData.productName - The name of the product.
 * @param {string} eventData.productImage - The URL of the product image.
 */
async function trackEvent(eventData) {
    const dataToSend = {
        ...eventData,
        storeCode: STORE_CODE,
        timestamp: new Date().toISOString()
    };

    try {
        await fetch(`${YOUR_SERVER_URL}/track-event`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSend),
        });
    } catch (error) {
        console.error('Error tracking event:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    /**
     * Listener for the 'ViewContent' event.
     * Fires when a user visits a product page.
     */
    if (window.location.pathname.includes('/products/')) {
        const productHandle = window.location.pathname.split('/products/')[1];
        if (productHandle) {
            fetch(`/products/${productHandle}.js`)
                .then(response => response.json())
                .then(product => {
                    trackEvent({
                        eventName: 'ViewContent',
                        productName: product.title,
                        productImage: (product.featured_image || (product.images && product.images[0])) || 'N/A',
                    });
                }).catch(err => console.error('Error fetching product data for ViewContent:', err));
        }
    }

    /**
     * Listener for the 'AddToCart' event.
     * Hooks into the 'click' event of Add to Cart buttons.
     */
    const addToCartButtons = document.querySelectorAll('form[action*="/cart/add"] button[type="submit"], .add-to-cart-button');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const productHandle = window.location.pathname.split('/products/')[1];
            if (productHandle) {
                 fetch(`/products/${productHandle}.js`)
                    .then(response => response.json())
                    .then(product => {
                        trackEvent({
                            eventName: 'AddToCart',
                            productName: product.title,
                            productImage: (product.featured_image || (product.images && product.images[0])) || 'N/A',
                        });
                    }).catch(err => console.error('Error fetching product data for AddToCart:', err));
            }
        });
    });

    /**
     * Listener for the 'InitiateCheckout' event.
     * Fires when a user clicks a checkout button.
     */
    const checkoutButtons = document.querySelectorAll('[name="checkout"], .checkout-button, [href*="/checkout"]');
    checkoutButtons.forEach(button => {
        button.addEventListener('click', () => {
            fetch('/cart.js')
                .then(response => response.json())
                .then(cart => {
                    if (cart.items && cart.items.length > 0) {
                        const firstItem = cart.items[0];
                        trackEvent({
                            eventName: 'InitiateCheckout',
                            productName: firstItem.product_title,
                            productImage: firstItem.image || 'N/A',
                        });
                    } else {
                        trackEvent({
                            eventName: 'InitiateCheckout',
                            productName: 'N/A',
                            productImage: 'N/A',
                        });
                    }
                }).catch(err => {
                    console.error('Error fetching cart data for InitiateCheckout:', err);
                    trackEvent({
                        eventName: 'InitiateCheckout',
                        productName: 'N/A',
                        productImage: 'N/A',
                    });
                });
        });
    });

    /**
     * Listener for the 'Purchase' event.
     * Fires on the 'Thank You' or order confirmation page.
     */
    if ((window.location.pathname.includes('/checkouts/') || window.location.pathname.includes('/orders/')) && typeof Shopify !== 'undefined' && Shopify.checkout) {
        const order = Shopify.checkout;
        order.line_items.forEach(item => {
            trackEvent({
                eventName: 'Purchase',
                productName: item.title,
                // Image is not available in the Shopify.checkout object on the thank you page.
                // To get the image, an additional API call would be needed, but the product handle is not available here.
                productImage: 'N/A',
            });
        });
    }
});
