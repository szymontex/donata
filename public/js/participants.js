let selectedParticipant = null;
let selectedAmount = null;

// Loading participants
fetch('participants.json')
    .then(response => response.json())
    .then(data => {
        const participantsGrid = document.getElementById('participants-grid');
        const voteAmounts = document.getElementById('vote-amounts');
        
        // Adding participants
        data.participants.forEach(participant => {
            const card = document.createElement('div');
            card.className = 'participant-card';
            card.innerHTML = `
                <h3>${participant.name}</h3>
                <p>${participant.description}</p>
            `;
            card.addEventListener('click', () => {
                document.querySelectorAll('.participant-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                selectedParticipant = participant;
                voteAmounts.style.display = 'flex';
                renderVoteAmounts(data.voteAmounts);
            });
            participantsGrid.appendChild(card);
        });
    });

function renderVoteAmounts(amounts) {
    const container = document.getElementById('vote-amounts');
    container.innerHTML = '';
    
    Object.entries(amounts).forEach(([key, value]) => {
        const button = document.createElement('button');
        button.className = 'vote-button';
        button.type = 'button';
        button.innerHTML = `
            ${value.name}<br>
            ${value.amount}
        `;
        button.addEventListener('click', () => {
            document.querySelectorAll('.vote-button').forEach(b => b.classList.remove('selected'));
            button.classList.add('selected');
            selectedAmount = value.amount;
            
            const amountInput = document.getElementById('amount');
            if (amountInput) {
                amountInput.value = value.amount;
            }
        });
        container.appendChild(button);
    });
}

// Form handling
const form = document.getElementById('payment-form');
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nicknameInput = document.getElementById('nickname');
        const amountInput = document.getElementById('amount');
        const messageInput = document.getElementById('message');

        const nickname = nicknameInput?.value?.trim();
        const amount = Number(amountInput?.value);
        const message = messageInput?.value?.trim() || '';

        // Validation
        if (!nickname) {
            alert('Please enter your nickname!');
            nicknameInput?.focus();
            return;
        }

        if (!amount || amount < 1) {
            alert('Please enter a valid amount!');
            amountInput?.focus();
            return;
        }

        // Preparing data for submission
        const paymentData = {
            nickname: nickname,
            amount: amount,
            message: message,
        };

        // Add participant data only if one was selected
        if (selectedParticipant) {
            paymentData.participant = {
                id: selectedParticipant.id,
                name: selectedParticipant.name
            };
        }

        try {
            const response = await fetch('/api/create-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(paymentData)
            });

            if (!response.ok) {
                throw new Error('Error processing payment');
            }

            const data = await response.json();
            
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('No payment URL in response');
            }
        } catch (error) {
            console.error('Error:', error);
            alert(error.message || 'An error occurred while processing the payment');
        }
    });
}

// Handling manual amount input
const amountInput = document.getElementById('amount');
if (amountInput) {
    amountInput.addEventListener('input', () => {
        document.querySelectorAll('.vote-button').forEach(b => b.classList.remove('selected'));
        selectedAmount = Number(amountInput.value);
    });
}