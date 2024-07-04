#![allow(unused_imports)]
#![allow(unused_variables)]
#![allow(dead_code)]
#![allow(unused)]

use axum::{middleware::from_fn_with_state, Extension, Router};
use sqlx::postgres::{PgPool, PgPoolOptions};
use std::{env, sync::Arc};
use tower::ServiceBuilder;
use tower_http::trace::TraceLayer;
use tracing::Level;
use tracing_subscriber::prelude::*;

mod auth;
mod brand;
mod db;
mod diet;
mod diet_target;
mod diet_total;
mod error;
mod exercise;
mod extractor;
mod follower;
mod food;
mod meal;
mod meal_food;
mod meal_of_day;
mod middleware;
mod movement;
mod muscle_group;
mod profile;
mod progress;
mod set;
mod training_plan;
mod user;
mod util;
mod workout;

use crate::auth::router::auth_router;
use crate::brand::router::brand_router;
use crate::diet::router::diet_router;
use crate::diet_target::router::diet_target_router;
use crate::diet_total::router::diet_total_router;
use crate::exercise::router::exercise_router;
use crate::follower::router::follower_router;
use crate::food::router::food_router;
use crate::meal::router::meal_router;
use crate::meal_food::router::meal_food_router;
use crate::meal_of_day::router::meal_of_day_router;
use crate::middleware::authorization_middleware;
use crate::movement::router::movement_router;
use crate::muscle_group::router::muscle_group_router;
use crate::profile::router::profile_router;
use crate::progress::router::progress_router;
use crate::set::router::set_router;
use crate::user::router::user_router;
use crate::workout::router::workout_router;

#[derive(Debug, Clone)]
pub struct AppState {
    pub secret: String,
    pub pool: PgPool,
}

#[tokio::main]
async fn main() {
    // dotenvy::dotenv().unwrap();
    // env::set_var("RUST_LOG", "debug");
    // env::set_var("RUST_BACKTRACE", "1");
    dotenvy::dotenv().unwrap();
    let secret = env::var("SECRET_KEY").expect("SECRET_KEY must be set");
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
        .expect("could not create a database pool");

    let state = Arc::new(AppState { secret, pool });

    let filter = tracing_subscriber::filter::Targets::new()
        // .with_target("tower_http::trace::on_request", Level::DEBUG)
        // .with_target("sqlx::query", Level::DEBUG)
        .with_target("tower_http::trace::on_response", Level::DEBUG)
        .with_target("tower_http::trace::make_span", Level::DEBUG)
        .with_default(Level::INFO);

    let tracing_layer = tracing_subscriber::fmt::layer()
        .pretty()
        // .compact()
        // .with_thread_ids(true)
        .with_file(false)
        .with_line_number(false);

    tracing_subscriber::registry()
        .with(tracing_layer)
        .with(filter)
        .init();

    let listener = tokio::net::TcpListener::bind("127.0.0.1:8080")
        .await
        .unwrap();

    tracing::info!("Listening on: http://{}", listener.local_addr().unwrap());
    axum::serve(listener, app(state).await).await.unwrap();
}

