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
    model::{Food, FoodSelect, FoodSerializer},
    serializer::FoodDeserializer,
};

pub async fn food_list_view(
    Query(params): Query<QueryParams>,
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
) -> Result<Json<Value>, AppError> {
    let count = FoodSerializer::count(&state.pool, &params).await?;
    let query = FoodSerializer::all(&state.pool, &params, request_user).await?;
    let response = json!({"count": count, "results": query});
    Ok(Json(response))
}

pub async fn food_create_view(
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
    JsonExtractor(data): JsonExtractor<FoodDeserializer>,
) -> Result<Json<Food>, AppError> {
    let query = Food::create(&state.pool, &data, &request_user.id).await?;
    Ok(Json(query))
}

pub async fn food_detail_view(
    Path(id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
) -> Result<Json<FoodSerializer>, AppError> {
    let query = FoodSerializer::get(&state.pool, &id, request_user)
        .await?
        .ok_or(AppError::NotFound)?;
    Ok(Json(query))
}

// todo
pub async fn food_slug_detail_view(
    Path(id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
) -> Result<Json<FoodSerializer>, AppError> {
    let query = FoodSerializer::get(&state.pool, &id, request_user)
        .await?
        .ok_or(AppError::NotFound)?;
    Ok(Json(query))
}

pub async fn food_update_view(
    Path(id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
    JsonExtractor(data): JsonExtractor<FoodDeserializer>,
) -> Result<Json<Food>, AppError> {
    request_user.superuser_required()?;
    // let query = Food::get(&state.pool, &id).await?;
    let query = Food::update(&state.pool, &id, &data, &request_user.id).await?;
    Ok(Json(query))
}

pub async fn food_delete_view(
    Path(id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
) -> Result<Json<Food>, AppError> {
    request_user.superuser_required()?;
    // let query = Food::get(&state.pool, &id).await?;
    let query = Food::delete(&state.pool, &id).await?;
    Ok(Json(query))
}

pub async fn food_select_view(
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<FoodSelect>>, AppError> {
    let query = FoodSelect::all(&state.pool).await?;
    Ok(Json(query))
}

pub async fn food_delete_id_range_view(
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
    JsonExtractor(data): JsonExtractor<IdRange>,
) -> Result<Json<Vec<Food>>, AppError> {
    request_user.superuser_required()?;
    let query = Food::delete_id_range(&state.pool, data.id_range).await?;
    Ok(Json(query))
}
