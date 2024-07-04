use axum::{
    routing::{delete, get, post, put},
    Router,
};
use std::sync::Arc;

use crate::AppState;

use super::view::{
    meal_create_from_diet_view, meal_create_view, meal_delete_id_range_view, meal_delete_view,
    meal_detail_view, meal_filter_view, meal_food_list_view, meal_json_view, meal_list_view,
    meal_select_view, meal_update_view,
};

pub fn meal_router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/", get(meal_list_view))
        .route("/", post(meal_create_view))
        .route("/:id", get(meal_detail_view))
        .route("/:id", put(meal_update_view))
        .route("/:id", delete(meal_delete_view))
        .route("/:id/food", get(meal_food_list_view))
        .route("/filter", get(meal_filter_view))
        .route("/select", get(meal_select_view))
        .route("/delete-id-range", delete(meal_delete_id_range_view))
        .route("/create-from-diet", post(meal_create_from_diet_view))
        .route("/json", get(meal_json_view))
}
