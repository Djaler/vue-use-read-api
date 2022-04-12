import { createPromiseMock, PromiseMock } from 'simple-promise-mock';
import {
    afterEach, beforeEach, describe, expect, it, SpyInstanceFn, vitest,
} from 'vitest';
import { nextTick, Ref, ref } from 'vue-demi';

import { flushPromises } from '../tests/mocks/promises';
import { mountComposition, MountResult } from '../tests/vue-composition-test-utils';
import { defaultDebounceTime } from './shared';
import { Page, Pagination, UsePageApi } from './types';
import { useFilteredPageApi } from './useFilteredPageApi';
import { emptyPage, pageFromList } from './utils';

describe('useFilteredPageApi', () => {
    let promiseMock: PromiseMock<Page<string>>;
    let readPage: SpyInstanceFn<[string, Pagination], Promise<Page<string>>>;
    let wrapper: MountResult<UsePageApi<string>>;
    let filter: Ref<string | undefined>;

    beforeEach(() => {
        vitest.useFakeTimers();

        promiseMock = createPromiseMock();
        readPage = vitest.fn();
        readPage.mockReturnValueOnce(promiseMock);
        filter = ref('filter');

        wrapper = mountComposition(() => useFilteredPageApi(readPage, filter));
    });

    afterEach(() => {
        vitest.runOnlyPendingTimers();
    });

    it('should load page at start after debounce', async () => {
        expect(readPage).not.toHaveBeenCalled();

        vitest.advanceTimersByTime(defaultDebounceTime);
        await nextTick();

        expect(readPage).toHaveBeenCalledWith('filter', {
            page: 1,
            rowsPerPage: 10,
            sortBy: [],
            descending: [],
        });
    });

    it('should toggle loading flag while loading', async () => {
        const { loading } = wrapper.result.current!;

        expect(loading.value).toBe(true);

        vitest.advanceTimersByTime(defaultDebounceTime);
        promiseMock.resolve(emptyPage());
        await flushPromises();

        expect(loading.value).toBe(false);
    });

    describe('after load', () => {
        beforeEach(async () => {
            vitest.advanceTimersByTime(defaultDebounceTime);
            promiseMock.resolve(pageFromList(['1', '2', '3']));
            await flushPromises();
        });

        it('should set items from loaded page', () => {
            const { items } = (wrapper.result.current)!;

            expect(items.value).toEqual(['1', '2', '3']);
        });

        it('should set total counts from loaded page', () => {
            const { totalItems, totalPages } = wrapper.result.current!;

            expect(totalItems.value).toBe(3);
            expect(totalPages.value).toBe(1);
        });

        it('should set itemsId', () => {
            const { itemsId } = wrapper.result.current!;

            expect(itemsId.value).not.toBeNull();
        });

        function itShouldUpdateItemsIdAfterPageLoad() {
            it('should update itemsId after page load', async () => {
                const { itemsId } = wrapper.result.current!;
                const oldValue = itemsId.value;

                vitest.advanceTimersByTime(defaultDebounceTime);
                await flushPromises();

                expect(itemsId.value).not.toBeNull();
                expect(itemsId.value).not.toEqual(oldValue);
            });
        }

        describe('on update call', () => {
            beforeEach(() => {
                const { update } = (wrapper.result.current)!;

                readPage.mockResolvedValueOnce(emptyPage());

                update();
            });

            it('should reload page after debounce', () => {
                vitest.advanceTimersByTime(defaultDebounceTime);

                expect(readPage).toHaveBeenCalledWith('filter', {
                    page: 1,
                    rowsPerPage: 10,
                    sortBy: [],
                    descending: [],
                });
            });

            itShouldUpdateItemsIdAfterPageLoad();
        });

        describe('on page change', () => {
            beforeEach(() => {
                const { page } = wrapper.result.current!;

                readPage.mockResolvedValueOnce(emptyPage());

                page.value = 2;
            });

            it('should reload page after debounce with new page', () => {
                vitest.advanceTimersByTime(defaultDebounceTime);

                expect(readPage).toHaveBeenCalledWith('filter', {
                    page: 2,
                    rowsPerPage: 10,
                    sortBy: [],
                    descending: [],
                });
            });

            itShouldUpdateItemsIdAfterPageLoad();
        });

        describe('on rows per page change', () => {
            beforeEach(() => {
                readPage.mockResolvedValueOnce(emptyPage());
            });

            describe('if was on first page', () => {
                beforeEach(() => {
                    const { rowsPerPage } = wrapper.result.current!;

                    rowsPerPage.value = 25;
                });

                it('should reload page after debounce with new rowsPerPage', () => {
                    vitest.advanceTimersByTime(defaultDebounceTime);

                    expect(readPage).toHaveBeenCalledWith('filter', {
                        page: 1,
                        rowsPerPage: 25,
                        sortBy: [],
                        descending: [],
                    });
                });

                itShouldUpdateItemsIdAfterPageLoad();
            });

            describe('if was not on first page', () => {
                beforeEach(() => {
                    const { page, rowsPerPage } = wrapper.result.current!;

                    page.value = 2;
                    vitest.advanceTimersByTime(defaultDebounceTime);
                    readPage.mockClear();

                    rowsPerPage.value = 25;
                });

                it('should reload page after debounce with new rowsPerPage and on first page', () => {
                    vitest.advanceTimersByTime(defaultDebounceTime);

                    expect(readPage).toHaveBeenCalledWith('filter', {
                        page: 1,
                        rowsPerPage: 25,
                        sortBy: [],
                        descending: [],
                    });
                });

                itShouldUpdateItemsIdAfterPageLoad();
            });
        });

        describe('on sort change', () => {
            beforeEach(() => {
                const { sort } = wrapper.result.current!;

                readPage.mockResolvedValueOnce(emptyPage());

                sort.value = {
                    sortBy: ['id'],
                    sortDesc: [false],
                };
            });

            it('should reload page after debounce with new sort', () => {
                vitest.advanceTimersByTime(defaultDebounceTime);

                expect(readPage).toHaveBeenCalledWith('filter', {
                    page: 1,
                    rowsPerPage: 10,
                    sortBy: ['id'],
                    descending: [false],
                });
            });

            itShouldUpdateItemsIdAfterPageLoad();
        });

        describe('on filter change', () => {
            beforeEach(() => {
                readPage.mockResolvedValueOnce(emptyPage());

                filter.value = 'filter2';
            });

            it('should reload page after debounce with new filter', () => {
                vitest.advanceTimersByTime(defaultDebounceTime);

                expect(readPage).toHaveBeenCalledWith('filter2', {
                    page: 1,
                    rowsPerPage: 10,
                    sortBy: [],
                    descending: [],
                });
            });

            itShouldUpdateItemsIdAfterPageLoad();
        });
    });

    describe('on error', () => {
        let error: Error;

        beforeEach(async () => {
            error = new Error();
            vitest.advanceTimersByTime(defaultDebounceTime);
            promiseMock.reject(error);
            await flushPromises();
        });

        it('should disable loading flag', () => {
            expect(wrapper.result.current?.loading.value).toBe(false);
        });

        it('should set error ref', () => {
            expect(wrapper.result.current?.error.value).toBe(error);
        });
    });
});
