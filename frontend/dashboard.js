document.addEventListener('DOMContentLoaded', () => {
    const storeCode = localStorage.getItem('storeCode');
    if (!storeCode) {
        window.location.href = 'index.html';
        return;
    }

    const backendUrl = 'https://pixeltracker-32pl.onrender.com';

    const eventsTableBody = document.querySelector('#events-table tbody');
    const topViewedContainer = document.getElementById('top-viewed-products');
    const topAddedToCartContainer = document.getElementById('top-added-to-cart-products');
    
    const eventFilter = document.getElementById('event-filter');
    const periodFilter = document.getElementById('period-filter');
    const filterButton = document.getElementById('filter-button');

    async function fetchAllData() {
        fetchEvents();
        fetchTopViewedProducts();
        fetchTopAddedToCartProducts();
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
            renderProductRow(products, topAddedToCartContainer, 'Adds');
        } catch (error) {
            console.error('Error fetching top added to cart products:', error);
            topAddedToCartContainer.innerHTML = '<p>Could not load products.</p>';
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
            row.innerHTML = `
                <td>${event.eventName}</td>
                <td>${event.productName}</td>
                <td><img src="${event.productImage}" alt="${event.productName}" onerror="this.style.display='none'"></td>
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
                <h4>${product.productName}</h4>
                <p>${product.count} ${countLabel}</p>
            `;
            container.appendChild(card);
        });
    }

    filterButton.addEventListener('click', fetchAllData);

    // Initial data fetch
    fetchAllData();
});