document.addEventListener('DOMContentLoaded', () => {
    const storeCode = localStorage.getItem('storeCode');
    if (!storeCode) {
        window.location.href = 'index.html';
        return;
    }

    // The URL of your deployed backend server.
    const backendUrl = 'https://pixeltracker24.onrender.com';

    const eventsTableBody = document.getElementById('events-table-body');
    const topViewedContainer = document.getElementById('top-viewed-products');
    const topAddedToCartContainer = document.getElementById('top-added-to-cart-products');
    const topCheckoutContainer = document.getElementById('top-checkout-products');
    const topPurchasedContainer = document.getElementById('top-purchased-products');
    const statCardsContainer = document.getElementById('stat-cards');
    
    const eventFilter = document.getElementById('event-filter');
    const periodFilter = document.getElementById('period-filter');
    const filterButton = document.getElementById('filter-button');

    async function fetchAllData() {
        fetchEvents();
        fetchTopViewedProducts();
        fetchTopAddedToCartProducts();
        fetchTopCheckoutProducts();
        fetchTopPurchasedProducts();
        fetchEventCounts();
    }

    async function fetchEventCounts() {
        const period = periodFilter.value;
        try {
            const response = await fetch(`${backendUrl}/event-counts?storeCode=${storeCode}&period=${period}`);
            if (!response.ok) throw new Error('Failed to fetch event counts');
            const counts = await response.json();
            renderStatCards(counts);
        } catch (error) {
            console.error('Error fetching event counts:', error);
            statCardsContainer.innerHTML = '<p>Could not load stats.</p>';
        }
    }

    async function fetchEvents() {
        const event = eventFilter.value;
        const period = periodFilter.value;

        try {
            const response = await fetch(`${backendUrl}/data?storeCode=${storeCode}&event=${event}&period=${period}`);
            if (!response.ok) throw new Error('Failed to fetch events');
            const events = await response.json();
            renderEvents(events);
        } catch (error) {
            console.error('Error fetching events:', error);
            eventsTableBody.innerHTML = '<tr><td colspan="4">Failed to load events.</td></tr>';
        }
    }

    async function fetchTopViewedProducts() {
        const period = periodFilter.value;
        try {
            const response = await fetch(`${backendUrl}/top-viewed-products?storeCode=${storeCode}&period=${period}`);
            if (!response.ok) throw new Error('Failed to fetch top viewed products');
            const products = await response.json();
            renderProductRow(products, topViewedContainer, 'Views');
        } catch (error) {
            console.error('Error fetching top viewed products:', error);
            topViewedContainer.innerHTML = '<p>Could not load products.</p>';
        }
    }

    async function fetchTopAddedToCartProducts() {
        const period = periodFilter.value;
        try {
            const response = await fetch(`${backendUrl}/top-added-to-cart-products?storeCode=${storeCode}&period=${period}`);
            if (!response.ok) throw new Error('Failed to fetch top added to cart products');
            const products = await response.json();
            renderProductRow(products, topAddedToCartContainer, 'Adds to Cart');
        } catch (error) {
            console.error('Error fetching top added to cart products:', error);
            topAddedToCartContainer.innerHTML = '<p>Could not load products.</p>';
        }
    }

    async function fetchTopCheckoutProducts() {
        const period = periodFilter.value;
        try {
            const response = await fetch(`${backendUrl}/top-checkout-products?storeCode=${storeCode}&period=${period}`);
            if (!response.ok) throw new Error('Failed to fetch top checkout products');
            const products = await response.json();
            renderProductRow(products, topCheckoutContainer, 'in Checkouts');
        } catch (error) {
            console.error('Error fetching top checkout products:', error);
            topCheckoutContainer.innerHTML = '<p>Could not load products.</p>';
        }
    }

    async function fetchTopPurchasedProducts() {
        const period = periodFilter.value;
        try {
            const response = await fetch(`${backendUrl}/top-purchased-products?storeCode=${storeCode}&period=${period}`);
            if (!response.ok) throw new Error('Failed to fetch top purchased products');
            const products = await response.json();
            renderProductRow(products, topPurchasedContainer, 'Purchases');
        } catch (error) {
            console.error('Error fetching top purchased products:', error);
            topPurchasedContainer.innerHTML = '<p>Could not load products.</p>';
        }
    }

    function renderStatCards(counts) {
        statCardsContainer.innerHTML = '';
        const eventTypes = {
            'ViewContent': 'View Content',
            'AddToCart': 'Add to Cart',
            'InitiateCheckout': 'Initiate Checkout',
            'Purchase': 'Purchases'
        };

        for (const key in eventTypes) {
            const card = document.createElement('div');
            card.className = 'stat-card';
            card.innerHTML = `
                <h4>${eventTypes[key]}</h4>
                <p>${counts[key] || 0}</p>
            `;
            statCardsContainer.appendChild(card);
        }
    }

    function renderEvents(events) {
        eventsTableBody.innerHTML = '';
        if (events.length === 0) {
            eventsTableBody.innerHTML = '<tr><td colspan="4">No events found for the selected filters.</td></tr>';
            return;
        }

        events.forEach(event => {
            const row = document.createElement('tr');
            // Sanitize event name for use in a CSS class
            const eventClass = event.eventName ? `event-${event.eventName.toLowerCase().replace(/\s+/g, '_')}` : 'event-other';
            
            let productImage = event.productImage;
            let productName = event.productName;

            if (event.eventName === 'InitiateCheckout' && event.contents && event.contents.length > 0) {
                productImage = event.contents[0].productImage;
                productName = event.contents[0].productName;
            }

            row.innerHTML = `
                <td><img src="${productImage || ''}" alt="${productName || 'N/A'}" onerror="this.style.display='none'"></td>
                <td class="product-name-cell">${productName || 'N/A'}</td>
                <td><span class="event-type ${eventClass}">${event.eventName || 'Unknown'}</span></td>
                <td>${new Date(event.timestamp).toLocaleString()}</td>
            `;
            eventsTableBody.appendChild(row);
        });
    }

    function renderProductRow(products, container, countLabel) {
        container.innerHTML = '';
        if (products.length === 0) {
            container.innerHTML = '<p>No product data available.</p>';
            return;
        }

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <img src="${product.productImage}" alt="${product.productName}" onerror="this.style.display='none'">
                <div class="product-card-content">
                    <h4>${product.productName}</h4>
                    <p>${product.count} ${countLabel}</p>
                </div>
            `;
            container.appendChild(card);
        });
    }

    filterButton.addEventListener('click', fetchAllData);

    const logoutButton = document.getElementById('logout-button');
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('storeCode');
        window.location.href = 'index.html';
    });

    // Initial data fetch
    fetchAllData();

    // Sidebar toggle functionality
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }
});