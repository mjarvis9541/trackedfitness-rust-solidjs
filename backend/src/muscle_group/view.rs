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
    model::{MuscleGroup, MuscleGroupFilter, MuscleGroupSelect, MuscleGroupSerializer},
    serializer::MuscleGroupInput,
};

pub async fn muscle_group_list_view(
    Query(params): Query<QueryParams>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Value>, AppError> {
    let count = MuscleGroupSerializer::count(&state.pool, &params).await?;
    let query = MuscleGroupSerializer::all(&state.pool, &params).await?;
    let response = json!({"count": count, "results": query});
    Ok(Json(response))
}

pub async fn muscle_group_create_view(
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
    JsonExtractor(data): JsonExtractor<MuscleGroupInput>,
) -> Result<Json<MuscleGroup>, AppError> {
    let query = MuscleGroup::create(&state.pool, &data, &request_user.id).await?;
    Ok(Json(query))
}

pub async fn muscle_group_detail_view(
    Path(id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<MuscleGroupSerializer>, AppError> {
    let query = MuscleGroupSerializer::get(&state.pool, &id)
        .await?
        .ok_or(AppError::NotFound)?;
    Ok(Json(query))
}

pub async fn muscle_group_update_view(
    Path(id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
    JsonExtractor(data): JsonExtractor<MuscleGroupInput>,
) -> Result<Json<MuscleGroup>, AppError> {
    request_user.superuser_required()?;
    let query = MuscleGroup::get(&state.pool, &id).await?;
    let query = MuscleGroup::update(&state.pool, &query.id, &data, &request_user.id).await?;
    Ok(Json(query))
}

pub async fn muscle_group_delete_view(
    Path(id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
) -> Result<Json<MuscleGroup>, AppError> {
    request_user.superuser_required()?;
    let query = MuscleGroup::get(&state.pool, &id).await?;
    let result = MuscleGroup::delete(&state.pool, &query.id).await?;
    Ok(Json(result))
}

pub async fn muscle_group_filter_view(
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<MuscleGroupFilter>>, AppError> {
    let query = MuscleGroupFilter::all(&state.pool).await?;
    Ok(Json(query))
}

pub async fn muscle_group_select_view(
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<MuscleGroupSelect>>, AppError> {
    let query = MuscleGroupSelect::all(&state.pool).await?;
    Ok(Json(query))
}

pub async fn muscle_group_delete_id_range_view(
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
    JsonExtractor(data): JsonExtractor<IdRange>,
) -> Result<Json<Vec<MuscleGroup>>, AppError> {
    request_user.superuser_required()?;
    let query = MuscleGroup::delete_id_range(&state.pool, data.id_range).await?;
    Ok(Json(query))
}
