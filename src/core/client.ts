import { latest_msg } from '@/stores';

const SERVER_ADDRESS = 'ws://84.30.14.3:25656';

type OnConnectEvent = (self: Client) => void;

export class Client {
    ws: WebSocket;

    constructor(onconnect?: OnConnectEvent | undefined) {
        this.ws = new WebSocket(SERVER_ADDRESS);

        this.ws.onopen = () => this.onOpen(onconnect);
        this.ws.onclose = this.onClose;
        this.ws.onmessage = this.onMessage;
        this.ws.onerror = (err) => console.error('websocket threw an error:', err);
    }

    onOpen(onconnect?: OnConnectEvent | undefined) {
        console.log('websocket connected');
        onconnect(this);
    }

    onClose(ev: CloseEvent) {
        console.error(`websocket disconnected:`, ev.reason);
    }

    onMessage(data: MessageEvent<String>) {
        const msg = JSON.parse(data.data as string).message;
        console.log('websocket recieved:', msg);
        latest_msg.set(msg);
    }
}