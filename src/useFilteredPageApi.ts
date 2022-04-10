import { useDebounceFn } from '@vueuse/core';
import { Ref, ref, watch } from 'vue-demi';

import { defaultDebounceTime } from './shared';
import { Page, Pagination, UsePageApi, UsePageApiOptions } from './types';
import { usePageConsumer, usePagination } from './usePagination';
import { asyncFunctionAsVoid } from './utils';

export type ReadFilteredPage<T, F> = (filter: F, pagination: Pagination) => Promise<Page<T>>;

export function useFilteredPageApi<T, F, R extends number[]>(
    readPage: ReadFilteredPage<T, F>,
    filterRef: Ref<F | undefined>,
    options?: UsePageApiOptions,
): UsePageApi<T, R> {
    const debounceTime = options?.debounceMs ?? defaultDebounceTime;

    const {
        currentPage,
        rowsPerPage,
        sort,
        pagination,
    } = usePagination([10, 25, 50]);

    const { consume: consumePage, content, contentId, totalItems, totalPages } = usePageConsumer<T>();

    const loading = ref(false);
    const error = ref<unknown>(null);

    async function load(filter: F) {
        try {
            const page = await readPage(filter, pagination.value);
            consumePage(page);
        } catch (e) {
            error.value = e;
        } finally {
            loading.value = false;
        }
    }

    const debouncedLoad = useDebounceFn(asyncFunctionAsVoid(load), debounceTime);

    function update() {
        if (filterRef.value === undefined) {
            return;
        }

        loading.value = true;
        debouncedLoad(filterRef.value);
    }

    watch(filterRef, () => {
        if (currentPage.value !== 1) {
            currentPage.value = 1;
        } else {
            update();
        }
    });

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
