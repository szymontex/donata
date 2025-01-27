export class PaymentService {
    constructor() {
        this.apiUrl = '/api/create-payment';
    }

    async createPayment(paymentData) {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(paymentData),
                credentials: 'same-origin'
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Error processing payment');
            }

            return await response.json();
        } catch (error) {
            console.error('Payment service error:', error);
            throw error;
        }
    }
}