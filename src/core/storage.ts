import * as store from "@/stores";

export default function initStorage() {

  // Save the username into session storage.
  if (sessionStorage.getItem("username") != null && sessionStorage.getItem("username") != 'null')
	  store.user.set({ id: '...', name: sessionStorage.getItem("username") });
  else store.user.set(null);
	store.user.subscribe(user => sessionStorage.setItem("username", (user ? user.name : null)));

  // Save the offers into session storage.
  if (sessionStorage.getItem("offers") != null && sessionStorage.getItem("offers") != 'null')
	  store.offers.set(JSON.parse(sessionStorage.getItem("offers")));
  else store.offers.set([]);
	store.offers.subscribe(offers => sessionStorage.setItem("offers", JSON.stringify(offers)));

  // Save the user list into session storage.
  if (sessionStorage.getItem("users") != null && sessionStorage.getItem("users") != 'null')
	  store.users.set(JSON.parse(sessionStorage.getItem("users")));
  else store.users.set([]);
	store.users.subscribe(users => sessionStorage.setItem("users", JSON.stringify(users)));

  // Save the global chat into local storage.
  if (localStorage.getItem("globalchat") != null && localStorage.getItem("globalchat") != 'null')
		store.globalChat.set(JSON.parse(localStorage.getItem("globalchat")));
  else store.globalChat.set([]);
	store.globalChat.subscribe(chat => localStorage.setItem("globalchat", (chat ? JSON.stringify(chat) : null)));
}