async fn app(state: Arc<AppState>) -> Router {
    // dotenvy::dotenv().unwrap();
    // let secret = env::var("SECRET_KEY").expect("SECRET_KEY must be set");
    // let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");

    // let pool = PgPoolOptions::new()
    //     .max_connections(5)
    //     .connect(&database_url)
    //     .await
    //     .expect("could not create a database pool");

    // let state = Arc::new(AppState { secret, pool });

    Router::new()
        .nest("/auth", auth_router())
        .nest("/brands", brand_router())
        .nest("/diet-target", diet_target_router())
        .nest("/diet", diet_router())
        .nest("/diet-total", diet_total_router())
        .nest("/exercises", exercise_router())
        .nest("/followers", follower_router())
        .nest("/food", food_router())
        .nest("/meal-food", meal_food_router())
        .nest("/meal-of-day", meal_of_day_router())
        .nest("/meals", meal_router())
        .nest("/movements", movement_router())
        .nest("/muscle-groups", muscle_group_router())
        .nest("/profiles", profile_router())
        .nest("/progress", progress_router())
        .nest("/sets", set_router())
        .nest("/users", user_router())
        .nest("/workouts", workout_router())
        // .layer(from_fn(print_request_response))
        .layer(
            ServiceBuilder::new()
                .layer(from_fn_with_state(state.clone(), authorization_middleware))
                .layer(Extension(state.clone()))
                .layer(TraceLayer::new_for_http()),
        )
        .with_state(state)
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::{
        body::Body,
        extract::connect_info::MockConnectInfo,
        http::{self, Request, StatusCode},
    };
    use http_body_util::BodyExt; // for `collect`
    use serde_json::{json, Value};
    use sqlx::{PgPool, Row};
    use std::net::SocketAddr;
    use tokio::net::TcpListener;
    use tower::{Service, ServiceExt}; // for `call`, `oneshot`, and `ready`

    async fn get_state() -> Arc<AppState> {
        dotenvy::dotenv().unwrap();
        let secret = env::var("SECRET_KEY").expect("SECRET_KEY must be set");
        let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
        let pool = PgPoolOptions::new()
            .max_connections(5)
            .connect(&database_url)
            .await
            .expect("could not create a database pool");

        let state = Arc::new(AppState { secret, pool });
        return state;
    }

    #[tokio::test]
    async fn test_one() {
        let state = get_state().await;
        let app = app(state).await;

        let data: Value = json!({"username": "michael", "password": "testing321"});

        let response = app
            .oneshot(
                Request::builder()
                    .method(http::Method::POST)
                    .uri("/auth/login")
                    .header(http::header::CONTENT_TYPE, mime::APPLICATION_JSON.as_ref())
                    .body(Body::from(
                        serde_json::to_vec(
                            &json!({"username": "michael", "password": "testing321"}),
                        )
                        .unwrap(),
                    ))
                    .unwrap(),
            )
            .await
            .unwrap();

        let body = response.into_body().collect().await.unwrap().to_bytes();
        let body: Value = serde_json::from_slice(&body).unwrap();
        println!("{:?}", body);
    }

    #[tokio::test]
    async fn test_login_returns_correct_data() {
        let state = get_state().await;
        let app = app(state).await;

        let data: Value = json!({"email": "michael", "password": "testing321s"});

        let response = app
            .oneshot(
                Request::builder()
                    .method(http::Method::POST)
                    .uri("/auth/login")
                    .header(http::header::CONTENT_TYPE, mime::APPLICATION_JSON.as_ref())
                    .body(Body::from(
                        serde_json::to_vec(
                            &json!({"username": "michael", "password": "testing321"}),
                        )
                        .unwrap(),
                    ))
                    .unwrap(),
            )
            .await
            .unwrap();

        let body = response.into_body().collect().await.unwrap().to_bytes();
        let body: Value = serde_json::from_slice(&body).unwrap();
        println!("{:?}", body);
    }

    #[tokio::test]
    async fn test_signup_validation() {
        let state = get_state().await;
        let app = app(state).await;

        let data: Value = json!({"name": "new-user", "password": "new-user-password", "email": "test@example.com", "name": "hello there"});

        let response = app
            .oneshot(
                Request::builder()
                    .method(http::Method::POST)
                    .uri("/auth/login")
                    // .header(http::header::CONTENT_TYPE, mime::APPLICATION_JSON.as_ref())
                    .body(Body::from(serde_json::to_vec(&data).unwrap()))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::BAD_REQUEST);

        let body = response.into_body().collect().await.unwrap().to_bytes();
        let body: Value = serde_json::from_slice(&body).unwrap();

        println!("{:?}", body);
    }

    // #[tokio::test]
    // async fn test_email_change_validation() {
    //     let secret = String::from("secret");
    //     let state = Arc::new(AppState { secret, pool });
    //     let app = app(state).await;

    //     let response = app
    //         .oneshot(
    //             Request::builder()
    //                 .method(http::Method::GET)
    //                 .uri("/diet")
    //                 .body(Body::empty())
    //                 .unwrap(),
    //         )
    //         .await
    //         .unwrap();

    //     println!("{:?}", response);

    //     assert_eq!(response.status(), StatusCode::BAD_REQUEST);

    //     // let body = response.into_body().collect().await.unwrap().to_bytes();

    //     // assert_eq!(&body[..], b"Hello, World!");
    // }

    // #[tokio::test]
    // async fn json() {
    //     let app = app().await;

    //     let response = app
    //         .oneshot(
    //             Request::builder()
    //                 .method(http::Method::POST)
    //                 .uri("/diet")
    //                 .header(http::header::CONTENT_TYPE, mime::APPLICATION_JSON.as_ref())
    //                 .body(Body::from(
    //                     serde_json::to_vec(&json!([1, 2, 3, 4])).unwrap(),
    //                 ))
    //                 .unwrap(),
    //         )
    //         .await
    //         .unwrap();

    //     assert_eq!(response.status(), StatusCode::OK);

    //     let body = response.into_body().collect().await.unwrap().to_bytes();
    //     let body: Value = serde_json::from_slice(&body).unwrap();
    //     dbg!(&body);
    //     assert_eq!(body, json!({ "data": [1, 2, 3, 4] }));
    // }

    // // #[tokio::test]
    // // async fn json() {
    // //     let app = app().await;

    //     let response = app
    //         .oneshot(
    //             Request::builder()
    //                 .method(http::Method::POST)
    //                 .uri("/json")
    //                 .header(http::header::CONTENT_TYPE, mime::APPLICATION_JSON.as_ref())
    //                 .body(Body::from(
    //                     serde_json::to_vec(&json!([1, 2, 3, 4])).unwrap(),
    //                 ))
    //                 .unwrap(),
    //         )
    //         .await
    //         .unwrap();

    //     assert_eq!(response.status(), StatusCode::OK);

    //     let body = response.into_body().collect().await.unwrap().to_bytes();
    //     let body: Value = serde_json::from_slice(&body).unwrap();
    //     assert_eq!(body, json!({ "data": [1, 2, 3, 4] }));
    // }

    // #[tokio::test]
    // async fn not_found() {
    //     let app = app();

    //     let response = app
    //         .oneshot(
    //             Request::builder()
    //                 .uri("/does-not-exist")
    //                 .body(Body::empty())
    //                 .unwrap(),
    //         )
    //         .await
    //         .unwrap();

    //     assert_eq!(response.status(), StatusCode::NOT_FOUND);
    //     let body = response.into_body().collect().await.unwrap().to_bytes();
    //     assert!(body.is_empty());
    // }

    // // You can also spawn a server and talk to it like any other HTTP server:
    // #[tokio::test]
    // async fn the_real_deal() {
    //     let listener = TcpListener::bind("0.0.0.0:0").await.unwrap();
    //     let addr = listener.local_addr().unwrap();

    //     tokio::spawn(async move {
    //         axum::serve(listener, app()).await.unwrap();
    //     });

    //     let client =
    //         hyper_util::client::legacy::Client::builder(hyper_util::rt::TokioExecutor::new())
    //             .build_http();

    //     let response = client
    //         .request(
    //             Request::builder()
    //                 .uri(format!("http://{addr}"))
    //                 .header("Host", "localhost")
    //                 .body(Body::empty())
    //                 .unwrap(),
    //         )
    //         .await
    //         .unwrap();

    //     let body = response.into_body().collect().await.unwrap().to_bytes();
    //     assert_eq!(&body[..], b"Hello, World!");
    // }

    // // You can use `ready()` and `call()` to avoid using `clone()`
    // // in multiple request
    // #[tokio::test]
    // async fn multiple_request() {
    //     let mut app = app().into_service();

    //     let request = Request::builder().uri("/").body(Body::empty()).unwrap();
    //     let response = ServiceExt::<Request<Body>>::ready(&mut app)
    //         .await
    //         .unwrap()
    //         .call(request)
    //         .await
    //         .unwrap();
    //     assert_eq!(response.status(), StatusCode::OK);

    //     let request = Request::builder().uri("/").body(Body::empty()).unwrap();
    //     let response = ServiceExt::<Request<Body>>::ready(&mut app)
    //         .await
    //         .unwrap()
    //         .call(request)
    //         .await
    //         .unwrap();
    //     assert_eq!(response.status(), StatusCode::OK);
    // }

    // // Here we're calling `/requires-connect-into` which requires `ConnectInfo`
    // //
    // // That is normally set with `Router::into_make_service_with_connect_info` but we can't easily
    // // use that during tests. The solution is instead to set the `MockConnectInfo` layer during
    // // tests.
    // #[tokio::test]
    // async fn with_into_make_service_with_connect_info() {
    //     let mut app = app()
    //         .layer(MockConnectInfo(SocketAddr::from(([0, 0, 0, 0], 3000))))
    //         .into_service();

    //     let request = Request::builder()
    //         .uri("/requires-connect-into")
    //         .body(Body::empty())
    //         .unwrap();
    //     let response = app.ready().await.unwrap().call(request).await.unwrap();
    //     assert_eq!(response.status(), StatusCode::OK);
    // }
}
