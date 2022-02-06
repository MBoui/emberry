import { writable } from 'svelte/store';
import type { Client } from './core/client';

export const client = writable<Client>(undefined);
export const latest_msg = writable<String>('');