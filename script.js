const API_URL = 'http://localhost:3000';

// Get current page
const currentPage = window.location.pathname.split('/').pop() || 'index.html';

// DOM Elements
const addBtn = document.getElementById('addBtn');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const productModal = document.getElementById('productModal');
const productForm = document.getElementById('productForm');
const cancelBtn = document.getElementById('cancelBtn');
const modalTitle = document.getElementById('modalTitle');
const productName = document.getElementById('productName');
const productPrice = document.getElementById('productPrice');
const productQuantity = document.getElementById('productQuantity');

// Table bodies
const topProductsBody = document.getElementById('topProductsBody');
const inStockBody = document.getElementById('inStockBody');
const lowStockBody = document.getElementById('lowStockBody');
const outOfStockBody = document.getElementById('outOfStockBody');

let allProducts = [];
let isEditMode = false;
let editingId = null;

// Logging System
let logs = JSON.parse(localStorage.getItem('inventoryLogs') || '[]');

function addLog(action, productName, details) {
    const log = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        action: action, // 'added', 'updated', 'deleted'
        productName: productName,
        details: details
    };
    logs.unshift(log);
    localStorage.setItem('inventoryLogs', JSON.stringify(logs));
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Initialize based on current page
    if (currentPage === 'logs.html') {
        initLogs();
    } else {
        loadProducts();
        setupEventListeners();
    }
});

function setupEventListeners() {
    if (addBtn) addBtn.addEventListener('click', openAddModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    if (productForm) productForm.addEventListener('submit', handleFormSubmit);
    if (searchInput) searchInput.addEventListener('input', handleSearch);
    if (clearSearchBtn) clearSearchBtn.addEventListener('click', clearSearch);

    // Close modal when clicking outside
    if (productModal) {
        productModal.addEventListener('click', (e) => {
            if (e.target === productModal) closeModal();
        });
    }
}

async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/displayData`);
        if (!response.ok) throw new Error('Failed to fetch products');
        allProducts = await response.json();
        displayAllProducts(allProducts);
        updateStats();
    } catch (error) {
        console.error('Error loading products:', error);
        if (topProductsBody) showEmptyMessage(topProductsBody, 5, 'Failed to load products. Make sure the server is running.');
        if (inStockBody) showEmptyMessage(inStockBody, 5, 'Failed to load products.');
        if (lowStockBody) showEmptyMessage(lowStockBody, 5, 'Failed to load products.');
        if (outOfStockBody) showEmptyMessage(outOfStockBody, 4, 'Failed to load products.');
    }
}

function displayAllProducts(products) {
    // Filter products by category
    const inStock = products.filter(p => p.Quantity >= 10);
    const lowStock = products.filter(p => p.Quantity > 0 && p.Quantity < 10);
    const outOfStock = products.filter(p => p.Quantity === 0);
    
    // Get top 5 most stocked
    const topProducts = [...products]
        .sort((a, b) => b.Quantity - a.Quantity)
        .slice(0, 5);

    // Display in respective tables
    if (topProductsBody) displayTopProducts(topProducts);
    if (inStockBody) displayInStock(inStock);
    if (lowStockBody) displayLowStock(lowStock);
    if (outOfStockBody) displayOutOfStock(outOfStock);

    // Update badges
    const inStockBadge = document.getElementById('inStockBadge');
    const lowStockBadge = document.getElementById('lowStockBadge');
    const outOfStockBadge = document.getElementById('outOfStockBadge');
    
    if (inStockBadge) inStockBadge.textContent = inStock.length;
    if (lowStockBadge) lowStockBadge.textContent = lowStock.length;
    if (outOfStockBadge) outOfStockBadge.textContent = outOfStock.length;
}

function displayTopProducts(products) {
    topProductsBody.innerHTML = '';

    if (products.length === 0) {
        showEmptyMessage(topProductsBody, 4, 'No products available');
        return;
    }

    products.forEach((product, index) => {
        const row = document.createElement('tr');
        const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';

        row.innerHTML = `
            <td><span class="rank-badge ${rankClass}">${index + 1}</span></td>
            <td><strong>${product.ProductName}</strong></td>
            <td>₱${product.Price.toFixed(2)}</td>
            <td>${product.Quantity}</td>
        `;

        topProductsBody.appendChild(row);
    });
}

function displayInStock(products) {
    inStockBody.innerHTML = '';

    if (products.length === 0) {
        showEmptyMessage(inStockBody, 5, 'No products in stock');
        return;
    }

    products.forEach((product) => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${product.id || 'N/A'}</td>
            <td><strong>${product.ProductName}</strong></td>
            <td>₱${product.Price.toFixed(2)}</td>
            <td>${product.Quantity}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-small btn-edit" onclick="openEditModal(${product.id})">Edit</button>
                    <button class="btn-small btn-delete" onclick="deleteProduct(${product.id})">Delete</button>
                </div>
            </td>
        `;

        inStockBody.appendChild(row);
    });
}

