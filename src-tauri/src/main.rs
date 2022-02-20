#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use std::env;
use std::sync::Arc;

#[macro_use]
extern crate dotenv_codegen;

use serde::Deserialize;
use tauri::{Manager, Window};
use tauri_plugin_shadows::Shadows;
use tokio::net::TcpStream;
use tokio_tungstenite::{connect_async, tungstenite::Message, WebSocketStream, MaybeTlsStream};
use futures_util::{StreamExt, SinkExt, lock::Mutex, stream::SplitSink};
extern crate base64;

#[derive(Clone, serde::Serialize)]
struct Payload {
  message: String,
}

#[derive(Deserialize, Debug)]
struct Config {
  server_address: String
}

static mut SOCKET: Vec<Arc<Mutex<SplitSink<WebSocketStream<MaybeTlsStream<TcpStream>>, Message>>>> = Vec::new();
static mut ENV: Config = Config { server_address: String::new() };

fn main() {
  // Setup the environment variables:
  unsafe {
    ENV = envy::from_iter([(String::from("SERVER_ADDRESS"), String::from(dotenv!("SERVER_ADDRESS")))]).unwrap();
  }

  // Tauri build setup:
  tauri::Builder::default()
    .setup(|app| {
      let window = app.get_window("main").unwrap();

      window.set_shadow(true);
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![web_connect, send_message, send_file])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[tauri::command]
async fn web_connect(window: Window, username: String) {
  println!("Connecting to signal server...");

  unsafe {
    // Load the server address from env.
    let addr = &ENV.server_address;

    let (ws_stream, _) = connect_async(addr).await.expect("Failed to connect");
    println!("WebSocket handshake has been successfully completed");

    let (mut write, read) = ws_stream.split();

    // Send a login request to the server.
    println!("username: {}", username);
    write.send(Message::text(format!("{{\"type\":\"login\",\"name\":\"{}\"}}", username))).await.unwrap();
    window.emit_all("onlogin", Payload { message: username }).unwrap();
    SOCKET.push(Arc::new(Mutex::new(write)));

    // Wait for messages to arrive.
    read.for_each(|message| async {
      let data = String::from_utf8(message.unwrap().into_data()).unwrap();
      window.emit_all("onmessage", Payload { message: data }).unwrap();
    }).await;
  }
}

#[tauri::command]
async fn send_message(data: String) {
  unsafe {
    let msg_data = format!("{{\"type\":\"chat\",\"content\":\"{}\"}}", data);
    let mut socket = SOCKET.first().expect("Can get write stream").lock().await;
    socket.send(Message::text(msg_data)).await.expect("Can send message");
  }
}

#[tauri::command]
async fn send_file(path: String) {

  println!("{}", path.clone());
  let file = std::fs::read(path.clone()).expect("Can load file");
  let name = std::path::Path::new(&path).file_name().unwrap().to_str().unwrap();

  unsafe {
    let msg_data = format!("{{\"type\":\"file\",\"name\":\"{}\",\"content\":\"{}\"}}", name, base64::encode(&file));
    let mut socket = SOCKET.first().expect("Can get write stream").lock().await;
    socket.send(Message::text(msg_data)).await.expect("Can send message");
  }
}