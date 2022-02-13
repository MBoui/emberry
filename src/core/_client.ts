import * as store from '@/stores';

const SERVER_ADDRESS = 'wss://84.30.14.3:25656';

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

    login(name: string) {
        this.ws.send(`{"type":"login","name":"${name}"}`);
    }

    onOpen(onconnect?: OnConnectEvent | undefined) {
        console.log('websocket connected');
        onconnect(this);
    }

    onClose(ev: CloseEvent) {
        console.error(`websocket disconnected:`, ev.reason);
    }

    onMessage(data: MessageEvent<String>) {
        const json = JSON.parse(data.data as string);
        console.log('websocket recieved:', json);

        switch (json.type as string) {
            case 'login': // when a login is accepted we check if it was succesful.
                if (json.success) {
                    const users = json.users as Array<{ id: string, name: string }>;
                    store.users.set(users);
                }
                break;

            case 'update-users':
                store.users.update(users => {
                    users.push(json.user);
                    return users;
                });
            break;

            case 'error':
                console.error('webrtc threw an error:', json.message);
            break;
        
            default:
                break;
        }
    }
}