use axum::{
    routing::{delete, get, post, put},
    Router,
};
use std::sync::Arc;

use crate::AppState;

use super::view::{
    muscle_group_create_view, muscle_group_delete_id_range_view, muscle_group_delete_view,
    muscle_group_detail_view, muscle_group_filter_view, muscle_group_list_view,
    muscle_group_select_view, muscle_group_update_view,
};

pub fn muscle_group_router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/", get(muscle_group_list_view))
        .route("/", post(muscle_group_create_view))
        .route("/:id", get(muscle_group_detail_view))
        .route("/:id", put(muscle_group_update_view))
        .route("/:id", delete(muscle_group_delete_view))
        .route("/filter", get(muscle_group_filter_view))
        .route("/select", get(muscle_group_select_view))
        .route(
            "/delete-id-range",
            delete(muscle_group_delete_id_range_view),
        )
}
