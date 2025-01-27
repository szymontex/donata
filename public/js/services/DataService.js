export class DataService {
    constructor() {
        this.dataUrl = 'participants.json';
    }

    async loadParticipantsData() {
        try {
            const response = await fetch(this.dataUrl);
            if (!response.ok) {
                throw new Error('Failed to load participant data');
            }
            return await response.json();
        } catch (error) {
            console.error('Data service error:', error);
            throw error;
        }
    }
}