use axum::{
    routing::{delete, get, post, put},
    Router,
};
use std::sync::Arc;

use crate::AppState;

use super::view::{
    progress_aggregation_detail_view, progress_create_view, progress_delete_date_range_view,
    progress_delete_id_range_view, progress_delete_view, progress_detail_view, progress_list_view,
    progress_update_view, user_progress_detail_latest_view,
    user_progress_detail_latest_weight_view, user_progress_detail_view, user_progress_list_view,
};

pub fn progress_router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/", get(progress_list_view))
        .route("/", post(progress_create_view))
        .route("/:id", get(progress_detail_view))
        .route("/:id", put(progress_update_view))
        .route("/:id", delete(progress_delete_view))
        .route("/delete-id-range", delete(progress_delete_id_range_view))
        .route(
            "/delete-date-range",
            delete(progress_delete_date_range_view),
        )
        .route("/user/:username", get(user_progress_list_view))
        .route("/user/:username/:date", get(user_progress_detail_view))
        .route(
            "/user/:username/:date/latest",
            get(user_progress_detail_latest_view),
        )
        .route(
            "/user/:username/latest",
            get(user_progress_detail_latest_weight_view),
        )
        .route(
            "/:username/:date/aggregation",
            get(progress_aggregation_detail_view),
        )
}
