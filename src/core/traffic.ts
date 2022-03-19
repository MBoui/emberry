import * as store from '@/stores';
import { invoke } from '@tauri-apps/api';

/**
 * Handles the incoming traffic from the WebRTC server.
 * @param message A message recieved from the WebRTC server.
 */
export default function handleTraffic(message: string) {
    console.log(message);
    const json = JSON.parse(message);
    console.log('websocket recieved:', json);

    switch (json.type as string) {
        case 'login': // when a login is accepted we check if it was succesful.
            const users = json.users as Array<{ id: string, name: string }>;
            store.users.set(users);
            break;

        case 'leave': // when a user leaves remove them from the users list.
            store.users.update(users => {
                return users.filter(user => user.id !== json.user.id);
            });
            break;

        case 'join': // when a user joins add them to the users list.
            store.users.update(users => {
                users.push(json.user);
                return users;
            });
            break;

        case 'chat': // when a message is send in global chat.
            store.globalChat.update(chat => {
                chat.push({ type: 'msg', sender: json.sender.name, content: json.content });
                return chat;
            });
            console.log({ sender: json.sender.name, content: json.content });
            break;

        case 'file': // when a file is send in global chat.
            store.globalChat.update(chat => {
                chat.push({ type: 'file', sender: json.sender.name, content: { name: json.name, data: json.content } });
                return chat;
            });
            console.log({ sender: json.sender.name, name: json.name, content: json.content });
            break;

        case 'offer': // when an offer is recieved.
            store.offers.update(offers => {
                offers.push({ origin: json.origin, id: json.id });
                return offers;
            });
            break;

        case 'confirm': // when a confirmation is recieved.
            store.offers.update(offers => {
                return offers.filter(offer => offer.id !== json.offer);
            });
            console.log("confirm recieved: " + json);
            if (json.accept == true) {
                console.log("init session");
                invoke('init_session', { offerId: json.offer })
            }
            break;

        case 'peer': // when a peer is recieved.
            invoke('start_session', { offerId: json.offer, addr: json.addr })
            break;

        case 'error':
            console.error('webrtc threw an error:', json.message);
            break;

        default:
            break;
    }
}