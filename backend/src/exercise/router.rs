use axum::{
    routing::{delete, get, post, put},
    Router,
};
use std::sync::Arc;

use crate::AppState;

use super::view::{
    exercise_create_view, exercise_delete_id_range_view, exercise_delete_last_set_view,
    exercise_delete_view, exercise_detail_view, exercise_list_view, exercise_select_view,
    exercise_sets_create_view, exercise_update_view,
};

pub fn exercise_router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/", get(exercise_list_view))
        .route("/", post(exercise_create_view))
        .route("/:id", get(exercise_detail_view))
        .route("/:id", put(exercise_update_view))
        .route("/:id", delete(exercise_delete_view))
        .route("/delete-id-range", delete(exercise_delete_id_range_view))
        .route(
            "/:id/delete-last-set",
            delete(exercise_delete_last_set_view),
        )
        .route("/select", get(exercise_select_view))
        .route("/create-with-sets", post(exercise_sets_create_view))
}
