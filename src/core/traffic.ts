import * as store from '@/stores';

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
            if (json.success) {
                const users = json.users as Array<{ id: string, name: string }>;
                store.users.set(users);
            }
            break;

        case 'leave': // when a user leaves remove them from the users list.
            store.users.update(users => {
                return users.filter(user => user.id !== json.user.id);
            });
            break;

        case 'update-users': // when a user updates update them in the users list.
            store.users.update(users => {
                users.push(json.user);
                return users;
            });
            break;

        case 'chat': // when a message is send in global chat.
            store.globalChat.update(chat => {
                chat.push({ sender: json.sender, content: json.content });
                return chat;
            });
            console.log({ sender: json.sender, content: json.content });
            break;

        case 'error':
            console.error('webrtc threw an error:', json.message);
            break;

        default:
            break;
    }
}