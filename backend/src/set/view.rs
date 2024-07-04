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
    model::{Set, SetSerializer},
    serializer::{SetInput, SetRangeInput},
};

pub async fn set_list_view(
    Query(params): Query<QueryParams>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Value>, AppError> {
    let count = SetSerializer::count(&state.pool, &params).await?;
    let query = SetSerializer::all(&state.pool, &params).await?;
    let response = json!({"count": count, "results": query});
    Ok(Json(response))
}

pub async fn set_create_view(
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
    JsonExtractor(data): JsonExtractor<SetInput>,
) -> Result<Json<Set>, AppError> {
    let query = Set::create(&state.pool, &data, &request_user.id).await?;
    Ok(Json(query))
}

pub async fn set_detail_view(
    Path(id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<SetSerializer>, AppError> {
    let query = SetSerializer::get(&state.pool, &id)
        .await?
        .ok_or(AppError::NotFound)?;
    Ok(Json(query))
}

pub async fn set_update_view(
    Path(id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
    JsonExtractor(data): JsonExtractor<SetInput>,
) -> Result<Json<Set>, AppError> {
    request_user.superuser_required()?;
    let query = Set::get(&state.pool, &id).await?;
    let query = Set::update(&state.pool, &query.id, &data, &request_user.id).await?;
    Ok(Json(query))
}

pub async fn set_delete_view(
    Path(id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
) -> Result<Json<Set>, AppError> {
    request_user.superuser_required()?;
    let query = Set::get(&state.pool, &id).await?;
    let result = Set::delete(&state.pool, &query.id).await?;
    Ok(Json(result))
}

pub async fn set_delete_id_range_view(
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
    JsonExtractor(data): JsonExtractor<IdRange>,
) -> Result<Json<Vec<Set>>, AppError> {
    request_user.superuser_required()?;
    let query = Set::delete_id_range(&state.pool, data.id_range).await?;
    Ok(Json(query))
}

pub async fn set_create_range_view(
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
    JsonExtractor(data): JsonExtractor<SetRangeInput>,
) -> Result<Json<Vec<Set>>, AppError> {
    request_user.superuser_required()?;
    let query = Set::create_range(&state.pool, data, request_user.id).await?;
    Ok(Json(query))
}
