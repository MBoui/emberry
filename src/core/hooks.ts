import { listen } from '@tauri-apps/api/event'
import handleTraffic from './traffic';

/**
 * Initialises the frontend hooks into the backend events.
 */
export default function initHooks() {

    /** Called whenever the WebRTC client recieves a message. */
    listen('onmessage', ({ payload }) => {
        const msg = (payload as any).message;

        /* Handle the network traffic elsewhere. */
        handleTraffic(msg);
    });

}