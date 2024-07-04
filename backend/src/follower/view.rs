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
    model::{Follower, FollowerSerializer},
    serializer::FollowerInput,
};

pub async fn follower_list_view(
    Query(params): Query<QueryParams>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Value>, AppError> {
    let count = FollowerSerializer::count(&state.pool, &params).await?;
    let query = FollowerSerializer::all(&state.pool, &params).await?;
    let response = json!({"count": count, "results": query});
    Ok(Json(response))
}

pub async fn follower_create_view(
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
    JsonExtractor(data): JsonExtractor<FollowerInput>,
) -> Result<Json<Follower>, AppError> {
    request_user.superuser_required()?;
    let query =
        Follower::create(&state.pool, &data.user_id, &data.follower_id, data.status).await?;
    Ok(Json(query))
}

pub async fn follower_detail_view(
    Path(id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Follower>, AppError> {
    let query = Follower::get(&state.pool, &id).await?;
    Ok(Json(query))
}

pub async fn follower_update_view(
    Path(id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
    JsonExtractor(data): JsonExtractor<FollowerInput>,
) -> Result<Json<Follower>, AppError> {
    request_user.superuser_required()?;
    let query = Follower::get(&state.pool, &id).await?;
    let query = Follower::update(
        &state.pool,
        &query.id,
        &data.user_id,
        &data.follower_id,
        data.status,
    )
    .await?;
    Ok(Json(query))
}

pub async fn follower_delete_view(
    Path(id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
) -> Result<Json<Follower>, AppError> {
    request_user.superuser_required()?;
    let query = Follower::delete(&state.pool, &id).await?;
    Ok(Json(query))
}

pub async fn follower_delete_id_range_view(
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
    JsonExtractor(data): JsonExtractor<IdRange>,
) -> Result<Json<Vec<Follower>>, AppError> {
    request_user.superuser_required()?;
    let query = Follower::delete_id_range(&state.pool, data.id_range).await?;
    Ok(Json(query))
}
