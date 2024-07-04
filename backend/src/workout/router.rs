use axum::{
    routing::{delete, get, post, put},
    Router,
};
use std::sync::Arc;

use crate::AppState;

use super::view::{
    workout_create_view, workout_date_aggregation_detail_view, workout_delete_id_range_view,
    workout_delete_view, workout_detail_view, workout_json_view, workout_list_view,
    workout_select_view, workout_update_view,
};

pub fn workout_router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/json", get(workout_json_view))
        .route("/", get(workout_list_view))
        .route("/", post(workout_create_view))
        .route("/:id", get(workout_detail_view))
        .route("/:id", put(workout_update_view))
        .route("/:id", delete(workout_delete_view))
        .route("/select", get(workout_select_view))
        .route("/delete-id-range", delete(workout_delete_id_range_view))
        .route(
            "/:username/:date/day-aggregation",
            get(workout_date_aggregation_detail_view),
        )
}
