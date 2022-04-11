import { useDebounceFn } from '@vueuse/core';
import { ref, watch } from 'vue-demi';

import { defaultDebounceTime } from './shared';
import { Page, Pagination, UsePageApi, UsePageApiOptions } from './types';
import { usePageConsumer, usePagination } from './usePagination';
import { asyncFunctionAsVoid } from './utils';

export type ReadPage<T> = (pagination: Pagination) => Promise<Page<T>>;

export function usePageApi<T>(
    readPage: ReadPage<T>,
    options?: UsePageApiOptions,
): UsePageApi<T> {
    const debounceTime = options?.debounceMs ?? defaultDebounceTime;

    const {
        currentPage,
        rowsPerPage,
        sort,
        pagination,
    } = usePagination(options?.rowsPerPageVariants);

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

    const debouncedLoad = useDebounceFn(asyncFunctionAsVoid(load), debounceTime);

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
        error,
    };
}
