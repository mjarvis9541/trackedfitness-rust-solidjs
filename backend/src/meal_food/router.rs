use axum::{
    routing::{delete, get, post, put},
    Router,
};
use std::sync::Arc;

use crate::AppState;

use super::view::{
    meal_food_create_view, meal_food_delete_id_range_view, meal_food_delete_view,
    meal_food_detail_view, meal_food_list_view, meal_food_update_view,
};

pub fn meal_food_router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/", get(meal_food_list_view))
        .route("/", post(meal_food_create_view))
        .route("/:id", get(meal_food_detail_view))
        .route("/:id", put(meal_food_update_view))
        .route("/:id", delete(meal_food_delete_view))
        .route("/delete-id-range", delete(meal_food_delete_id_range_view))
}
