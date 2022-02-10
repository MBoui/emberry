#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use tauri::{Manager, Window};
use tauri_plugin_shadows::Shadows;
use tokio_tungstenite::{connect_async, tungstenite::Message};
use futures_util::{StreamExt, SinkExt};

#[derive(Clone, serde::Serialize)]
struct Payload {
  message: String,
}

fn main() {
  // Tauri build setup:
  tauri::Builder::default()
    .setup(|app| {
      let window = app.get_window("main").unwrap();

      window.set_shadow(true);
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![web_connect])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[tauri::command]
async fn web_connect(window: Window, username: String) {
  println!("Connecting to signal server...");

  let (ws_stream, _) = connect_async("ws://84.30.14.3:25656").await.expect("Failed to connect");
  println!("WebSocket handshake has been successfully completed");

  let (mut write, read) = ws_stream.split();

  // Send a login request to the server.
  println!("username: {}", username);
  write.send(Message::text(format!("{{\"type\":\"login\",\"name\":\"{}\"}}", username))).await.unwrap();

  // Wait for messages to arrive.
  read.for_each(|message| async {
    let data = String::from_utf8(message.unwrap().into_data()).unwrap();
    window.emit_all("onmessage", Payload { message: data }).unwrap();
  }).await;
}