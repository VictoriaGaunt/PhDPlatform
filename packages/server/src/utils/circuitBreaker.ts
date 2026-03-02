interface CircuitBreakerOptions {
    failureThreshold?: number;
    resetTimeoutMs?: number;
    executionTimeoutMs?: number;
}

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export class CircuitBreaker {
    private failureCount = 0;
    private state: CircuitState = 'CLOSED';
    private openedAt = 0;

    constructor(private readonly options: CircuitBreakerOptions = {}) {}

    async execute<T>(operation: () => Promise<T>): Promise<T> {
        if (this.state === 'OPEN') {
            const elapsed = Date.now() - this.openedAt;
            if (elapsed < (this.options.resetTimeoutMs ?? 10_000)) {
                throw new Error('Circuit is open');
            }
            this.state = 'HALF_OPEN';
        }

        try {
            const result = await this.withTimeout(operation);
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    getState(): CircuitState {
        return this.state;
    }

    private onSuccess() {
        this.failureCount = 0;
        this.state = 'CLOSED';
    }

    private onFailure() {
        this.failureCount += 1;
        const threshold = this.options.failureThreshold ?? 5;
        if (this.failureCount >= threshold) {
            this.state = 'OPEN';
            this.openedAt = Date.now();
        }
    }

    private async withTimeout<T>(operation: () => Promise<T>): Promise<T> {
        const executionTimeoutMs = this.options.executionTimeoutMs ?? 4_000;

        return Promise.race([
            operation(),
            new Promise<T>((_, reject) => {
                setTimeout(() => reject(new Error('Circuit operation timeout')), executionTimeoutMs);
            })
        ]);
    }
}