function displayLowStock(products) {
    lowStockBody.innerHTML = '';

    if (products.length === 0) {
        showEmptyMessage(lowStockBody, 5, 'No low stock products');
        return;
    }

    products.forEach((product) => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${product.id || 'N/A'}</td>
            <td><strong>${product.ProductName}</strong></td>
            <td>₱${product.Price.toFixed(2)}</td>
            <td>${product.Quantity}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-small btn-edit" onclick="openEditModal(${product.id})">Edit</button>
                    <button class="btn-small btn-delete" onclick="deleteProduct(${product.id})">Delete</button>
                </div>
            </td>
        `;

        lowStockBody.appendChild(row);
    });
}

function displayOutOfStock(products) {
    outOfStockBody.innerHTML = '';

    if (products.length === 0) {
        showEmptyMessage(outOfStockBody, 4, 'No out of stock products');
        return;
    }

    products.forEach((product) => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${product.id || 'N/A'}</td>
            <td><strong>${product.ProductName}</strong></td>
            <td>₱${product.Price.toFixed(2)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-small btn-edit" onclick="openEditModal(${product.id})">Edit</button>
                    <button class="btn-small btn-delete" onclick="deleteProduct(${product.id})">Delete</button>
                </div>
            </td>
        `;

        outOfStockBody.appendChild(row);
    });
}

function showEmptyMessage(tbody, colspan, message) {
    tbody.innerHTML = `
        <tr class="empty-message">
            <td colspan="${colspan}">${message}</td>
        </tr>
    `;
}

function openAddModal() {
    isEditMode = false;
    editingId = null;
    modalTitle.textContent = 'Add New Product';
    productForm.reset();
    productModal.classList.add('active');
    productName.focus();
}

function openEditModal(id) {
    const product = allProducts.find(p => p.id === id);
    if (!product) return;

    isEditMode = true;
    editingId = id;
    modalTitle.textContent = 'Edit Product';
    productName.value = product.ProductName;
    productPrice.value = product.Price;
    productQuantity.value = product.Quantity;
    productModal.classList.add('active');
    productName.focus();
}

function closeModal() {
    productModal.classList.remove('active');
    productForm.reset();
}

async function handleFormSubmit(e) {
    e.preventDefault();

    const data = {
        ProductName: productName.value.trim(),
        Price: parseFloat(productPrice.value),
        Quantity: parseInt(productQuantity.value)
    };

    if (!data.ProductName || isNaN(data.Price) || isNaN(data.Quantity)) {
        alert('Please fill in all fields with valid data');
        return;
    }

    try {
        if (isEditMode) {
            const oldProduct = allProducts.find(p => p.id === editingId);
            await updateProduct(editingId, data);
            
            // Log the update
            const changes = [];
            if (oldProduct.ProductName !== data.ProductName) {
                changes.push(`name changed from "${oldProduct.ProductName}" to "${data.ProductName}"`);
            }
            if (oldProduct.Price !== data.Price) {
                changes.push(`price changed from ₱${oldProduct.Price} to ₱${data.Price}`);
            }
            if (oldProduct.Quantity !== data.Quantity) {
                changes.push(`quantity changed from ${oldProduct.Quantity} to ${data.Quantity}`);
            }
            addLog('updated', data.ProductName, changes.join(', '));
        } else {
            await addProduct(data);
            // Log the addition
            addLog('added', data.ProductName, `Price: ₱${data.Price}, Quantity: ${data.Quantity}`);
        }
        closeModal();
        loadProducts();
    } catch (error) {
        console.error('Error:', error);
        alert('Error saving product. Please try again.');
    }
}

async function addProduct(data) {
    const response = await fetch(`${API_URL}/writeData`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add product');
    }
}

