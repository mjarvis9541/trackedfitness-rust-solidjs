use axum::{
    routing::{delete, get, post, put},
    Router,
};
use std::sync::Arc;

use crate::AppState;

use super::view::{
    meal_of_day_create_view, meal_of_day_delete_id_range_view, meal_of_day_delete_view,
    meal_of_day_detail_view, meal_of_day_list_view, meal_of_day_select_view,
    meal_of_day_update_view,
};

pub fn meal_of_day_router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/", get(meal_of_day_list_view))
        .route("/", post(meal_of_day_create_view))
        .route("/:id", get(meal_of_day_detail_view))
        .route("/:id", put(meal_of_day_update_view))
        .route("/:id", delete(meal_of_day_delete_view))
        .route("/select", get(meal_of_day_select_view))
        .route("/delete-id-range", delete(meal_of_day_delete_id_range_view))
}
