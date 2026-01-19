# How to Integrate `tracker.js` into Your Shopify Theme

This guide explains how to integrate the `tracker.js` script into your Shopify theme to automatically track customer events. The new version of `tracker.js` is designed to work with most Shopify themes out of the box, with minimal configuration.

## Step 1: Upload `tracker.js` to Your Theme

1.  From your Shopify admin, go to **Online Store > Themes**.
2.  Find the theme you want to edit, and then click **Actions > Edit code**.
3.  In the left sidebar, open the **Assets** folder.
4.  Click **Add a new asset** and upload your `tracker.js` file.

## Step 2: Include the `tracker.js` Script in Your Theme

1.  In the theme editor, open the **Layout** folder.
2.  Click on the `theme.liquid` file to open it.
3.  Scroll to the bottom of the file and paste the following line of code right before the closing `</body>` tag:

    ```html
    {{ 'tracker.js' | asset_url | script_tag }}
    ```

4.  Click **Save**.

## Step 3: Configure Your Tracker Settings

1.  Go back to the **Assets** folder and click on `tracker.js` to open it in the editor.
2.  You must update the two configuration variables at the top of the file:

    ```javascript
    // The vendor will need to change this to their unique store code.
    const STORE_CODE = 'your-unique-store-code';
    // The URL of your backend server.
    const YOUR_SERVER_URL = 'https://pixeltracker24.onrender.com';
    ```

    *   **`STORE_CODE`**: Replace `'your-unique-store-code'` with the unique identifier for your store.
    *   **`YOUR_SERVER_URL`**: Replace `'https://pixeltracker24.onrender.com'` with the public URL of your backend server.

3.  Click **Save**.

## That's It!

The `tracker.js` script is now installed. It will automatically detect and track the following events without any additional code changes or theme modifications:

*   **ViewContent**: When a user views a product page.
*   **AddToCart**: When a user clicks an "Add to Cart" button.
*   **InitiateCheckout**: When a user clicks a checkout button.
*   **Purchase**: When a user completes a purchase on the order confirmation page.

You do not need to follow any complex steps to adapt the tracker for different pages.