async function updateProduct(id, data) {
    const response = await fetch(`${API_URL}/editData/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update product');
    }
}

async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
        const product = allProducts.find(p => p.id === id);
        const response = await fetch(`${API_URL}/deleteData/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete product');
        
        // Log the deletion
        if (product) {
            addLog('deleted', product.ProductName, `Price: ₱${product.Price}, Quantity: ${product.Quantity}`);
        }
        
        loadProducts();
    } catch (error) {
        console.error('Error:', error);
        alert('Error deleting product. Please try again.');
    }
}

function handleSearch() {
    const query = searchInput.value.toLowerCase().trim();

    if (query === '') {
        displayAllProducts(allProducts);
        if (clearSearchBtn) clearSearchBtn.style.display = 'none';
    } else {
        const filtered = allProducts.filter(product =>
            product.ProductName.toLowerCase().includes(query)
        );
        displayAllProducts(filtered);
        if (clearSearchBtn) clearSearchBtn.style.display = 'block';
    }
}

function clearSearch() {
    searchInput.value = '';
    displayAllProducts(allProducts);
    if (clearSearchBtn) clearSearchBtn.style.display = 'none';
}

async function updateStats() {
    try {
        const totalResponse = await fetch(`${API_URL}/countProducts`);
        const total = await totalResponse.json();

        const lowStockResponse = await fetch(`${API_URL}/lowStocks`);
        const lowStock = await lowStockResponse.json();

        const outOfStockResponse = await fetch(`${API_URL}/outOfStock`);
        const outOfStock = await outOfStockResponse.json();

        // Calculate in stock (total - low stock - out of stock)
        const inStockCount = total - lowStock.length - outOfStock.length;

        const totalEl = document.getElementById('totalProducts');
        const inStockEl = document.getElementById('inStockCount');
        const lowStockEl = document.getElementById('lowStockCount');
        const outOfStockEl = document.getElementById('outOfStockCount');

        if (totalEl) totalEl.textContent = total;
        if (inStockEl) inStockEl.textContent = inStockCount;
        if (lowStockEl) lowStockEl.textContent = lowStock.length;
        if (outOfStockEl) outOfStockEl.textContent = outOfStock.length;
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

// ==================== LOGS PAGE FUNCTIONALITY ====================

function initLogs() {
    logs = JSON.parse(localStorage.getItem('inventoryLogs') || '[]');
    let filteredLogs = [...logs];

    function formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    function getActionBadge(action) {
        const badges = {
            'added': '<span class="action-badge badge-added">ADDED</span>',
            'updated': '<span class="action-badge badge-updated">UPDATED</span>',
            'deleted': '<span class="action-badge badge-deleted">DELETED</span>'
        };
        return badges[action] || action;
    }

    function renderLogs() {
        const tbody = document.getElementById('logsBody');
        
        if (filteredLogs.length === 0) {
            tbody.innerHTML = '<tr class="empty-message"><td colspan="4">No logs to display</td></tr>';
            return;
        }

        tbody.innerHTML = filteredLogs.map(log => `
            <tr>
                <td>${formatTimestamp(log.timestamp)}</td>
                <td>${getActionBadge(log.action)}</td>
                <td><strong>${log.productName}</strong></td>
                <td>${log.details}</td>
            </tr>
        `).join('');
    }

    function updateLogStats() {
        document.getElementById('totalLogs').textContent = logs.length;
        document.getElementById('addedCount').textContent = logs.filter(l => l.action === 'added').length;
        document.getElementById('updatedCount').textContent = logs.filter(l => l.action === 'updated').length;
        document.getElementById('deletedCount').textContent = logs.filter(l => l.action === 'deleted').length;
        document.getElementById('logsBadge').textContent = filteredLogs.length;
    }

    function filterLogs() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const actionFilter = document.getElementById('filterAction').value;

        filteredLogs = logs.filter(log => {
            const matchesSearch = log.productName.toLowerCase().includes(searchTerm) ||
                                log.details.toLowerCase().includes(searchTerm);
            const matchesAction = actionFilter === 'all' || log.action === actionFilter;
            return matchesSearch && matchesAction;
        });

        renderLogs();
        document.getElementById('logsBadge').textContent = filteredLogs.length;
    }

    // Event listeners for logs page
    document.getElementById('searchInput').addEventListener('input', filterLogs);
    document.getElementById('filterAction').addEventListener('change', filterLogs);

    document.getElementById('clearLogsBtn').addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all logs? This action cannot be undone.')) {
            logs = [];
            filteredLogs = [];
            localStorage.setItem('inventoryLogs', JSON.stringify(logs));
            renderLogs();
            updateLogStats();
        }
    });

    // Initial render
    renderLogs();
    updateLogStats();
}
