import { nextTick, Ref, ref } from '@vue/composition-api';
import {
    afterEach, beforeEach, describe, expect, it, SpyInstanceFn, vitest,
} from 'vitest';

import { createPromiseMock, flushPromises, PromiseMock } from '../tests/mocks/promises';
import { mountComposition, MountResult } from '../tests/vue-composition-test-utils';
import { Page, Pagination, UsePageApi } from './types';
import { useFilteredPageApi } from './useFilteredPageApi';
import { emptyPage, pageFromList } from './utils';

describe('useFilteredPageApi', () => {
    let promiseMock: PromiseMock<Page<string>>;
    let readPage: SpyInstanceFn<[string, Pagination], Promise<Page<string>>>;
    let wrapper: MountResult<UsePageApi<string, any>>;
    let filter: Ref<string | undefined>;

    const defaultDebounce = 500;

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

        vitest.advanceTimersByTime(defaultDebounce);
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

        vitest.advanceTimersByTime(defaultDebounce);
        promiseMock.resolve(emptyPage());
        await flushPromises();

        expect(loading.value).toBe(false);
    });

    describe('after load', () => {
        beforeEach(async () => {
            vitest.advanceTimersByTime(defaultDebounce);
            promiseMock.resolve(pageFromList(['1', '2', '3']));
            await flushPromises();
        });

        it('should set content from loaded page', () => {
            const { content } = (wrapper.result.current)!;

            expect(content.value).toEqual(['1', '2', '3']);
        });

        it('should set total counts from loaded page', () => {
            const { totalItems, totalPages } = wrapper.result.current!;

            expect(totalItems.value).toBe(3);
            expect(totalPages.value).toBe(1);
        });

        it('should set contentId', () => {
            const { contentId } = wrapper.result.current!;

            expect(contentId.value).not.toBeNull();
        });

        function itShouldUpdateContentIdAfterPageLoad() {
            it('should update contentId after page load', async () => {
                const { contentId } = wrapper.result.current!;
                const oldValue = contentId.value;

                vitest.advanceTimersByTime(defaultDebounce);
                await flushPromises();

                expect(contentId.value).not.toBeNull();
                expect(contentId.value).not.toEqual(oldValue);
            });
        }

        describe('on update call', () => {
            beforeEach(() => {
                const { update } = (wrapper.result.current)!;

                readPage.mockResolvedValueOnce(emptyPage());

                update();
            });

            it('should reload page after debounce', () => {
                vitest.advanceTimersByTime(defaultDebounce);

                expect(readPage).toHaveBeenCalledWith('filter', {
                    page: 1,
                    rowsPerPage: 10,
                    sortBy: [],
                    descending: [],
                });
            });

            itShouldUpdateContentIdAfterPageLoad();
        });

        describe('on page change', () => {
            beforeEach(() => {
                const { page } = wrapper.result.current!;

                readPage.mockResolvedValueOnce(emptyPage());

                page.value = 2;
            });

            it('should reload page after debounce with new page', () => {
                vitest.advanceTimersByTime(defaultDebounce);

                expect(readPage).toHaveBeenCalledWith('filter', {
                    page: 2,
                    rowsPerPage: 10,
                    sortBy: [],
                    descending: [],
                });
            });

            itShouldUpdateContentIdAfterPageLoad();
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
                    vitest.advanceTimersByTime(defaultDebounce);

                    expect(readPage).toHaveBeenCalledWith('filter', {
                        page: 1,
                        rowsPerPage: 25,
                        sortBy: [],
                        descending: [],
                    });
                });

                itShouldUpdateContentIdAfterPageLoad();
            });

            describe('if was not on first page', () => {
                beforeEach(() => {
                    const { page, rowsPerPage } = wrapper.result.current!;

                    page.value = 2;
                    vitest.advanceTimersByTime(defaultDebounce);
                    readPage.mockClear();

                    rowsPerPage.value = 25;
                });

                it('should reload page after debounce with new rowsPerPage and on first page', () => {
                    vitest.advanceTimersByTime(defaultDebounce);

                    expect(readPage).toHaveBeenCalledWith('filter', {
                        page: 1,
                        rowsPerPage: 25,
                        sortBy: [],
                        descending: [],
                    });
                });

                itShouldUpdateContentIdAfterPageLoad();
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
                vitest.advanceTimersByTime(defaultDebounce);

                expect(readPage).toHaveBeenCalledWith('filter', {
                    page: 1,
                    rowsPerPage: 10,
                    sortBy: ['id'],
                    descending: [false],
                });
            });

            itShouldUpdateContentIdAfterPageLoad();
        });

        describe('on filter change', () => {
            beforeEach(() => {
                readPage.mockResolvedValueOnce(emptyPage());

                filter.value = 'filter2';
            });

            it('should reload page after debounce with new filter', () => {
                vitest.advanceTimersByTime(defaultDebounce);

                expect(readPage).toHaveBeenCalledWith('filter2', {
                    page: 1,
                    rowsPerPage: 10,
                    sortBy: [],
                    descending: [],
                });
            });

            itShouldUpdateContentIdAfterPageLoad();
        });
    });
});