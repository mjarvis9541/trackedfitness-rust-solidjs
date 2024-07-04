use axum::{
    extract::{Path, Query, State},
    Extension, Json,
};
use chrono::prelude::*;
use serde_json::{json, Value};
use std::sync::Arc;
use uuid::Uuid;

use crate::{
    error::AppError,
    extractor::JsonExtractor,
    middleware::RequestUser,
    user::model::User,
    util::{extract::IdRange, query::QueryParams},
    AppState,
};

use super::{
    model::{Workout, WorkoutDateAggregator, WorkoutSelect, WorkoutSerializer},
    serializer::WorkoutInput,
    workout_json::WorkoutJSON,
};

pub async fn workout_list_view(
    Query(params): Query<QueryParams>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Value>, AppError> {
    let count = WorkoutSerializer::count(&state.pool, &params).await?;
    let query = WorkoutSerializer::all(&state.pool, &params).await?;
    let response = json!({"count": count, "results": query});
    Ok(Json(response))
}

pub async fn workout_create_view(
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
    JsonExtractor(data): JsonExtractor<WorkoutInput>,
) -> Result<Json<Workout>, AppError> {
    let query = Workout::create(&state.pool, data.user_id, data.date, request_user.id).await?;
    Ok(Json(query))
}

pub async fn workout_detail_view(
    Path(id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Workout>, AppError> {
    let query = Workout::get(&state.pool, &id)
        .await?
        .ok_or(AppError::NotFound)?;
    Ok(Json(query))
}

pub async fn workout_update_view(
    Path(id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
    JsonExtractor(data): JsonExtractor<WorkoutInput>,
) -> Result<Json<Workout>, AppError> {
    let query = Workout::get(&state.pool, &id)
        .await?
        .ok_or(AppError::NotFound)?;
    let query = Workout::update(
        &state.pool,
        &query.id,
        data.user_id,
        data.date,
        request_user.id,
    )
    .await?;
    Ok(Json(query))
}
pub async fn workout_delete_view(
    Path(id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Workout>, AppError> {
    let query = Workout::get(&state.pool, &id)
        .await?
        .ok_or(AppError::NotFound)?;
    let query = Workout::delete(&state.pool, &query.id).await?;
    Ok(Json(query))
}

pub async fn workout_select_view(
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<WorkoutSelect>>, AppError> {
    let query = WorkoutSelect::all(&state.pool).await?;
    Ok(Json(query))
}

pub async fn workout_delete_id_range_view(
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
    JsonExtractor(data): JsonExtractor<IdRange>,
) -> Result<Json<Vec<Workout>>, AppError> {
    request_user.superuser_required()?;
    let query = Workout::delete_id_range(&state.pool, data.id_range).await?;
    Ok(Json(query))
}

pub async fn workout_date_aggregation_detail_view(
    Path((username, date)): Path<(String, NaiveDate)>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<WorkoutDateAggregator>, AppError> {
    let user = User::get_from_username(&state.pool, &username)
        .await?
        .ok_or(AppError::NotFound)?;
    let query = WorkoutDateAggregator::get(&state.pool, &user.id, date)
        .await?
        .unwrap_or_default();
    Ok(Json(query))
}

pub async fn workout_json_view(
    Query(params): Query<QueryParams>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<WorkoutJSON>>, AppError> {
    let query = WorkoutJSON::all(&state.pool, params).await?;
    Ok(Json(query))
}
