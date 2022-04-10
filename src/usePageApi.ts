import { useDebounceFn } from '@vueuse/core';
import { ref, watch } from 'vue-demi';

import { Page, Pagination, UsePageApi } from './types';
import { usePageConsumer, usePagination } from './usePagination';
import { asyncFunctionAsVoid } from './utils';

export type ReadPage<T> = (pagination: Pagination) => Promise<Page<T>>;

export function usePageApi<T, R extends number[]>(
    readPage: ReadPage<T>,
    debounceMs = 500,
): UsePageApi<T, R> {
    const {
        currentPage,
        rowsPerPage,
        sort,
        pagination,
    } = usePagination([10, 25, 50]);

    const { consume: consumePage, content, contentId, totalItems, totalPages } = usePageConsumer<T>();

    const loading = ref(false);
    const error = ref<unknown>(null);

    async function load() {
        try {
            const page = await readPage(pagination.value);
            consumePage(page);
        } catch (e) {
            error.value = e;
        } finally {
            loading.value = false;
        }
    }

    const debouncedLoad = useDebounceFn(asyncFunctionAsVoid(load), debounceMs);

    function update() {
        loading.value = true;
        debouncedLoad();
    }

    watch(pagination, update, { immediate: true });

    return {
        content,
        contentId,
        rowsPerPage,
        page: currentPage,
        sort,
        totalItems,
        totalPages,
        loading,
        update,
    };
}
