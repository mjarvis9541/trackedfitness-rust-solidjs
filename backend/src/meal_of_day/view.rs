use axum::{
    extract::{Path, Query, State},
    Extension, Json,
};
use serde_json::{json, Value};
use std::sync::Arc;
use uuid::Uuid;

use crate::{
    error::AppError,
    extractor::JsonExtractor,
    middleware::RequestUser,
    util::{extract::IdRange, query::QueryParams},
    AppState,
};

use super::{
    model::{MealOfDay, MealOfDaySelect},
    serializer::MealOfDayInput,
};

pub async fn meal_of_day_list_view(
    Query(params): Query<QueryParams>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Value>, AppError> {
    let count = MealOfDay::count(&state.pool, &params).await?;
    let query = MealOfDay::query(&state.pool, &params).await?;
    let response = json!({"count": count, "results": query});
    Ok(Json(response))
}

pub async fn meal_of_day_create_view(
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
    JsonExtractor(data): JsonExtractor<MealOfDayInput>,
) -> Result<Json<MealOfDay>, AppError> {
    request_user.superuser_required()?;
    let query = MealOfDay::create(&state.pool, &data, request_user.id).await?;
    Ok(Json(query))
}

pub async fn meal_of_day_detail_view(
    Path(id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<MealOfDay>, AppError> {
    let query = MealOfDay::get(&state.pool, &id).await?;
    Ok(Json(query))
}

pub async fn meal_of_day_update_view(
    Path(id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
    JsonExtractor(data): JsonExtractor<MealOfDayInput>,
) -> Result<Json<MealOfDay>, AppError> {
    request_user.superuser_required()?;
    let query = MealOfDay::get(&state.pool, &id).await?;
    let query = MealOfDay::update(&state.pool, query.id, &data, request_user.id).await?;
    Ok(Json(query))
}

pub async fn meal_of_day_delete_view(
    Path(id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
) -> Result<Json<MealOfDay>, AppError> {
    request_user.superuser_required()?;
    let query = MealOfDay::get(&state.pool, &id).await?;
    let result = MealOfDay::delete(&state.pool, &query.id).await?;
    Ok(Json(result))
}

pub async fn meal_of_day_select_view(
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<MealOfDaySelect>>, AppError> {
    let query = MealOfDaySelect::all(&state.pool).await?;
    Ok(Json(query))
}

pub async fn meal_of_day_delete_id_range_view(
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
    JsonExtractor(data): JsonExtractor<IdRange>,
) -> Result<Json<Vec<MealOfDay>>, AppError> {
    request_user.superuser_required()?;
    let query = MealOfDay::delete_id_range(&state.pool, data.id_range).await?;
    Ok(Json(query))
}
