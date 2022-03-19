use std::sync::{Arc, Mutex};

use futures_util::SinkExt;
use serde_json::json;
use tokio::{net::{TcpStream, TcpListener}, io::{AsyncWriteExt, AsyncReadExt}};
use tokio_tungstenite::tungstenite::Message;

use crate::{SOCKET, ENV};

struct Session {
  stream: Arc<Mutex<TcpStream>>,
  id: String
}

static mut SESSIONS: Vec<Session> = Vec::new();

#[tauri::command]
pub async fn peer_request(peer_id: String) {
  println!("Sending peer request to {}", peer_id);

  let request_json = json!({
    "type": "request",
    "target": peer_id
  });

  unsafe {
    let mut socket = SOCKET.first().expect("Failed to get stream").lock().await;
    socket.send(Message::text(request_json.to_string())).await.expect("Failed to send request");
  }
}

#[tauri::command]
pub async fn offer_respond(offer_id: String, accepted: bool) {
  println!("Responding to offer {} with {}", offer_id, accepted);

  let response_json = json!({
    "type": "offer",
    "id": offer_id,
    "accept": accepted
  });

  unsafe {
    let mut socket = SOCKET.first().expect("Failed to get stream").lock().await;
    socket.send(Message::text(response_json.to_string())).await.expect("Failed to send request");
  }
}

#[tauri::command]
pub async fn init_session(offer_id: String) {
  // Load the server address from env.
  let addr;
  unsafe { addr = &ENV.server_address }

  // Create the session and add it to the sessions list:
  let session = TcpStream::connect(addr).await.expect("Session failed to connect to the server");

  let session_json = json!({
    "type": "session",
    "offer": offer_id,
    "port": session.local_addr().expect("Failed to get local session port").port()
  });

  unsafe { SESSIONS.push(Session { stream: Arc::new(Mutex::new(session)), id: offer_id.clone() }); }

  // Send the session info to the server.
  unsafe {
    let mut socket = SOCKET.first().expect("Failed to get stream").lock().await;
    socket.send(Message::text(session_json.to_string())).await.expect("Failed to send session");
  }

  println!("Initialized Session");
}

#[tauri::command]
pub async fn start_session(offer_id: String, addr: String) {
  let session;

  // Get the session that is linked to the offer:
  unsafe { 
    let idx = SESSIONS.iter().position(|s| s.id == offer_id);
    match idx {
        Some(idx) => {
          session = SESSIONS.get(idx).unwrap().stream.clone();
        },
        None => { panic!("Session was not found") }
    }
  }

  let session = session.lock().unwrap().local_addr().unwrap();

  let listener = TcpListener::bind(session).await.expect("Failed to bind session listener");

  tokio::spawn(async move {
    let (mut client, _) = listener.accept().await.expect("Failed to recieve session peer");
    
    let mut buf = [0u8; 512];
    client.read(&mut buf).await.expect("Failed to read session peer");

    println!("Recieved from peer: {}", String::from_utf8(buf.to_vec()).unwrap());
  });

  let mut stream = TcpStream::connect(addr).await.expect("Failed to connect session stream");

  stream.write("Hello Peer :D".as_bytes()).await.expect("Failed to write to session peer");

  println!("Punched the hole :D");
}