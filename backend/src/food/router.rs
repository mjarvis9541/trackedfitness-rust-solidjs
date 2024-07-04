use axum::{
    routing::{delete, get, post, put},
    Router,
};
use std::sync::Arc;

use crate::AppState;

use super::view::{
    food_create_view, food_delete_id_range_view, food_delete_view, food_detail_view,
    food_list_view, food_select_view, food_slug_detail_view, food_update_view,
};

pub fn food_router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/", get(food_list_view))
        .route("/", post(food_create_view))
        .route("/:id", get(food_detail_view))
        .route("/:id", put(food_update_view))
        .route("/:id", delete(food_delete_view))
        .route("/slug/:slug", get(food_slug_detail_view))
        .route("/select", get(food_select_view))
        .route("/delete-id-range", delete(food_delete_id_range_view))
}
