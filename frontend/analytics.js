document.addEventListener('DOMContentLoaded', () => {
    const storeCode = localStorage.getItem('storeCode');
    if (!storeCode) {
        window.location.href = 'index.html';
        return;
    }

    const backendUrl = 'https://pixeltracker-32pl.onrender.com';

    const analyticsTableBody = document.getElementById('analytics-table-body');
    const periodFilter = document.getElementById('period-filter');
    const filterButton = document.getElementById('filter-button');

    async function fetchAnalytics() {
        const period = periodFilter.value;

        try {
            const response = await fetch(`${backendUrl}/product-performance?storeCode=${storeCode}&period=${period}`);
            if (!response.ok) throw new Error('Failed to fetch analytics data');
            const data = await response.json();
            renderAnalytics(data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            analyticsTableBody.innerHTML = '<tr><td colspan="7">Failed to load analytics data.</td></tr>';
        }
    }

    function renderAnalytics(data) {
        analyticsTableBody.innerHTML = '';
        if (data.length === 0) {
            analyticsTableBody.innerHTML = '<tr><td colspan="7">No product data available for the selected filters.</td></tr>';
            return;
        }

        data.forEach(product => {
            const row = document.createElement('tr');
            
            const atcRate = product.views > 0 ? ((product.atcs / product.views) * 100).toFixed(2) : 0;
            const checkoutRate = product.atcs > 0 ? ((product.checkouts / product.atcs) * 100).toFixed(2) : 0;
            const vtcRate = product.views > 0 ? ((product.checkouts / product.views) * 100).toFixed(2) : 0;

            row.innerHTML = `
                <td>
                    <div class="product-cell">
                        <img src="${product.productImage || ''}" alt="${product.productName}" onerror="this.style.display='none'">
                        <span>${product.productName}</span>
                    </div>
                </td>
                <td>${product.views}</td>
                <td>${product.atcs}</td>
                <td>${product.checkouts}</td>
                <td>${atcRate}%</td>
                <td>${checkoutRate}%</td>
                <td>${vtcRate}%</td>
            `;
            analyticsTableBody.appendChild(row);
        });
    }

    filterButton.addEventListener('click', fetchAnalytics);

    const logoutButton = document.getElementById('logout-button');
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('storeCode');
        window.location.href = 'index.html';
    });

    // Initial data fetch
    fetchAnalytics();
    
    // Sidebar toggle functionality
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }
});