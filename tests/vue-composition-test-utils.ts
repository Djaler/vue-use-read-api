/**
 * https://github.com/ariesjia/vue-composition-test-utils with some changes
 * TODO: fork
 */
import { shallowMount, Wrapper } from '@vue/test-utils';
import Vue, { CreateElement } from 'vue';

type MountingOptions = Parameters<typeof shallowMount>[1] & {
    component?: any;
};

interface CompositionResult<R> {
    current?: R;
    error?: unknown;
}

export interface MountResult<R> extends Wrapper<Vue> {
    result: CompositionResult<R>;
}

export function mountComposition<R>(callback: () => R, options: MountingOptions = {}): MountResult<R> {
    let result: CompositionResult<R>;
    const { component = {}, ...other } = options;
    const Wrap = {
        render: (h: CreateElement) => h('div'),
        ...component,
        setup() {
            try {
                result = {
                    current: callback(),
                };
            } catch (e) {
                result = {
                    error: e,
                };
            }
            return {
                result,
            };
        },
    };

    const vueWrapper = shallowMount(Wrap, other);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return Object.assign(vueWrapper, { result });
}
