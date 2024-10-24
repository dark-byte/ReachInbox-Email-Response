document.getElementById('login-btn').addEventListener('click', () => {
    window.location.href = '/auth/google';
});

// Check authentication status and show classify button if authenticated
fetch('/api/check-auth')
    .then(response => response.json())
    .then(data => {
        if (data.isAuthenticated) {
            document.getElementById('classify-btn').style.display = 'block';
        }
    });

document.getElementById('classify-btn').addEventListener('click', async () => {
    const response = await fetch('/api/classify-emails');
    const data = await response.json();
    
    document.getElementById('results').innerHTML = data.map(email => `
        <div>
            <h3>Email Snippet: ${email.snippet}</h3>
            <p>Classification: ${email.classification}</p>
            <p><strong>Generated Response:</strong> ${email.responseEmail}</p>
        </div>
    `).join('');
});
