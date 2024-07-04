use axum::{
    routing::{delete, get, post, put},
    Router,
};
use std::sync::Arc;

use crate::diet::view::{
    diet_create_from_meal_view, diet_create_view, diet_day_json_view, diet_day_month_list_view,
    diet_day_total_list_view, diet_day_view, diet_delete_date_range_view,
    diet_delete_id_range_view, diet_delete_view, diet_detail_view, diet_list_view,
    diet_meal_json_view, diet_update_view, diet_week_average_detail_view,
    diet_week_total_detail_view,
};
use crate::AppState;

pub fn diet_router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/", get(diet_list_view))
        .route("/", post(diet_create_view))
        .route("/:id", get(diet_detail_view))
        .route("/:id", put(diet_update_view))
        .route("/:id", delete(diet_delete_view))
        .route("/delete-id-range", delete(diet_delete_id_range_view))
        .route("/delete-date-range", delete(diet_delete_date_range_view))
        .route("/create-from-meal-food", post(diet_create_from_meal_view))
        // day view - detail view of day
        .route("/:username/:date", get(diet_day_view))
        // week views - list per day
        .route("/:username/:date/week", get(diet_day_total_list_view))
        // week detail - total / avg
        .route(
            "/:username/:date/week-total",
            get(diet_week_total_detail_view),
        )
        .route(
            "/:username/:date/week-average",
            get(diet_week_average_detail_view),
        )
        // month view - list per day
        .route("/:username/:date/day-total", get(diet_day_month_list_view))
        // json views - improved
        .route("/day-json", get(diet_day_json_view))
        .route("/meal-json", get(diet_meal_json_view))
}
