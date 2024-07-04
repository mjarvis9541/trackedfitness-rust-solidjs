use axum::{
    routing::{delete, get, post, put},
    Router,
};
use std::sync::Arc;

use crate::AppState;

use super::view::{
    set_create_range_view, set_create_view, set_delete_id_range_view, set_delete_view,
    set_detail_view, set_list_view, set_update_view,
};

pub fn set_router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/", get(set_list_view))
        .route("/", post(set_create_view))
        .route("/:id", get(set_detail_view))
        .route("/:id", put(set_update_view))
        .route("/:id", delete(set_delete_view))
        .route("/delete-id-range", delete(set_delete_id_range_view))
        .route("/create-range", post(set_create_range_view))
}
