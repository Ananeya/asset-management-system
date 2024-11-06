// Check if user is logged in
const token = localStorage.getItem('authToken');
if (!token) {
    window.location.href = '/pages/login.html';
}

document.getElementById('requestForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const requestData = {
        category: document.getElementById('itemCategory').value,
        reason: document.getElementById('requestReason').value
    };

    try {
        const response = await fetch('http://localhost:5000/api/items/request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestData)
        });

        if (response.ok) {
            alert('Request submitted successfully');
            window.location.href = '/pages/dashboard.html';
        } else {
            const data = await response.json();
            alert(data.message || 'Error submitting request');
        }
    } catch (error) {
        console.error('Error submitting request:', error);
        alert('Error submitting request');
    }
});

// Add logout functionality
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/index.html';
}); 