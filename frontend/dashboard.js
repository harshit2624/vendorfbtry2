document.addEventListener('DOMContentLoaded', () => {
    const storeCode = localStorage.getItem('storeCode');
    if (!storeCode) {
        window.location.href = 'index.html';
        return;
    }

    const tableBody = document.querySelector('#events-table tbody');
    const filterButton = document.getElementById('filter-button');

    // Replace with your actual backend URL
    const backendUrl = 'http://localhost:3000';

    async function fetchEvents() {
        // This is a placeholder for the actual API call
        // since the backend is not running yet.
        console.log(`Fetching events for store: ${storeCode}`);

        // Example of how the fetch call would look:
        /*
        try {
            const response = await fetch(`${backendUrl}/data?storeCode=${storeCode}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const events = await response.json();
            renderEvents(events);
        } catch (error) {
            console.error('Failed to fetch events:', error);
            tableBody.innerHTML = '<tr><td colspan="4">Failed to load events.</td></tr>';
        }
        */

        // Using dummy data for now
        const dummyEvents = [
            { eventName: 'Purchase', productName: 'T-Shirt', productImage: 'https://via.placeholder.com/50', timestamp: new Date().toISOString() },
            { eventName: 'AddToCart', productName: 'Jeans', productImage: 'https://via.placeholder.com/50', timestamp: new Date().toISOString() }
        ];
        renderEvents(dummyEvents);
    }

    function renderEvents(events) {
        tableBody.innerHTML = '';
        if (events.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4">No events found.</td></tr>';
            return;
        }

        events.forEach(event => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${event.eventName}</td>
                <td>${event.productName}</td>
                <td><img src="${event.productImage}" alt="${event.productName}"></td>
                <td>${new Date(event.timestamp).toLocaleString()}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    filterButton.addEventListener('click', fetchEvents);

    // Initial fetch
    fetchEvents();
});
