// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '/pages/login.html';
        return;
    }

    loadDashboardData();
    setupEventListeners();
    displayUserInfo();
});

async function loadDashboardData() {
    try {
        // Get user role from stored user data
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            window.location.href = '/pages/login.html';
            return;
        }

        // Show/hide elements based on role
        const isStorekeeper = user.role === 'storekeeper';
        document.querySelectorAll('[data-role]').forEach(element => {
            if (element.dataset.role === 'storekeeper') {
                element.style.display = isStorekeeper ? 'block' : 'none';
            } else if (element.dataset.role === 'employee') {
                element.style.display = !isStorekeeper ? 'block' : 'none';
            }
        });

        const [itemsStats, recentActivity] = await Promise.all([
            fetchItemsStats(),
            fetchRecentActivity()
        ]);

        updateDashboardStats(itemsStats);
        updateRecentActivity(recentActivity);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        alert('Error loading dashboard data. Please try again later.');
    }
}

async function fetchItemsStats() {
    const response = await fetch('http://localhost:5000/api/items/stats', {
        headers: {
            'Authorization': localStorage.getItem('authToken')
        }
    });
    return response.json();
}

async function fetchRecentActivity() {
    const response = await fetch('http://localhost:5000/api/items/recent-activity', {
        headers: {
            'Authorization': localStorage.getItem('authToken')
        }
    });
    return response.json();
}

function updateDashboardStats(stats) {
    document.getElementById('totalItems').textContent = stats.total;
    document.getElementById('availableItems').textContent = stats.available;
    document.getElementById('pendingIssues').textContent = stats.pendingIssues;
}

function updateRecentActivity(activities) {
    const activityList = document.getElementById('recentActivity');
    activityList.innerHTML = activities.map(activity => `
        <li class="py-4">
            <div class="flex space-x-3">
                <div class="flex-1 space-y-1">
                    <div class="flex items-center justify-between">
                        <h3 class="text-sm font-medium">${activity.type}</h3>
                        <p class="text-sm text-gray-500">${formatDate(activity.date)}</p>
                    </div>
                    <p class="text-sm text-gray-500">${activity.description}</p>
                </div>
            </div>
        </li>
    `).join('');
}

function setupEventListeners() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // Clear auth data
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            // Redirect to landing page
            window.location.href = '/index.html';
        });
    }

    document.getElementById('newItemBtn').addEventListener('click', () => {
        window.location.href = '/pages/items.html?action=new';
    });
}

function displayUserInfo() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        const userInfo = document.getElementById('userInfo');
        userInfo.textContent = `${user.username} (${user.role})`;
    }
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
} 