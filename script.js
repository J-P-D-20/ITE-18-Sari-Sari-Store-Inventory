const API_URL = 'http://localhost:3000';

// DOM Elements
const addBtn = document.getElementById('addBtn');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const productModal = document.getElementById('productModal');
const productForm = document.getElementById('productForm');
const cancelBtn = document.getElementById('cancelBtn');
const tableBody = document.getElementById('tableBody');
const modalTitle = document.getElementById('modalTitle');
const productName = document.getElementById('productName');
const productPrice = document.getElementById('productPrice');
const productQuantity = document.getElementById('productQuantity');

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
        displayProducts(allProducts);
        updateStats();
    } catch (error) {
        console.error('Error loading products:', error);
        showEmptyMessage('Failed to load products. Make sure the server is running.');
    }
}

function displayProducts(products) {
    tableBody.innerHTML = '';

    if (products.length === 0) {
        showEmptyMessage('No products found. Add your first product!');
        return;
    }

    products.forEach((product) => {
        const row = document.createElement('tr');
        const status = getStatus(product.Quantity);
        const statusClass = getStatusClass(product.Quantity);

        row.innerHTML = `
            <td>${product.id || 'N/A'}</td>
            <td><strong>${product.ProductName}</strong></td>
            <td>₱${product.Price.toFixed(2)}</td>
            <td>${product.Quantity} units</td>
            <td><span class="${statusClass}">${status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-small btn-edit" onclick="openEditModal(${product.id})">Edit</button>
                    <button class="btn-small btn-delete" onclick="deleteProduct(${product.id})">Delete</button>
                </div>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

function getStatus(quantity) {
    if (quantity === 0) return 'Out of Stock';
    if (quantity < 10) return 'Low Stock';
    return 'In Stock';
}

function getStatusClass(quantity) {
    if (quantity === 0) return 'status-out';
    if (quantity < 10) return 'status-low';
    return 'status-ok';
}

function showEmptyMessage(message) {
    tableBody.innerHTML = `
        <tr class="empty-message">
            <td colspan="6">${message}</td>
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
        displayProducts(allProducts);
        clearSearchBtn.style.display = 'none';
    } else {
        const filtered = allProducts.filter(product =>
            product.ProductName.toLowerCase().includes(query)
        );
        displayProducts(filtered);
        clearSearchBtn.style.display = 'block';
    }
}

function clearSearch() {
    searchInput.value = '';
    displayProducts(allProducts);
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

        document.getElementById('totalProducts').textContent = total;
        document.getElementById('lowStockCount').textContent = lowStock.length;
        document.getElementById('outOfStockCount').textContent = outOfStock.length;
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}