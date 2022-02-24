use std::{sync::Arc, time::Duration};

use futures_util::SinkExt;
use tokio_tungstenite::tungstenite::Message;
use webrtc::{
  api::{
    interceptor_registry::register_default_interceptors, media_engine::MediaEngine, APIBuilder,
  },
  data_channel::{data_channel_init::RTCDataChannelInit, RTCDataChannel},
  ice_transport::{ice_connection_state::RTCIceConnectionState, ice_server::RTCIceServer},
  interceptor::registry::Registry,
  peer_connection::{
    configuration::RTCConfiguration, offer_answer_options::RTCOfferOptions,
    sdp::session_description::RTCSessionDescription, RTCPeerConnection,
  },
};

use crate::SOCKET;

#[tauri::command]
pub async fn peer_request(peer_id: String) {
  println!("Sending peer request to {}", peer_id);

  initiate_connection(peer_id).await;
}

/**
 * Initiate a RTC peer connection with another peer on the network.
 */
async fn initiate_connection(peer_id: String) {
  let pc = create_peer_connection().await;

  // Create a config for the ICE offer:
  let offer_config = RTCOfferOptions {
    ice_restart: false,
    ..Default::default()
  };

  let offer = pc
    .create_offer(Some(offer_config))
    .await
    .expect("Can create ICE offer");

  println!("Created ICE Offer: {:?}", offer);

  unsafe {
    let msg_data = format!(
      "{{\"type\":\"offer\",\"offer\":{},\"destination\":\"{}\"}}",
      serde_json::to_string(&offer).unwrap(),
      peer_id
    );
    let mut socket = SOCKET.first().expect("Can get write stream").lock().await;
    socket
      .send(Message::text(msg_data))
      .await
      .expect("Can send message");
  }
}

/**
 * Creates the peer connection object.
 */
async fn create_peer_connection() -> Arc<RTCPeerConnection> {
  // Create a MediaEngine object to configure the supported codec
  let mut m = MediaEngine::default();

  match m.register_default_codecs() {
    Ok(_) => {}
    Err(err) => panic!("{}", err),
  };

  let mut registry = Registry::new();

  // Use the default set of Interceptors
  registry = match register_default_interceptors(registry, &mut m) {
    Ok(r) => r,
    Err(err) => panic!("{}", err),
  };

  // Create the API object with the MediaEngine
  let api = APIBuilder::new()
    .with_media_engine(m)
    .with_interceptor_registry(registry)
    .build();

  // Create the RTC config:
  let config = RTCConfiguration {
    ice_servers: vec![RTCIceServer {
      urls: vec!["stun:stun.l.google.com:19302".to_owned()], // stun:84.30.14.3:25656 | stun:stun.l.google.com:19302
      ..Default::default()
    }],
    ..Default::default()
  };

  // Create a new RTCPeerConnection
  let pc = match api.new_peer_connection(config).await {
    Ok(p) => p,
    Err(err) => panic!("{}", err),
  };

  // Set the handler for ICE connection state
  // This will notify you when the peer has connected/disconnected
  pc.on_ice_connection_state_change(Box::new(|connection_state: RTCIceConnectionState| {
    println!("ICE Connection State has changed: {}", connection_state);
    Box::pin(async {})
  }))
  .await;

  // Send the current time via a DataChannel to the remote peer every 3 seconds
  pc.on_data_channel(Box::new(|d: Arc<RTCDataChannel>| {
    Box::pin(async move {
      let d2 = Arc::clone(&d);
      d.on_open(Box::new(move || {
        Box::pin(async move {
          while d2
            .send_text(format!("{:?}", tokio::time::Instant::now()))
            .await
            .is_ok()
          {
            tokio::time::sleep(Duration::from_secs(3)).await;
          }
        })
      }))
      .await;
    })
  }))
  .await;

  Arc::new(pc)
}

#[tauri::command]
pub async fn recieved_offer(offer: String) {
  println!("Recieved Offer: {}", offer);

  process_offer(offer).await;
}

/**
 * Process an offer from another peer on the network.
 */
async fn process_offer(offer: String) {
  let session_desc =
    serde_json::from_str::<RTCSessionDescription>(&offer).expect("Can parse offer");

  let pc = create_peer_connection().await;

  let dc = pc
    .create_data_channel("data", Some(RTCDataChannelInit::default()))
    .await
    .unwrap();

  dc.on_message(Box::new(|msg| {
    Box::pin(async move {
      println!("RTC Recieved: {:?}", msg);
    })
  }))
  .await;

  if let Err(err) = pc.set_remote_description(session_desc).await {
    panic!("{}", err);
  }
}
