// Form handling
const errorDiv = document.getElementById('error-message');

document.getElementById('submit-button').addEventListener('click', async () => {
    const amount = document.getElementById('amount').value;
    const nickname = document.getElementById('nickname').value;
    const message = document.getElementById('message').value;

    // Validation
    if (!nickname.trim()) {
        errorDiv.textContent = 'Nickname is required';
        return;
    }

    try {
        const response = await fetch('/api/create-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: parseInt(amount),
                nickname,
                message,
                participant: selectedParticipant?.id
            }),
        });

        const session = await response.json();

        if (session.error) {
            throw new Error(session.error);
        }

        window.location = session.url;

    } catch (error) {
        errorDiv.textContent = error.message || 'An error occurred. Please try again.';
    }
});