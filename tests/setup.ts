import VueCompositionApi from '@vue/composition-api';
import { afterEach, vitest } from 'vitest';
import Vue from 'vue';

Vue.use(VueCompositionApi);

afterEach(() => {
    vitest.useRealTimers();
});
