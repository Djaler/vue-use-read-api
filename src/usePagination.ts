import { nanoid } from 'nanoid';
import { computed, Ref, ref, watch } from 'vue-demi';

import { defaultRowsPerPage } from './shared';
import { Page, Pagination, SortOptions } from './types';

export function usePagination(rowsPerPageVariants?: number[]) {
    const currentPage = ref(1);
    const rowsPerPage = ref(rowsPerPageVariants?.[0] ?? defaultRowsPerPage);

    watch(rowsPerPage, () => {
        currentPage.value = 1;
    });

    const sort = ref<SortOptions>({
        sortBy: [],
        sortDesc: [],
    });

    const pagination = computed((): Pagination => ({
        page: currentPage.value,
        rowsPerPage: rowsPerPage.value,
        sortBy: sort.value.sortBy,
        descending: sort.value.sortDesc,
    }));

    return {
        currentPage,
        rowsPerPage,
        sort,
        pagination,
    };
}

export function usePageConsumer<T>() {
    const items: Ref<T[]> = ref([]);
    const itemsId = ref<string | null>(null);
    const totalItems = ref(0);
    const totalPages = ref(0);

    function consume(page: Page<T>) {
        totalItems.value = page.totalElements;
        totalPages.value = page.totalPages;
        items.value = page.content;
        itemsId.value = nanoid();
    }

    return {
        items,
        itemsId,
        totalItems,
        totalPages,
        consume,
    };
}
