use axum::{
    extract::{Path, Query, State},
    Extension, Json,
};
use chrono::NaiveDate;
use serde_json::{json, Value};
use std::sync::Arc;
use uuid::Uuid;

use crate::{
    error::AppError,
    extractor::JsonExtractor,
    middleware::RequestUser,
    user::model::User,
    util::{
        extract::{IdRange, UsernameDateRange},
        query::QueryParams,
    },
    AppState,
};

use super::{
    model::{Progress, ProgressAggregation},
    serializer::{ProgressInput, ProgressUpdateInput},
};

pub async fn progress_list_view(
    Query(params): Query<QueryParams>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Value>, AppError> {
    let count = Progress::count(&state.pool, &params).await?;
    let query = Progress::all(&state.pool, &params).await?;
    let response = json!({"count": count, "results": query});
    Ok(Json(response))
}

pub async fn user_progress_list_view(
    Path(username): Path<String>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<Progress>>, AppError> {
    let query = Progress::stream(&state.pool, &username).await?;
    Ok(Json(query))
}

pub async fn progress_create_view(
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
    JsonExtractor(data): JsonExtractor<ProgressInput>,
) -> Result<Json<Progress>, AppError> {
    let query = Progress::create(
        &state.pool,
        data.user_id,
        data.date,
        data.weight_kg,
        data.energy_burnt,
        data.notes,
        request_user.id,
    )
    .await?;
    Ok(Json(query))
}

pub async fn progress_detail_view(
    Path(id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Progress>, AppError> {
    let query = Progress::get(&state.pool, &id)
        .await?
        .ok_or(AppError::NotFound)?;
    Ok(Json(query))
}

pub async fn progress_update_view(
    Path(id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
    JsonExtractor(data): JsonExtractor<ProgressUpdateInput>,
) -> Result<Json<Progress>, AppError> {
    let query = Progress::update(
        &state.pool,
        id,
        data.date,
        data.weight_kg,
        data.energy_burnt,
        data.notes,
        request_user.id,
    )
    .await?;
    Ok(Json(query))
}

pub async fn user_progress_detail_view(
    Path((username, date)): Path<(String, NaiveDate)>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Progress>, AppError> {
    let query = Progress::get_by_username_date(&state.pool, username, &date)
        .await?
        .ok_or(AppError::NotFound)?;
    Ok(Json(query))
}

pub async fn progress_delete_view(
    Path(id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Progress>, AppError> {
    let result = Progress::delete(&state.pool, &id).await?;
    Ok(Json(result))
}

pub async fn user_progress_detail_latest_view(
    Path((username, date)): Path<(String, NaiveDate)>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Progress>, AppError> {
    let query = Progress::get_latest(&state.pool, &username, &date)
        .await?
        .ok_or(AppError::NotFound)?;
    Ok(Json(query))
}

pub async fn user_progress_detail_latest_weight_view(
    Path(username): Path<String>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Progress>, AppError> {
    let query = Progress::get_latest_weight(&state.pool, &username)
        .await?
        .ok_or(AppError::NotFound)?;
    Ok(Json(query))
}

pub async fn progress_delete_id_range_view(
    State(state): State<Arc<AppState>>,
    JsonExtractor(data): JsonExtractor<IdRange>,
) -> Result<Json<Vec<Progress>>, AppError> {
    let query = Progress::delete_id_range(&state.pool, data.id_range).await?;
    Ok(Json(query))
}

pub async fn progress_delete_date_range_view(
    State(state): State<Arc<AppState>>,
    JsonExtractor(data): JsonExtractor<UsernameDateRange>,
) -> Result<Json<Vec<Progress>>, AppError> {
    let user = User::get_from_username(&state.pool, &data.username)
        .await?
        .ok_or(AppError::NotFound)?;
    let query = Progress::delete_date_range(&state.pool, user.id, data.date_range).await?;
    Ok(Json(query))
}

pub async fn progress_aggregation_detail_view(
    Path((username, date)): Path<(String, NaiveDate)>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<ProgressAggregation>, AppError> {
    let user = User::get_from_username(&state.pool, &username)
        .await?
        .ok_or(AppError::NotFound)?;
    let query = ProgressAggregation::get(&state.pool, user.id, date).await?;
    Ok(Json(query))
}
