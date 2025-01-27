export class ParticipantsGrid {
    constructor(container, participants, onSelect) {
        this.container = container;
        this.participants = participants;
        this.onSelect = onSelect;
        this.selectedCard = null;
        
        this.render();
    }

    render() {
        this.container.innerHTML = '';
        
        this.participants.forEach(participant => {
            const card = this.createCard(participant);
            this.container.appendChild(card);
        });
    }

    createCard(participant) {
        const card = document.createElement('div');
        card.className = 'participant-card';
        card.innerHTML = `
            <h3>${participant.name}</h3>
            <p>${participant.description || ''}</p>
        `;

        card.addEventListener('click', () => {
            if (this.selectedCard) {
                this.selectedCard.classList.remove('selected');
            }
            card.classList.add('selected');
            this.selectedCard = card;
            this.onSelect(participant);
        });

        return card;
    }

    selectParticipant(participant) {
        const cards = this.container.querySelectorAll('.participant-card');
        cards.forEach(card => {
            if (card.querySelector('h3').textContent === participant.name) {
                card.click();
            }
        });
    }

    reset() {
        if (this.selectedCard) {
            this.selectedCard.classList.remove('selected');
            this.selectedCard = null;
        }
    }
}