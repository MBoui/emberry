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
 * A log of the global chat.
 */
export const globalChat = writable<Array<{ type: string, sender: string, content: any }>>([]);