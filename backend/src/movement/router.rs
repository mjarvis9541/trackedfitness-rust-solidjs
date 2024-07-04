use axum::{
    routing::{delete, get, post, put},
    Router,
};
use std::sync::Arc;

use crate::AppState;

use super::view::{
    movement_create_view, movement_delete_id_range_view, movement_delete_view,
    movement_detail_view, movement_filter_view, movement_list_view, movement_select_view,
    movement_update_view,
};

pub fn movement_router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/", get(movement_list_view))
        .route("/", post(movement_create_view))
        .route("/:id", get(movement_detail_view))
        .route("/:id", put(movement_update_view))
        .route("/:id", delete(movement_delete_view))
        .route("/filter", get(movement_filter_view))
        .route("/select", get(movement_select_view))
        .route("/delete-id-range", delete(movement_delete_id_range_view))
}
