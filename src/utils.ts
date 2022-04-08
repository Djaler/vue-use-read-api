import { Page } from './types';

export function emptyPage<T>(): Page<T> {
    return {
        totalElements: 0,
        totalPages: 0,
        content: [],
    };
}

export function pageFromList<T>(list: T[]): Page<T> {
    return {
        totalElements: list.length,
        totalPages: 1,
        content: list,
    };
}

export function asyncFunctionAsVoid<A extends unknown[], T>(fn: (...args: A) => Promise<T>): (...args: A) => void {
    return fn;
}
