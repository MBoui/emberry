import { writable } from 'svelte/store';

/**
 * List of all online users.
 */
export const users = writable<Array<{ id: string, name: string }>>([]);

/**
 * The currently active/open chat id.
 */
export const activeChat = writable<string>("");