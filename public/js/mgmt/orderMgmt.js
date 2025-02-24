let allOrders = [];

// Fetch all orders from the server
async function fetchOrders() {
    try {
        const response = await fetch('/api/orders'); 
        if (!response.ok) {
            throw new Error(`Error fetching orders: ${response.statusText}`);
        }
        const { orders } = await response.json();
        return orders;
    } catch (error) {
        console.error('Error fetching orders:', error);
        return [];
    }
}

// Render orders in the table
function renderOrders(orderList) {
    const ordersTableBody = document.getElementById('ordersTableBody');
    ordersTableBody.innerHTML = ''; 

    if (orderList.length === 0) {
        ordersTableBody.innerHTML = '<tr><td colspan="6" class="text-center">No orders found.</td></tr>';
        return;
    }

    orderList.forEach(order => {
        const totalAmount = order.products.reduce((total, product) => {
            const basePrice = Number(product.product.basePrice) || 0;
            const extraPrice = Number(product.product.extraPrice) || 0;
            const productPrice = calculateProductPrice(basePrice, extraPrice, product.size);

            const productTotal = productPrice * product.amount; 
            return total + productTotal; 
        }, 0);

        const productDetails = order.products.map(product => {
            const basePrice = Number(product.product.basePrice) || 0;
            const extraPrice = Number(product.product.extraPrice) || 0;
            const productPrice = calculateProductPrice(basePrice, extraPrice, product.size);

            return `
                <li>${product.product.name} (x${product.amount}) - 
                    ${product.size} - $${productPrice.toFixed(2)}</li>`;
        }).join('');

        const row = `
            <tr>
                <td>${order._id}</td>
                <td>${order.user ? order.user.username : 'Unknown User'}</td>
                <td><ul>${productDetails}</ul></td>
                <td>${new Date(order.orderDate).toLocaleString()}</td>
                <td>${totalAmount.toFixed(2)} $</td>
                <td>
                    <button class="btn btn-danger" onclick="deleteOrder('${order._id}')">
                        Delete
                    </button>
                </td>
                <td>
                <button class="btn btn-danger" onclick="editOrder('${order._id}')">Edit</button>
                </td>
            </tr>
        `;
        ordersTableBody.innerHTML += row;
    });
}

// Helper function to calculate the product price based on size
function calculateProductPrice(basePrice, extraPrice, size) {
    if (size === 'M') return basePrice + extraPrice; 
    if (size === 'L') return basePrice + 2 * extraPrice; 
    return basePrice;
}

// Delete an order by ID
async function deleteOrder(orderId) {
    try {
        const response = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
        if (!response.ok) {
            throw new Error(`Error deleting order: ${response.statusText}`);
        }
        console.log(`Order ${orderId} deleted successfully`);
        refreshOrders(); 
    } catch (error) {
        console.error('Error deleting order:', error);
    }
}
let currentOrderId = null; 

// Populate the form with current order data
function populateEditOrderForm(order) {
    const form = document.getElementById("editOrderForm");
    form.innerHTML = ""; 

    order.products.forEach((product, index) => {
        form.innerHTML += `
            <div>
                <label class="form-label">Product:</label>
                <label class="form-label">${product.product.name}</label></br>
                <label class="form-label">Product ID:</label>
                <input type="text" id="productId${index}" value="${product.productId}" readonly class="form-control">
                
                <label class="form-label" for="amount${index}">Amount:</label>
                <input type="number" id="amount${index}" value="${product.amount}" required class="form-control">
                
                <label class="form-label" for="size${index}">Size:</label>
                <select id="size${index}" class="form-select">
                    <option value="S" ${product.size === 'S' ? 'selected' : ''}>Small</option>
                    <option value="M" ${product.size === 'M' ? 'selected' : ''}>Medium</option>
                    <option value="L" ${product.size === 'L' ? 'selected' : ''}>Large</option>
                </select>
                
                <br><br>
            </div>
        `;
    });
}

// open edit order modal
async function editOrder(orderId) {
    try {
        currentOrderId = orderId;
        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) {
            throw new Error(`Error fetching order for edit: ${response.statusText}`);
        }

        const order = await response.json();
        populateEditOrderForm(order);
        $('#editOrderModal').modal('show'); // Show the modal with Bootstrap's jQuery
    } catch (error) {
        console.error("Error in editOrder function:", error);
    }
}


// Close the edit order modal
function closeEditOrderModal() {
    document.getElementById("editOrderModal").style.display = "none";
}

// Collect data and submit the edit
async function submitEditOrder() {
    const form = document.getElementById("editOrderForm");
    const products = [];

    for (let i = 0; i < form.children.length; i++) {
        const product = {
            productId: document.getElementById(`productId${i}`).value,
            amount: parseInt(document.getElementById(`amount${i}`).value, 10),
            size: document.getElementById(`size${i}`).value,
        };
        products.push(product);
    }

    try {
        const response = await fetch(`/api/orders/${currentOrderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ products }),
        });

        if (!response.ok) {
            throw new Error(`Error updating order: ${response.statusText}`);
        }

        console.log(`Order ${currentOrderId} updated successfully`);
        await refreshOrders();  // Wait for orders to refresh
        $('#editOrderModal').modal('hide');  // Properly hide the modal
    } catch (error) {
        console.error('Error editing order:', error);
    }
}

// filter orders by searchbar
function filterOrders() {
    const query = document.getElementById('orderSearch').value.toLowerCase();

    const filteredOrders = allOrders.filter(order => 
        order._id.toLowerCase().includes(query) || 
        (order.user && order.user.username.toLowerCase().includes(query))
    );

    renderOrders(filteredOrders);
}

// Refresh the order list by fetching and rendering the data
async function refreshOrders() {
    allOrders = await fetchOrders();
    console.log('Fetched orders:', allOrders); 
    renderOrders(allOrders);
}

document.addEventListener('DOMContentLoaded', refreshOrders);