#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use std::env;
use dotenv::dotenv;
use std::sync::Arc;

use tauri::{Manager, Window};
use tauri_plugin_shadows::Shadows;
use tokio::net::TcpStream;
use tokio_tungstenite::{connect_async, tungstenite::Message, WebSocketStream, MaybeTlsStream};
use futures_util::{StreamExt, SinkExt, lock::Mutex, stream::SplitSink};

#[derive(Clone, serde::Serialize)]
struct Payload {
  message: String,
}

static mut SOCKET: Vec<Arc<Mutex<SplitSink<WebSocketStream<MaybeTlsStream<TcpStream>>, Message>>>> = Vec::new();

fn main() {
  dotenv().ok();

  // Tauri build setup:
  tauri::Builder::default()
    .setup(|app| {
      let window = app.get_window("main").unwrap();

      window.set_shadow(true);
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![web_connect, send_message])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[tauri::command]
async fn web_connect(window: Window, username: String) {
  println!("Connecting to signal server...");

  let addr = env::var("SERVER_ADDRESS").expect("Can load server address from .env");
  let (ws_stream, _) = connect_async(addr).await.expect("Failed to connect");
  println!("WebSocket handshake has been successfully completed");

  let (mut write, read) = ws_stream.split();

  // Send a login request to the server.
  println!("username: {}", username);
  write.send(Message::text(format!("{{\"type\":\"login\",\"name\":\"{}\"}}", username))).await.unwrap();
  window.emit_all("onlogin", Payload { message: username }).unwrap();
  unsafe {
    SOCKET.push(Arc::new(Mutex::new(write)));
  }

  // Wait for messages to arrive.
  read.for_each(|message| async {
    let data = String::from_utf8(message.unwrap().into_data()).unwrap();
    window.emit_all("onmessage", Payload { message: data }).unwrap();
  }).await;
}

#[tauri::command]
async fn send_message(data: String) {
  unsafe {
    let msg_data = format!("{{\"type\":\"chat\",\"content\":\"{}\"}}", data);
    let mut socket = SOCKET.first().expect("Can get write stream").lock().await;
    socket.send(Message::text(msg_data)).await.expect("Can send message");
  }
}