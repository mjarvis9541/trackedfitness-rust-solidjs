use axum::{
    extract::{Query, State},
    Json,
};
use std::sync::Arc;

use crate::{error::AppError, util::query::QueryParams, AppState};

use super::model::{DietDayTotal, DietMealTotal};

pub async fn diet_day_total_list_view(
    Query(params): Query<QueryParams>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<DietDayTotal>>, AppError> {
    let query = DietDayTotal::all(&state.pool, params).await?;
    Ok(Json(query))
}

pub async fn diet_meal_total_list_view(
    Query(params): Query<QueryParams>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<DietMealTotal>>, AppError> {
    let query = DietMealTotal::all(&state.pool, params).await?;
    Ok(Json(query))
}
