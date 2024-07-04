use crate::AppState;
use axum::{
    routing::{delete, get, post, put},
    Router,
};
use std::sync::Arc;

use super::view::{
    diet_target_create_view, diet_target_delete_date_range_view, diet_target_delete_id_range_view,
    diet_target_delete_view, diet_target_detail_view, diet_target_list_view,
    diet_target_update_view, user_diet_target_delete_view, user_diet_target_detail_latest_view,
    user_diet_target_detail_view, user_diet_target_list_view, user_diet_target_update_view,
    user_diet_target_week_average_view, user_diet_target_week_list_view,
    user_diet_target_week_total_view,
};

pub fn diet_target_router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/", post(diet_target_create_view))
        .route("/", get(diet_target_list_view))
        .route("/:id", get(diet_target_detail_view))
        .route("/:id", put(diet_target_update_view))
        .route("/:id", delete(diet_target_delete_view))
        .route("/delete-id-range", delete(diet_target_delete_id_range_view))
        .route(
            "/delete-date-range",
            delete(diet_target_delete_date_range_view),
        )
        .route("/user/:username", get(user_diet_target_list_view))
        .route("/user/:username/:date", get(user_diet_target_detail_view))
        .route("/user/:username/:date", put(user_diet_target_update_view))
        .route(
            "/user/:username/:date",
            delete(user_diet_target_delete_view),
        )
        .route(
            "/user/:username/:date/latest",
            get(user_diet_target_detail_latest_view),
        )
        .route(
            "/user/:username/:date/week",
            get(user_diet_target_week_list_view),
        )
        .route(
            "/user/:username/:date/week-total",
            get(user_diet_target_week_total_view),
        )
        .route(
            "/user/:username/:date/week-average",
            get(user_diet_target_week_average_view),
        )
}
