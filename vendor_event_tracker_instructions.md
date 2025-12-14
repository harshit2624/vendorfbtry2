# How to Build a Multi-Vendor Event Tracker

This guide provides a step-by-step process for creating a generalized, multi-vendor event tracking application from scratch. The system will consist of a central server to collect data, a dashboard for vendors to view their analytics, and a client-side script for vendors to install on their websites.

---

### **Core Architecture**

The application has three main parts:
1.  **The Backend Server:** A Node.js application that listens for incoming events, validates them, and stores them in a database. It also serves event data to the vendor dashboard.
2.  **The Vendor Dashboard:** A simple web application where a vendor can "log in" using their unique store code to see their own event analytics, with filters for time and event type.
3.  **The Tracking Script:** A JavaScript snippet that vendors add to their website. It tracks user actions and sends this data to the backend server.

---

### **Part 1: The Backend Server (Node.js & Express)**

The server is the heart of the application, responsible for ingesting and serving all event data.

#### **Step 1: Project Setup**

1.  Create a new project directory and initialize a Node.js project.
    ```bash
    mkdir vendor-event-tracker-backend
    cd vendor-event-tracker-backend
    npm init -y
    ```
2.  Install the necessary packages:
    *   `express`: A web framework for creating the server and API endpoints.
    *   `mongodb`: The official driver to connect to the MongoDB database.
    *   `cors`: A middleware to enable Cross-Origin Resource Sharing, which is essential for receiving requests from different vendor websites.
    ```bash
    npm install express mongodb cors
    ```

#### **Step 2: Database Schema (MongoDB)**

You'll need a database to store the events. We will use MongoDB.

*   **Connection String:** `mongodb+srv://croscrowteam_db_user:mHQIEs8CZ07KHa9H@cluster0.bgucwmf.mongodb.net/`
*   **Collection Name:** `events`
*   **Document Schema:** Each document in the collection will represent a single event. It's crucial to include a `storeCode` to distinguish which vendor the event belongs to.

    ```json
    {
      "storeCode": "my-cool-store", // Unique identifier for the vendor
      "eventName": "ViewContent",       // ViewContent, AddToCart, InitiateCheckout, Purchase
      "productName": "Stylish T-Shirt",
      "productImage": "https://example.com/image.jpg",
      "timestamp": "2025-12-12T10:00:00.000Z" // ISO 8601 timestamp string
    }
    ```

#### **Step 3: Building the API Endpoints**

Create a file named `server.js` and set up your Express server.

1.  **`POST /track-event` (Data Ingestion)**
    *   This endpoint will receive event data from the vendors' tracking scripts.
    *   It should validate that required fields like `storeCode` and `eventName` are present.
    *   It then inserts the validated event data into the `events` collection in your database.

2.  **`GET /data` (Data Serving)**
    *   This endpoint will serve all necessary data to the vendor's dashboard. It must be secured by `storeCode`.
    *   The request from the frontend will look like: `GET /data?storeCode=my-cool-store&period=last7days`.
    *   Your server will read the `storeCode` and other filter parameters from the URL query.
    *   It then uses these parameters to fetch the correct data from the database, ensuring you only ever return data belonging to the requesting vendor.

---

### **Part 2: The Vendor Dashboard (Frontend)**

This is the website where vendors view their analytics. It can be built with simple HTML, CSS, and JavaScript.

#### **Step 1: The Login Page**

*   Create an `index.html` file.
*   This page should have a single text input field for the `storeCode` (acting as a password) and a "View Dashboard" button.
*   When the button is clicked, use JavaScript to save the `storeCode` to the browser's `localStorage` and redirect the user to `dashboard.html`.

    ```javascript
    // Example login.js
    const storeCode = document.getElementById('store-code-input').value;
    if (storeCode) {
        localStorage.setItem('storeCode', storeCode);
        window.location.href = '/dashboard.html';
    }
    ```

#### **Step 2: The Dashboard Page**

*   Create a `dashboard.html` file.
*   On this page, use JavaScript to:
    1.  Retrieve the `storeCode` from `localStorage`. If it's not there, redirect back to the login page.
    2.  Use the `fetch` API to make a request to your backend's `GET /data` endpoint, passing the `storeCode` and any filter values in the URL.
        ```javascript
        // Example dashboard.js
        const storeCode = localStorage.getItem('storeCode');
        const period = document.getElementById('period-filter').value;

        fetch(`https://your-backend.com/data?storeCode=${storeCode}&period=${period}`)
            .then(response => response.json())
            .then(data => {
                // Use the data to render stats and the event table
            });
        ```
    3.  Implement filter controls (e.g., time period, event type). When filters are applied, re-fetch the data with the new parameters.
    4.  Render the data from the server into a table showing all events for the vendor.

---

### **Part 3: The Vendor's Tracking Script**

This is the copy-pasteable script you will provide to your vendors.

#### **Step 1: The Script Logic**

Create a JavaScript file (`tracker.js`) that vendors will include on their site.

*   **Configuration:** The script must be easy for a vendor to configure with their unique `storeCode` and the URL of your backend server.

    ```javascript
    // tracker.js
    const YOUR_SERVER_URL = 'https://your-backend.com';
    const STORE_CODE = 'your-unique-store-code'; // The vendor will change this
    ```

*   **`trackEvent` Function:** This core function gathers all the product data and sends it to your server.

    ```javascript
    async function trackEvent(eventData) {
        const dataToSend = { ...eventData, storeCode: STORE_CODE };

        try {
            await fetch(`${YOUR_SERVER_URL}/track-event`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend)
            });
        } catch (error) {
            console.error('Event tracking error:', error);
        }
    }
    ```

*   **Event Listeners:** Attach listeners to track events. Provide clear examples for the specified events: `ViewContent`, `AddToCart`, `InitiateCheckout`, and `Purchase`.

    ```javascript
    // Example: Track an "AddToCart" event
    const addToCartButton = document.querySelector('.add-to-cart-button');
    if (addToCartButton) {
        addToCartButton.addEventListener('click', () => {
            const productDetails = {
                productName: "Example Product",
                productImage: "https://example.com/product.jpg"
            };

            trackEvent({
                eventName: 'AddToCart',
                ...productDetails,
                timestamp: new Date().toISOString()
            });
        });
    }
    ```

#### **Step 2: Installation Instructions for Vendors**

Provide clear instructions for your vendors:
1.  "Copy the `tracker.js` script and add it to your website."
2.  "In `tracker.js`, change the `STORE_CODE` variable to your unique store code: `const STORE_CODE = 'your-store-code';`"
3.  "Place the following script tag at the bottom of your website's HTML, just before the closing `</body>` tag:"
    ```html
    <script src="/path/to/your/tracker.js"></script>
    ```

---
### **Next Steps & Security**

*   **Deployment:** You can host the backend server and frontend dashboard on platforms like Render, Heroku, or Vercel.
*   **Security:** The login method described here is basic. For a production application, you would want a proper authentication system to better protect vendor data.
*   **Error Handling:** Add robust error handling on both the client and server to handle cases where tracking fails or data is invalid.
