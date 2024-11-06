let items = [];
let selectedItemId = null;

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadItems();
    setupEventListeners();
});

function checkAuth() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '/pages/login.html';
    }
}

async function loadItems() {
    try {
        const response = await fetch('http://localhost:5000/api/items', {
            headers: {
                'Authorization': localStorage.getItem('authToken')
            }
        });
        items = await response.json();
        renderItems(items);
    } catch (error) {
        console.error('Error loading items:', error);
        alert('Error loading items');
    }
}

function renderItems(items) {
    const user = JSON.parse(localStorage.getItem('user'));
    const isStorekeeper = user && user.role === 'storekeeper';
    
    const itemsList = document.getElementById('itemsList');
    itemsList.innerHTML = items.map(item => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap">${item.name}</td>
            <td class="px-6 py-4 whitespace-nowrap">${item.category}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    item.availability ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }">
                    ${item.availability ? 'Available' : 'Assigned'}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                ${item.assignedTo ? item.assignedTo.username : '-'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                ${isStorekeeper ? `
                    ${item.availability ? 
                        `<button onclick="showAssignModal('${item._id}')" 
                            class="text-indigo-600 hover:text-indigo-900 mr-4">
                            Assign
                        </button>` 
                        : ''
                    }
                    <button onclick="editItem('${item._id}')" 
                        class="text-blue-600 hover:text-blue-900 mr-4">
                        Edit
                    </button>
                    <button onclick="deleteItem('${item._id}')" 
                        class="text-red-600 hover:text-red-900">
                        Delete
                    </button>
                ` : `
                    ${item.assignedTo && item.assignedTo._id === user._id ? 
                        `<button onclick="reportIssue('${item._id}')" 
                            class="text-yellow-600 hover:text-yellow-900">
                            Report Issue
                        </button>` 
                        : ''
                    }
                `}
            </td>
        </tr>
    `).join('');
}

function setupEventListeners() {
    document.getElementById('searchInput').addEventListener('input', filterItems);
    document.getElementById('categoryFilter').addEventListener('change', filterItems);
    document.getElementById('availabilityFilter').addEventListener('change', filterItems);
    document.getElementById('addItemBtn').addEventListener('click', () => showModal());
    document.getElementById('itemForm').addEventListener('submit', handleItemSubmit);
}

function filterItems() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    const availability = document.getElementById('availabilityFilter').value;

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm) ||
                            item.category.toLowerCase().includes(searchTerm);
        const matchesCategory = !category || item.category === category;
        const matchesAvailability = availability === '' || 
                                  item.availability.toString() === availability;

        return matchesSearch && matchesCategory && matchesAvailability;
    });

    renderFilteredItems(filteredItems);
}

async function loadEmployees() {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('http://localhost:5000/api/auth/employees', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch employees');
        }
        
        const employees = await response.json();
        
        const select = document.getElementById('employeeSelect');
        select.innerHTML = '<option value="">Select Employee</option>';
        employees.forEach(employee => {
            select.innerHTML += `<option value="${employee._id}">${employee.username}</option>`;
        });
    } catch (error) {
        console.error('Error loading employees:', error);
        alert('Error loading employees list');
    }
}

async function showAssignModal(itemId) {
    selectedItemId = itemId;
    const modal = document.getElementById('assignModal');
    modal.classList.remove('hidden');
    loadEmployees();
}

async function assignItem() {
    const employeeId = document.getElementById('employeeSelect').value;
    if (!employeeId) {
        alert('Please select an employee');
        return;
    }

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`http://localhost:5000/api/items/${selectedItemId}/assign`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ userId: employeeId })
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('assignModal').classList.add('hidden');
            loadItems(); // Refresh the items list
            alert('Item assigned successfully');
        } else {
            throw new Error(data.message || 'Error assigning item');
        }
    } catch (error) {
        console.error('Error assigning item:', error);
        alert(error.message || 'Error assigning item');
    }
}

// Add event listeners for the assign modal
document.getElementById('cancelAssign')?.addEventListener('click', () => {
    document.getElementById('assignModal').classList.add('hidden');
});

document.getElementById('confirmAssign')?.addEventListener('click', assignItem);

// Add this function to handle item creation
async function addItem(event) {
    event.preventDefault();
    
    const itemData = {
        name: document.getElementById('itemName').value,
        category: document.getElementById('itemCategory').value,
        description: document.getElementById('itemDescription').value,
    };

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('http://localhost:5000/api/items', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(itemData)
        });

        if (!response.ok) {
            throw new Error('Failed to add item');
        }

        // Close modal and refresh items list
        document.getElementById('itemModal').classList.add('hidden');
        document.getElementById('itemForm').reset();
        loadItems();
        alert('Item added successfully');
    } catch (error) {
        console.error('Error adding item:', error);
        alert('Error adding item');
    }
}

// Add this function to show the add item modal
function showAddItemModal() {
    document.getElementById('modalTitle').textContent = 'Add New Item';
    document.getElementById('itemForm').reset();
    document.getElementById('itemModal').classList.remove('hidden');
}

// ... Add more functions for CRUD operations ... 