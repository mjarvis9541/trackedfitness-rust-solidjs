use axum::{routing::get, Router};
use std::sync::Arc;

use crate::AppState;

use super::view::{diet_day_total_list_view, diet_meal_total_list_view};

pub fn diet_total_router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/", get(diet_day_total_list_view))
        .route("/meal", get(diet_meal_total_list_view))
}
