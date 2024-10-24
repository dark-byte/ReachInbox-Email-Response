// Event Listener for Login Button
const loginBtn = document.getElementById('login-btn');
loginBtn.addEventListener('click', () => {
    window.location.href = '/auth/google';
});

// Fetch DOM Elements
const enableAutoReplyBtn = document.getElementById('enable-auto-reply-btn');
const disableAutoReplyBtn = document.getElementById('disable-auto-reply-btn');
const autoReplyControls = document.getElementById('auto-reply-controls');
const resultsContainer = document.getElementById('results');
const emailView = document.getElementById('email-view');
const emailList = document.getElementById('email-list');

// Initialize UI based on authentication
fetch('/api/check-auth', {
    method: 'GET',
    credentials: 'include',
})
    .then(response => response.json())
    .then(async data => {
        if (data.isAuthenticated) {
            // Hide Login Button
            loginBtn.style.display = 'none';
            
            // Show Auto-Reply Controls
            autoReplyControls.style.display = 'flex';
            autoReplyControls.style.justifyContent = 'center';
            autoReplyControls.style.alignItems = 'center';
            
            // Automatically Enable Auto-Reply
            await enableAutoReply();

            // Fetch and Display Logs
            fetchLogs();
        } else {
            // Show Login Button if not authenticated
            loginBtn.style.display = 'inline-block';
            autoReplyControls.style.display = 'none';
            emailView.style.display = 'none';
        }
    })
    .catch(error => {
        console.error('Error checking authentication:', error);
    });

// Enable Auto-Reply
const enableAutoReply = async () => {
    try {
        const response = await fetch('/api/enable-auto-reply', {
            method: 'POST',
            credentials: 'include',
        });
        const data = await response.json();
        if (response.ok) {
            alert(data.message);
            // Update Button Visibility
            enableAutoReplyBtn.style.display = 'none';
            disableAutoReplyBtn.style.display = 'inline-block';
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error('Error enabling auto-reply:', error);
        alert('Failed to enable auto-reply.');
    }
};

// Disable Auto-Reply
const disableAutoReply = async () => {
    try {
        const response = await fetch('/api/disable-auto-reply', {
            method: 'POST',
            credentials: 'include',
        });
        const data = await response.json();
        if (response.ok) {
            alert(data.message);
            // Update Button Visibility
            disableAutoReplyBtn.style.display = 'none';
            enableAutoReplyBtn.style.display = 'inline-block';
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error('Error disabling auto-reply:', error);
        alert('Failed to disable auto-reply.');
    }
};

// Event Listeners for Auto-Reply Buttons
enableAutoReplyBtn.addEventListener('click', () => {
    enableAutoReply();
});

disableAutoReplyBtn.addEventListener('click', () => {
    disableAutoReply();
});

// Function to Fetch and Display Logs
const fetchLogs = async () => {
    try {
        const response = await fetch('/api/logs', {
            method: 'GET',
            credentials: 'include',
        });
        const data = await response.json();

        if (data.length === 0) {
            emailList.innerHTML = '<p>No processed emails yet.</p>';
            return;
        }

        emailList.innerHTML = data.map(log => `
            <div class="email-item">
                <h3>Email ID: ${log.emailId}</h3>
                <p><strong>Classification:</strong> ${log.classification}</p>
                <p><strong>Snippet:</strong> ${log.snippet}</p>
                <p><strong>Generated Response:</strong> ${log.responseEmail}</p>
                <p><em>Processed at: ${new Date(log.timestamp).toLocaleString()}</em></p>
            </div>
        `).join('');

        emailView.style.display = 'block';
    } catch (error) {
        console.error('Error fetching logs:', error);
    }
};

// Automatically Refresh Logs Every 1 Minute
setInterval(fetchLogs, 60000);
