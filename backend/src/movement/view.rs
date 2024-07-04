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
    model::{Movement, MovementFilter, MovementSelect, MovementSerializer},
    serializer::MovementInput,
};

pub async fn movement_list_view(
    Query(params): Query<QueryParams>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Value>, AppError> {
    let count = MovementSerializer::count(&state.pool, &params).await?;
    let query = MovementSerializer::all(&state.pool, &params).await?;
    let response = json!({"count": count, "results": query});
    Ok(Json(response))
}

pub async fn movement_create_view(
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
    JsonExtractor(data): JsonExtractor<MovementInput>,
) -> Result<Json<Movement>, AppError> {
    let query = Movement::create(&state.pool, &data, &request_user.id).await?;
    Ok(Json(query))
}

pub async fn movement_detail_view(
    Path(id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<MovementSerializer>, AppError> {
    let query = MovementSerializer::get(&state.pool, &id)
        .await?
        .ok_or(AppError::NotFound)?;
    Ok(Json(query))
}

pub async fn movement_update_view(
    Path(id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
    JsonExtractor(data): JsonExtractor<MovementInput>,
) -> Result<Json<Movement>, AppError> {
    request_user.superuser_required()?;
    let query = Movement::get(&state.pool, &id).await?;
    let query = Movement::update(&state.pool, &query.id, &data, &request_user.id).await?;
    Ok(Json(query))
}

pub async fn movement_delete_view(
    Path(id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
) -> Result<Json<Movement>, AppError> {
    request_user.superuser_required()?;
    let query = Movement::get(&state.pool, &id).await?;
    let result = Movement::delete(&state.pool, &query.id).await?;
    Ok(Json(result))
}

pub async fn movement_filter_view(
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<MovementFilter>>, AppError> {
    let query = MovementFilter::all(&state.pool).await?;
    Ok(Json(query))
}

pub async fn movement_select_view(
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<MovementSelect>>, AppError> {
    let query = MovementSelect::all(&state.pool).await?;
    Ok(Json(query))
}

pub async fn movement_delete_id_range_view(
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
    JsonExtractor(data): JsonExtractor<IdRange>,
) -> Result<Json<Vec<Movement>>, AppError> {
    request_user.superuser_required()?;
    let query = Movement::delete_id_range(&state.pool, data.id_range).await?;
    Ok(Json(query))
}
