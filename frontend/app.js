document.getElementById('login-btn').addEventListener('click', () => {
    window.location.href = '/auth/google';
});

// Check authentication status and show classify button if authenticated
fetch('/api/check-auth', {
    method: 'GET',
    credentials: 'include',
})
    .then(response => response.json())
    .then(data => {
        if (data.isAuthenticated) {
            document.getElementById('classify-btn').style.display = 'block';
            fetchLogs(); // Fetch logs upon authentication
        }
    });

document.getElementById('classify-btn').addEventListener('click', async () => {
    try {
        const response = await fetch('/api/classify-emails', {
            method: 'GET',
            credentials: 'include',
        });
        const data = await response.json();
        alert(data.message);
    } catch (error) {
        console.error('Error:', error);
        alert('You need to log in to classify emails.');
    }
});

// Function to fetch and display logs
const fetchLogs = async () => {
    try {
        const response = await fetch('/api/logs', {
            method: 'GET',
            credentials: 'include',
        });
        const data = await response.json();

        document.getElementById('results').innerHTML = data.map(log => `
            <div class="log-entry">
                <h3>Email ID: ${log.emailId}</h3>
                <p><strong>Classification:</strong> ${log.classification}</p>
                <p><strong>Snippet:</strong> ${log.snippet}</p>
                <p><strong>Generated Response:</strong> ${log.responseEmail}</p>
                <p><em>Processed at: ${new Date(log.timestamp).toLocaleString()}</em></p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error fetching logs:', error);
    }
};
