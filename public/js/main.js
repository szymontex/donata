import { PaymentForm } from './modules/PaymentForm.js';
import { ParticipantsGrid } from './modules/ParticipantsGrid.js';
import { VoteAmounts } from './modules/VoteAmounts.js';
import { PaymentService } from './services/PaymentService.js';
import { DataService } from './services/DataService.js';

class App {
    constructor() {
        this.paymentService = new PaymentService();
        this.dataService = new DataService();
        
        this.state = {
            selectedParticipant: null,
            selectedAmount: null
        };
        
        this.init();
    }

    async init() {
        try {
            const data = await this.dataService.loadParticipantsData();
            
            // Initialize components
            this.participantsGrid = new ParticipantsGrid(
                document.getElementById('participants-grid'),
                data.participants,
                this.handleParticipantSelect.bind(this)
            );

            this.voteAmounts = new VoteAmounts(
                document.getElementById('vote-amounts'),
                data.voteAmounts,
                this.handleAmountSelect.bind(this)
            );

            this.paymentForm = new PaymentForm(
                document.getElementById('payment-form'),
                this.handlePaymentSubmit.bind(this)
            );

            // Check if there's saved data from previous session
            this.restoreFormData();
        } catch (error) {
            console.error('Initialization error:', error);
            this.showError('Failed to load data. Please refresh the page.');
        }
    }

    handleParticipantSelect(participant) {
        this.state.selectedParticipant = participant;
        this.voteAmounts.show();
    }

    handleAmountSelect(amount) {
        this.state.selectedAmount = amount;
        this.paymentForm.setAmount(amount);
    }

    async handlePaymentSubmit(formData) {
        try {
            const paymentData = {
                ...formData,
                participant: this.state.selectedParticipant
            };

            const response = await this.paymentService.createPayment(paymentData);
            
            // Save data before redirect
            this.saveFormData(paymentData);
            
            // Redirect to Stripe
            window.location.href = response.url;
        } catch (error) {
            this.showError(error.message);
        }
    }

    saveFormData(data) {
        sessionStorage.setItem('paymentData', JSON.stringify(data));
    }

    restoreFormData() {
        const savedData = sessionStorage.getItem('paymentData');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                this.paymentForm.restore(data);
                if (data.participant) {
                    this.participantsGrid.selectParticipant(data.participant);
                }
            } catch (error) {
                console.error('Error restoring form data:', error);
            } finally {
                sessionStorage.removeItem('paymentData');
            }
        }
    }

    showError(message) {
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 5000);
        }
    }
}

// Start application
document.addEventListener('DOMContentLoaded', () => {
    new App();
});