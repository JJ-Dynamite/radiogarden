use axum::{
    routing::{get, post},
    Router,
    Json,
    response::IntoResponse,
};
use serde::{Deserialize, Serialize};
use tower_http::cors::{CorsLayer, Any};
use tracing_subscriber;

#[derive(Serialize)]
struct HealthResponse {
    status: String,
    service: String,
    version: String,
}

#[derive(Serialize)]
struct ApiResponse<T: Serialize> {
    success: bool,
    data: Option<T>,
    error: Option<String>,
}

#[derive(Serialize)]
struct RadioStation {
    id: String,
    name: String,
    country: String,
    city: String,
    genre: String,
    stream_url: String,
    website: String,
    listeners: u32,
    language: String,
}

#[derive(Serialize)]
struct Genre {
    name: String,
    count: u32,
    icon: String,
}

async fn health_check() -> impl IntoResponse {
    Json(HealthResponse {
        status: "healthy".to_string(),
        service: "Listen to any global radio station".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
    })
}

async fn root() -> impl IntoResponse {
    Json(ApiResponse::<()> {
        success: true,
        data: None,
        error: None,
    })
}

async fn get_stations() -> impl IntoResponse {
    let stations = vec![
        RadioStation {
            id: "bbc-1".to_string(),
            name: "BBC Radio 1".to_string(),
            country: "UK".to_string(),
            city: "London".to_string(),
            genre: "Pop".to_string(),
            stream_url: "http://stream.bbc.co.uk/bbcone.mp3".to_string(),
            website: "https://bbc.co.uk/radio1".to_string(),
            listeners: 45000,
            language: "English".to_string(),
        },
        RadioStation {
            id: "fip-1".to_string(),
            name: "FIP".to_string(),
            country: "France".to_string(),
            city: "Paris".to_string(),
            genre: "Eclectic".to_string(),
            stream_url: "http://icecast.radiofrance.fr/fip.mp3".to_string(),
            website: "https://fip.fr".to_string(),
            listeners: 28000,
            language: "French".to_string(),
        },
        RadioStation {
            id: "kexp-1".to_string(),
            name: "KEXP".to_string(),
            country: "USA".to_string(),
            city: "Seattle".to_string(),
            genre: "Alternative".to_string(),
            stream_url: "https://kexp.org/stream.mp3".to_string(),
            website: "https://kexp.org".to_string(),
            listeners: 15000,
            language: "English".to_string(),
        },
    ];

    Json(ApiResponse {
        success: true,
        data: Some(stations),
        error: None,
    })
}

async fn get_genres() -> impl IntoResponse {
    let genres = vec![
        Genre { name: "Pop".to_string(), count: 2345, icon: "🎵".to_string() },
        Genre { name: "Rock".to_string(), count: 1890, icon: "🎸".to_string() },
        Genre { name: "Jazz".to_string(), count: 1234, icon: "🎷".to_string() },
        Genre { name: "Classical".to_string(), count: 890, icon: "🎻".to_string() },
        Genre { name: "Electronic".to_string(), count: 1567, icon: "🎛️".to_string() },
        Genre { name: "Hip Hop".to_string(), count: 1123, icon: "🎤".to_string() },
    ];

    Json(ApiResponse {
        success: true,
        data: Some(genres),
        error: None,
    })
}

async fn search_stations(Json(req): Json<serde_json::Value>) -> impl IntoResponse {
    let query = req.get("query").and_then(|v| v.as_str()).unwrap_or("");
    
    let stations = vec![
        RadioStation {
            id: "search-1".to_string(),
            name: format!("{} FM", query),
            country: "Global".to_string(),
            city: "Various".to_string(),
            genre: "Mixed".to_string(),
            stream_url: format!("https://stream.{}.example.com", query),
            website: format!("https://{}.example.com", query),
            listeners: 5000,
            language: "Multiple".to_string(),
        },
    ];

    Json(ApiResponse {
        success: true,
        data: Some(stations),
        error: None,
    })
}

async fn get_stats() -> impl IntoResponse {
    Json(ApiResponse {
        success: true,
        data: Some(serde_json::json!({
            "total_stations": 56789,
            "countries": 234,
            "live_listeners": 2345678,
            "genres": 45
        })),
        error: None,
    })
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/", get(root))
        .route("/health", get(health_check))
        .route("/api/stations", get(get_stations))
        .route("/api/genres", get(get_genres))
        .route("/api/search", post(search_stations))
        .route("/api/stats", get(get_stats))
        .layer(cors);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3001")
        .await
        .unwrap();

    tracing::info!("Listen to any global radio station backend running on port 3001");
    axum::serve(listener, app).await.unwrap();
}
