import { createPromiseMock, PromiseMock } from 'simple-promise-mock';
import {
    afterEach, beforeEach, describe, expect, it, SpyInstanceFn, vitest,
} from 'vitest';
import { nextTick, Ref, ref } from 'vue-demi';

import { flushPromises } from '../tests/mocks/promises';
import { mountComposition, MountResult } from '../tests/vue-composition-test-utils';
import { defaultDebounceTime } from './shared';
import { UseListApi } from './types';
import { useFilteredListApi } from './useFilteredListApi';

describe('useFilteredListApi', () => {
    let promiseMock: PromiseMock<string[]>;
    let readList: SpyInstanceFn<[string], Promise<string[]>>;
    let wrapper: MountResult<UseListApi<string>>;
    let filter: Ref<string | undefined>;

    beforeEach(() => {
        vitest.useFakeTimers();

        promiseMock = createPromiseMock();
        readList = vitest.fn();
        readList.mockReturnValueOnce(promiseMock);
        filter = ref('filter');

        wrapper = mountComposition(() => useFilteredListApi(readList, filter));
    });

    afterEach(() => {
        vitest.runOnlyPendingTimers();
    });

    describe('at start', () => {
        it('should enable loading flag', () => {
            expect(wrapper.result.current?.loading.value).toBe(true);
        });

        it('should set empty items', () => {
            expect(wrapper.result.current?.items.value).toHaveLength(0);
        });
    });

    it('should load list at start after debounce', async () => {
        expect(readList).not.toHaveBeenCalled();

        vitest.advanceTimersByTime(defaultDebounceTime);
        await nextTick();

        expect(readList).toHaveBeenCalledWith('filter');
    });

    describe('after load', () => {
        const result = ['foo', 'bar'];

        beforeEach(async () => {
            vitest.advanceTimersByTime(defaultDebounceTime);
            promiseMock.resolve(result);
            await flushPromises();
            await nextTick();
        });

        it('should disable loading flag', () => {
            expect(wrapper.result.current?.loading.value).toBe(false);
        });

        it('should set items', () => {
            expect(wrapper.result.current?.items.value).toEqual(result);
        });

        describe('if update called', () => {
            beforeEach(() => {
                const { update } = (wrapper.result.current)!;

                readList.mockClear();
                readList.mockResolvedValueOnce([]);
                update();
            });

            it('should reload data after debounce', () => {
                vitest.advanceTimersByTime(defaultDebounceTime);

                expect(readList).toHaveBeenCalledWith('filter');
            });
        });

        describe('on filter change', () => {
            beforeEach(() => {
                readList.mockResolvedValueOnce([]);

                filter.value = 'filter2';
            });

            it('should reload data after debounce with new filter', () => {
                vitest.advanceTimersByTime(defaultDebounceTime);

                expect(readList).toHaveBeenCalledWith('filter2');
            });
        });
    });

    describe('on error', () => {
        let error: Error;

        beforeEach(async () => {
            vitest.advanceTimersByTime(defaultDebounceTime);

            error = new Error();
            promiseMock.reject(error);
            await flushPromises();
            await nextTick();
        });

        it('should disable loading flag', () => {
            expect(wrapper.result.current?.loading.value).toBe(false);
        });

        it('should set error ref', () => {
            expect(wrapper.result.current?.error.value).toBe(error);
        });
    });
});
