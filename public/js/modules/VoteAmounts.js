export class VoteAmounts {
    constructor(container, amounts, onSelect) {
        this.container = container;
        this.amounts = amounts;
        this.onSelect = onSelect;
        this.selectedButton = null;
        
        this.render();
    }

    render() {
        this.container.innerHTML = '';
        
        Object.entries(this.amounts).forEach(([key, value]) => {
            const button = this.createButton(value);
            this.container.appendChild(button);
        });
    }

    createButton(amount) {
        const button = document.createElement('button');
        button.className = 'vote-button';
        button.type = 'button';
        button.innerHTML = `
            ${amount.name}<br>
            $${amount.amount}
        `;

        button.addEventListener('click', () => {
            if (this.selectedButton) {
                this.selectedButton.classList.remove('selected');
            }
            button.classList.add('selected');
            this.selectedButton = button;
            this.onSelect(amount.amount);
        });

        return button;
    }

    show() {
        this.container.style.display = 'flex';
    }

    hide() {
        this.container.style.display = 'none';
    }

    reset() {
        if (this.selectedButton) {
            this.selectedButton.classList.remove('selected');
            this.selectedButton = null;
        }
    }
}