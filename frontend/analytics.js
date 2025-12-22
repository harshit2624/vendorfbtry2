document.addEventListener('DOMContentLoaded', () => {
    const storeCode = localStorage.getItem('storeCode');
    if (!storeCode) {
        window.location.href = 'index.html';
        return;
    }

    const backendUrl = 'https://pixeltracker-32pl.onrender.com';

    const analyticsTableBody = document.getElementById('analytics-table-body');
    const topViewToAtcContainer = document.getElementById('top-view-to-atc-products');
    const topAtcToCheckoutContainer = document.getElementById('top-atc-to-checkout-products');
    const topViewToCheckoutContainer = document.getElementById('top-view-to-checkout-products');
    const periodFilter = document.getElementById('period-filter');
    const sortMetricFilter = document.getElementById('sort-metric-filter');
    const sortDirectionFilter = document.getElementById('sort-direction-filter');
    const filterButton = document.getElementById('filter-button');

    async function fetchAnalytics() {
        const period = periodFilter.value;

        try {
            const response = await fetch(`${backendUrl}/product-performance?storeCode=${storeCode}&period=${period}`);
            if (!response.ok) throw new Error('Failed to fetch analytics data');
            const data = await response.json();
            renderAnalyticsTable(data);
            renderTopRatedProducts(data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            analyticsTableBody.innerHTML = '<tr><td colspan="7">Failed to load analytics data.</td></tr>';
        }
    }

    function renderAnalyticsTable(data) {
        analyticsTableBody.innerHTML = '';
        if (data.length === 0) {
            analyticsTableBody.innerHTML = '<tr><td colspan="7">No product data available for the selected filters.</td></tr>';
            return;
        }

        const withRates = data.map(p => ({
            ...p,
            atcRate: p.views > 0 ? (p.atcs / p.views) * 100 : 0,
            checkoutRate: p.atcs > 0 ? (p.checkouts / p.atcs) * 100 : 0,
            vtcRate: p.views > 0 ? (p.checkouts / p.views) * 100 : 0,
        }));

        const sortMetric = sortMetricFilter.value;
        const sortDirection = sortDirectionFilter.value;

        withRates.sort((a, b) => {
            let valA = a[sortMetric];
            let valB = b[sortMetric];

            if (typeof valA === 'string') {
                return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
            } else {
                return sortDirection === 'asc' ? valA - valB : valB - valA;
            }
        });

        withRates.forEach(product => {
            const row = document.createElement('tr');
            
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
                <td>${product.atcRate.toFixed(2)}%</td>
                <td>${product.checkoutRate.toFixed(2)}%</td>
                <td>${product.vtcRate.toFixed(2)}%</td>
            `;
            analyticsTableBody.appendChild(row);
        });
    }

    function renderProductRow(products, container, countLabel, valueKey) {
        container.innerHTML = '';
        if (products.length === 0) {
            container.innerHTML = '<p>No product data available.</p>';
            return;
        }

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            const value = product[valueKey] || 0;
            card.innerHTML = `
                <img src="${product.productImage}" alt="${product.productName}" onerror="this.style.display='none'">
                <div class="product-card-content">
                    <h4>${product.productName}</h4>
                    <p>${value.toFixed(2)}% ${countLabel}</p>
                </div>
            `;
            container.appendChild(card);
        });
    }


    function renderTopRatedProducts(data) {
        const withRates = data.map(p => ({
            ...p,
            atcRate: p.views > 0 ? (p.atcs / p.views) * 100 : 0,
            checkoutRate: p.atcs > 0 ? (p.checkouts / p.atcs) * 100 : 0,
            vtcRate: p.views > 0 ? (p.checkouts / p.views) * 100 : 0,
        }));

        const topViewToAtc = [...withRates].filter(p => p.views > 0).sort((a, b) => b.atcRate - a.atcRate).slice(0, 10);
        const topAtcToCheckout = [...withRates].filter(p => p.atcs > 0).sort((a, b) => b.checkoutRate - a.checkoutRate).slice(0, 10);
        const topViewToCheckout = [...withRates].filter(p => p.views > 0).sort((a, b) => b.vtcRate - a.vtcRate).slice(0, 10);

        renderProductRow(topViewToAtc, topViewToAtcContainer, 'View-to-ATC', 'atcRate');
        renderProductRow(topAtcToCheckout, topAtcToCheckoutContainer, 'ATC-to-Checkout', 'checkoutRate');
        renderProductRow(topViewToCheckout, topViewToCheckoutContainer, 'View-to-Checkout', 'vtcRate');
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