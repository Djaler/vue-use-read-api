import { nanoid } from 'nanoid';
import { computed, Ref, ref, watch } from 'vue-demi';

import { defaultRowsPerPage } from './shared';
import { Page, Pagination } from './types';

export function usePagination(rowsPerPageVariants?: number[]) {
    const currentPage = ref(1);
    const rowsPerPage = ref(rowsPerPageVariants?.[0] ?? defaultRowsPerPage);

    watch(rowsPerPage, () => {
        currentPage.value = 1;
    });

    const sort = ref({
        sortBy: [] as string[],
        sortDesc: [] as boolean[],
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
    const content: Ref<T[]> = ref([]);
    const contentId = ref<string | null>(null);
    const totalItems = ref(0);
    const totalPages = ref(0);

    function consume(page: Page<T>) {
        totalItems.value = page.totalElements;
        totalPages.value = page.totalPages;
        content.value = page.content;
        contentId.value = nanoid();
    }

    return {
        content,
        contentId,
        totalItems,
        totalPages,
        consume,
    };
}
