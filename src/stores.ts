import { writable } from 'svelte/store';

/**
 * The user that has logged in (null if not logged in)
 */
export const user = writable<{ id: string, name: string }>(null);

/**
 * List of all online users.
 */
export const users = writable<Array<{ id: string, name: string }>>([]);

/**
 * The currently active/open chat id.
 */
export const activeChat = writable<string>("");