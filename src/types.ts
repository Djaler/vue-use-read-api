import { Ref } from '@vue/composition-api';

export interface UseListApi<T> {
    items: Ref<T[]>;
    itemsId: Ref<string | null>;
    loading: Ref<boolean>;
    update: () => void;
    error: Ref<unknown>;
}

export interface Pagination {
    page: number;
    rowsPerPage: number;
    sortBy: string[];
    descending: boolean[];
}

export interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
}

export interface SortOptions {
    sortBy: string[];
    sortDesc?: boolean[];
}

export interface UsePageApi<T, R extends number[]> {
    content: Ref<T[]>;
    contentId: Ref<string | null>;
    rowsPerPage: Ref<R[number]>;
    page: Ref<number>;
    sort: Ref<SortOptions>;
    totalItems: Ref<number>;
    totalPages: Ref<number>;
    loading: Ref<boolean>;
    update: () => void;
}
