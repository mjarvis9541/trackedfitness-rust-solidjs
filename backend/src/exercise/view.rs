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
    set::model::Set,
    util::{extract::IdRange, query::QueryParams},
    AppState,
};

use super::{
    model::{Exercise, ExerciseSelect, ExerciseSerializer},
    serializer::{ExerciseInput, ExerciseSetInput},
};

pub async fn exercise_list_view(
    Query(params): Query<QueryParams>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Value>, AppError> {
    let count = ExerciseSerializer::count(&state.pool, &params).await?;
    let query = ExerciseSerializer::all(&state.pool, &params).await?;
    let response = json!({"count": count, "results": query});
    Ok(Json(response))
}

pub async fn exercise_create_view(
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
    JsonExtractor(data): JsonExtractor<ExerciseInput>,
) -> Result<Json<Exercise>, AppError> {
    let query = Exercise::create(&state.pool, &data, &request_user.id).await?;
    Ok(Json(query))
}

pub async fn exercise_detail_view(
    Path(id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<ExerciseSerializer>, AppError> {
    let query = ExerciseSerializer::get(&state.pool, &id)
        .await?
        .ok_or(AppError::NotFound)?;
    Ok(Json(query))
}

pub async fn exercise_update_view(
    Path(id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
    JsonExtractor(data): JsonExtractor<ExerciseInput>,
) -> Result<Json<Exercise>, AppError> {
    request_user.superuser_required()?;
    let query = Exercise::get(&state.pool, &id).await?;
    let query = Exercise::update(&state.pool, &query.id, &data, &request_user.id).await?;
    Ok(Json(query))
}

pub async fn exercise_delete_view(
    Path(id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
) -> Result<Json<Exercise>, AppError> {
    request_user.superuser_required()?;
    let query = Exercise::get(&state.pool, &id).await?;
    let result = Exercise::delete(&state.pool, &query.id).await?;
    Ok(Json(result))
}

pub async fn exercise_sets_create_view(
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
    JsonExtractor(data): JsonExtractor<ExerciseSetInput>,
) -> Result<Json<Exercise>, AppError> {
    request_user.superuser_required()?;
    let query = Exercise::create_exercise_and_sets(&state.pool, data, request_user.id).await?;
    Ok(Json(query))
}

pub async fn exercise_delete_id_range_view(
    State(state): State<Arc<AppState>>,
    JsonExtractor(data): JsonExtractor<IdRange>,
) -> Result<Json<Vec<Exercise>>, AppError> {
    let query = Exercise::delete_id_range(&state.pool, data.id_range).await?;
    Ok(Json(query))
}

pub async fn exercise_select_view(
    State(state): State<Arc<AppState>>,
    // Extension(request_user): Extension<RequestUser>,
) -> Result<Json<Vec<ExerciseSelect>>, AppError> {
    let query = ExerciseSelect::all(&state.pool).await?;
    Ok(Json(query))
}

pub async fn exercise_delete_last_set_view(
    Path(id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
    // Extension(request_user): Extension<RequestUser>,
) -> Result<Json<Set>, AppError> {
    let set = Set::get_last_added(&state.pool, &id)
        .await?
        .ok_or(AppError::NotFound)?;
    let query = Set::delete(&state.pool, &set.id).await?;
    Ok(Json(query))
}
