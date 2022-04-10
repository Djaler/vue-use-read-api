import { nanoid } from 'nanoid';
import { Ref, ref } from 'vue-demi';

import { UseListApi } from './types';

export type ReadList<T> = () => Promise<T[]>;

export function useListApi<T>(readList: ReadList<T>): UseListApi<T> {
    const loading = ref(false);
    const items: Ref<T[]> = ref([]);
    const itemsId = ref<string | null>(null);
    const error = ref<unknown>(null);

    async function load() {
        loading.value = true;

        try {
            items.value = await readList();
            itemsId.value = nanoid();
        } catch (e) {
            error.value = e;
        } finally {
            loading.value = false;
        }
    }

    void load();

    return {
        items,
        itemsId,
        loading,
        error,
        update: load,
    };
}
