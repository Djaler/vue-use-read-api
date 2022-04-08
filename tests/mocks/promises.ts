import { setImmediate } from 'timers';

export interface PromiseMock<T> extends Promise<T> {
    resolve(value: T): void;

    reject(reason?: any): void;
}

export function createPromiseMock<T>(): PromiseMock<T> {
    /* eslint-disable @typescript-eslint/no-empty-function */
    let resolvePromise: (value: (T | PromiseLike<T>)) => void = () => {
    };
    let rejectPromise = () => {
    };
    /* eslint-enable @typescript-eslint/no-empty-function */

    const promise: Partial<PromiseMock<T>> = new Promise<T>((resolve, reject) => {
        resolvePromise = resolve;
        rejectPromise = reject;
    });

    promise.resolve = resolvePromise;
    promise.reject = rejectPromise;

    return promise as PromiseMock<T>;
}

export function flushPromises(): Promise<void> {
    return new Promise((resolve) => {
        setImmediate(resolve);
    });
}
