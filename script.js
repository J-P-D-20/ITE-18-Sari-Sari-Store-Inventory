const API_URL = 'http://localhost:3000';

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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    setupEventListeners();
});

function setupEventListeners() {
    addBtn.addEventListener('click', openAddModal);
    cancelBtn.addEventListener('click', closeModal);
    productForm.addEventListener('submit', handleFormSubmit);
    searchInput.addEventListener('input', handleSearch);
    clearSearchBtn.addEventListener('click', clearSearch);

    // Close modal when clicking outside
    productModal.addEventListener('click', (e) => {
        if (e.target === productModal) closeModal();
    });
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
        showEmptyMessage(topProductsBody, 5, 'Failed to load products. Make sure the server is running.');
        showEmptyMessage(inStockBody, 5, 'Failed to load products.');
        showEmptyMessage(lowStockBody, 5, 'Failed to load products.');
        showEmptyMessage(outOfStockBody, 4, 'Failed to load products.');
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
    displayTopProducts(topProducts);
    displayInStock(inStock);
    displayLowStock(lowStock);
    displayOutOfStock(outOfStock);

    // Update badges
    document.getElementById('inStockBadge').textContent = inStock.length;
    document.getElementById('lowStockBadge').textContent = lowStock.length;
    document.getElementById('outOfStockBadge').textContent = outOfStock.length;
}

function displayTopProducts(products) {
    topProductsBody.innerHTML = '';

    if (products.length === 0) {
        showEmptyMessage(topProductsBody, 5, 'No products available');
        return;
    }

    products.forEach((product, index) => {
        const row = document.createElement('tr');
        const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';

        row.innerHTML = `
            <td><span class="rank-badge ${rankClass}">${index + 1}</span></td>
            <td><strong>${product.ProductName}</strong></td>
            <td>₱${product.Price.toFixed(2)}</td>
            <td>${product.Quantity} units</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-small btn-edit" onclick="openEditModal(${product.id})">Edit</button>
                    <button class="btn-small btn-delete" onclick="deleteProduct(${product.id})">Delete</button>
                </div>
            </td>
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
            <td>${product.Quantity} units</td>
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
            <td>${product.Quantity} units</td>
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
            await updateProduct(editingId, data);
        } else {
            await addProduct(data);
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
        const response = await fetch(`${API_URL}/deleteData/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete product');
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
        clearSearchBtn.style.display = 'none';
    } else {
        const filtered = allProducts.filter(product =>
            product.ProductName.toLowerCase().includes(query)
        );
        displayAllProducts(filtered);
        clearSearchBtn.style.display = 'block';
    }
}

function clearSearch() {
    searchInput.value = '';
    displayAllProducts(allProducts);
    clearSearchBtn.style.display = 'none';
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

        document.getElementById('totalProducts').textContent = total;
        document.getElementById('inStockCount').textContent = inStockCount;
        document.getElementById('lowStockCount').textContent = lowStock.length;
        document.getElementById('outOfStockCount').textContent = outOfStock.length;
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}
