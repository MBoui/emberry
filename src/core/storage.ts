import * as store from "@/stores";

export default function initStorage() {

    // Save the username into local storage.
    if (sessionStorage.getItem("username") != null && sessionStorage.getItem("username") != 'null')
		store.user.set({ id: '...', name: sessionStorage.getItem("username") });
    else store.user.set(null);
	store.user.subscribe(user => sessionStorage.setItem("username", (user ? user.name : null)));

    // Save the global chat into local storage.
    if (localStorage.getItem("globalchat") != null && localStorage.getItem("globalchat") != 'null')
		store.globalChat.set(JSON.parse(localStorage.getItem("globalchat")));
    else store.globalChat.set([]);
	store.globalChat.subscribe(chat => localStorage.setItem("globalchat", (chat ? JSON.stringify(chat) : null)));

}