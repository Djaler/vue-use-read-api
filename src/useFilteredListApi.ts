import { useDebounceFn } from '@vueuse/core';
import { nanoid } from 'nanoid';
import { Ref, ref, watch } from 'vue-demi';

import { defaultDebounceTime } from './shared';
import { UseFilteredListApiOptions, UseListApi } from './types';
import { asyncFunctionAsVoid } from './utils';

export type ReadFilteredList<T, F> = (filter: F) => Promise<T[]>;

export function useFilteredListApi<T, F>(
    readList: ReadFilteredList<T, F>,
    filterRef: Ref<F | undefined>,
    options?: UseFilteredListApiOptions,
): UseListApi<T> {
    const debounceTime = options?.debounceMs ?? defaultDebounceTime;

    const loading = ref(false);
    const items: Ref<T[]> = ref([]);
    const itemsId = ref<string | null>(null);
    const error = ref<unknown>(null);

    async function load(filter: F) {
        try {
            items.value = await readList(filter);
            itemsId.value = nanoid();
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

    watch(filterRef, update, { immediate: true });

    return {
        items,
        itemsId,
        loading,
        error,
        update,
    };
}
