export class PaymentForm {
    constructor(formElement, onSubmit) {
        this.form = formElement;
        this.onSubmit = onSubmit;
        this.isSubmitting = false;
        
        this.elements = {
            amount: this.form.querySelector('#amount'),
            nickname: this.form.querySelector('#nickname'),
            message: this.form.querySelector('#message'),
            submit: this.form.querySelector('#submit-button')
        };

        this.bindEvents();
    }

    bindEvents() {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        this.elements.amount.addEventListener('input', this.validateAmount.bind(this));
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.isSubmitting) return;

        try {
            this.isSubmitting = true;
            this.setSubmitButtonState('loading');

            const formData = this.getFormData();
            
            if (!this.validateForm(formData)) {
                return;
            }

            await this.onSubmit(formData);
            
        } catch (error) {
            console.error('Form submission error:', error);
            throw error;
        } finally {
            this.isSubmitting = false;
            this.setSubmitButtonState('default');
        }
    }

    getFormData() {
        return {
            amount: Number(this.elements.amount.value),
            nickname: this.elements.nickname.value.trim(),
            message: this.elements.message.value.trim()
        };
    }

    validateForm(data) {
        if (!data.nickname) {
            this.showError('Please enter your nickname!');
            this.elements.nickname.focus();
            return false;
        }
    
        if (!data.amount || data.amount < 5) {
            this.showError('Minimum amount is 5!');
            this.elements.amount.focus();
            return false;
        }
    
        return true;
    }
    
    validateAmount() {
        const amount = Number(this.elements.amount.value);
        if (amount < 5) {
            this.elements.amount.setCustomValidity('Minimum amount is 5');
        } else {
            this.elements.amount.setCustomValidity('');
        }
    }

    setAmount(amount) {
        this.elements.amount.value = amount;
        this.validateAmount();
    }

    restore(data) {
        if (data.amount) this.elements.amount.value = data.amount;
        if (data.nickname) this.elements.nickname.value = data.nickname;
        if (data.message) this.elements.message.value = data.message;
    }

    setSubmitButtonState(state) {
        const button = this.elements.submit;
        switch (state) {
            case 'loading':
                button.disabled = true;
                button.textContent = 'Processing...';
                break;
            case 'default':
            default:
                button.disabled = false;
                button.textContent = 'Support';
                break;
        }
    }

    showError(message) {
        const errorEvent = new CustomEvent('payment-error', {
            detail: { message }
        });
        this.form.dispatchEvent(errorEvent);
    }
}