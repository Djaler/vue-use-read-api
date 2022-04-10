import {
    beforeEach, describe, expect, it, SpyInstanceFn, vitest,
} from 'vitest';
import { nextTick } from 'vue-demi';

import { createPromiseMock, flushPromises, PromiseMock } from '../tests/mocks/promises';
import { mountComposition, MountResult } from '../tests/vue-composition-test-utils';
import { UseListApi } from './types';
import { useListApi } from './useListApi';

describe('useListApi', () => {
    let promiseMock: PromiseMock<string[]>;
    let readList: SpyInstanceFn<[], Promise<string[]>>;
    let wrapper: MountResult<UseListApi<string>>;

    beforeEach(() => {
        promiseMock = createPromiseMock();
        readList = vitest.fn();
        readList.mockReturnValueOnce(promiseMock);

        wrapper = mountComposition(() => useListApi(readList));
    });

    describe('at start', () => {
        it('should enable loading flag', () => {
            expect(wrapper.result.current?.loading.value).toBe(true);
        });

        it('should set empty items', () => {
            expect(wrapper.result.current?.items.value).toHaveLength(0);
        });
    });

    describe('after load', () => {
        const result = ['foo', 'bar'];

        beforeEach(async () => {
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
                readList.mockClear();

                readList.mockReturnValueOnce(createPromiseMock());
                wrapper.result.current!.update();
            });

            it('should load data again', () => {
                expect(readList).toHaveBeenCalled();
            });

            it('should enable loading flag', () => {
                expect(wrapper.result.current?.loading.value).toBe(true);
            });
        });
    });

    describe('on error', () => {
        let error: Error;

        beforeEach(async () => {
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
