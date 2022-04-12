[![npm](https://img.shields.io/npm/v/vue-use-read-api?style=for-the-badge)](https://www.npmjs.com/package/vue-use-read-api)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/vue-use-read-api?style=for-the-badge)](https://bundlephobia.com/result?p=vue-use-read-api)

# vue-use-read-api

> Vue composable functions to automate loading list and paginated data from the API.

## Install

```sh
npm install --save vue-use-read-api
```
or
```sh
yarn add vue-use-read-api
```
or
```sh
pnpm install vue-use-read-api
```

## Usage

### List API
```ts
import axios from 'axios';
import { defineComponent } from 'vue';
import { useListApi } from 'vue-use-read-api';

async function loadUsers(): Promise<User[]> {
  const { data } = await axios.get('/api/users');
  return data;
}

export default defineComponent({
    setup() {
        const { 
            items,
            loading,
            error,
            update,
        } = useListApi(loadUsers);
        
        return {
            items,
            loading,
            error,
            update,
        }
    }
})
```

### Filtered List API

```ts
import axios from 'axios';
import { defineComponent, ref } from 'vue';
import { useFilteredListApi } from 'vue-use-read-api';

async function loadUsers(search: string): Promise<User[]> {
    const { data } = await axios.get('/api/users?search=' + search);
    return data;
}

export default defineComponent({
    setup() {
        const filter = ref<string | undefined>();

        const {
            items,
            loading,
            error,
            update,
        } = useFilteredListApi(loadUsers, filter);

        return {
            items,
            loading,
            error,
            update,
        }
    }
})
```

### Page API

```ts
import axios from 'axios';
import { defineComponent } from 'vue';
import { usePageApi, Page, Pagination } from 'vue-use-read-api';

async function loadUsersPage(pagination: Pagination): Promise<Page<User>> {
    const { data } = await axios.get('/api/users', {
        params: {
            page: pagination.page,
            perPage: pagination.rowsPerPage,
        }
    });
    return data;
}

export default defineComponent({
    setup() {
        const {
            items,
            page,
            loading,
            error,
            update,
        } = usePageApi(loadUsersPage);

        function next() {
            page.value++;
        }
        
        function prev() {
            page.value--;
        }
        
        return {
            items,
            loading,
            error,
            update,
            next,
            prev,
        }
    }
})
```

### Filtered Page API

```ts
import axios from 'axios';
import { defineComponent, ref } from 'vue';
import { useFilteredPageApi, Page, Pagination } from 'vue-use-read-api';

async function loadUsersPage(search: string, pagination: Pagination): Promise<Page<User>> {
    const { data } = await axios.get('/api/users?search='+search, {
        params: {
            page: pagination.page,
            perPage: pagination.rowsPerPage,
        }
    });
    return data;
}

export default defineComponent({
    setup() {
        const filter = ref<string | undefined>();
        
        const {
            items,
            page,
            loading,
            error,
            update,
        } = useFilteredPageApi(loadUsersPage, filter);

        function next() {
            page.value++;
        }
        
        function prev() {
            page.value--;
        }
        
        return {
            items,
            loading,
            error,
            update,
            next,
            prev,
        }
    }
})
```
