use axum::{
    routing::{delete, get, post, put},
    Router,
};
use std::sync::Arc;

use crate::AppState;

use super::view::{
    follower_create_view, follower_delete_id_range_view, follower_delete_view,
    follower_detail_view, follower_list_view, follower_update_view,
};

pub fn follower_router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/", get(follower_list_view))
        .route("/", post(follower_create_view))
        .route("/:id", get(follower_detail_view))
        .route("/:id", put(follower_update_view))
        .route("/:id", delete(follower_delete_view))
        .route("/delete-id-range", delete(follower_delete_id_range_view))
}
