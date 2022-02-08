import { writable } from 'svelte/store';

export const latest_msg = writable<String>('');
export const users = writable<Array<{ id: string, name: string }>>([]);