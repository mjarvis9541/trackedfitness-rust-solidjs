use axum::{
    extract::{Path, Query, State},
    Extension, Json,
};
use serde_json::{json, Value};
use std::sync::Arc;
use uuid::Uuid;

use crate::{
    error::AppError,
    extractor::{ExtractSuperuser, JsonExtractor},
    middleware::RequestUser,
    util::{extract::IdRange, query::QueryParams},
    AppState,
};

use super::{
    model::UserSerializer,
    model::{User, UserHeaderQuery, UserSelect},
    serializer::{AdminUpdateInput, CreateUserSerializer},
    stats::UserStats,
};

pub async fn user_list_view(
    Query(params): Query<QueryParams>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Value>, AppError> {
    let count = UserSerializer::count(&state.pool, &params).await?;
    let query = UserSerializer::all(&state.pool, &params).await?;
    let response = json!({"count": count, "results": query});
    Ok(Json(response))
}

pub async fn user_create_view(
    State(state): State<Arc<AppState>>,
    ExtractSuperuser(_request_user): ExtractSuperuser,
    JsonExtractor(data): JsonExtractor<CreateUserSerializer>,
) -> Result<Json<User>, AppError> {
    let query = User::create(&state.pool, data).await?;
    Ok(Json(query))
}

pub async fn user_detail_view(
    Path(username): Path<String>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<User>, AppError> {
    let query = User::get_from_username(&state.pool, &username)
        .await?
        .ok_or(AppError::NotFound)?;
    Ok(Json(query))
}

pub async fn user_update_view(
    Path(username): Path<String>,
    State(state): State<Arc<AppState>>,
    JsonExtractor(data): JsonExtractor<AdminUpdateInput>,
) -> Result<Json<User>, AppError> {
    let query = User::get_from_username(&state.pool, &username)
        .await?
        .ok_or(AppError::NotFound)?;
    let query = User::update(&state.pool, data, query.id).await?;
    Ok(Json(query))
}

pub async fn user_delete_view(
    Path(username): Path<String>,
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
) -> Result<Json<User>, AppError> {
    request_user.superuser_required()?;
    let query = User::get_from_username(&state.pool, &username)
        .await?
        .ok_or(AppError::NotFound)?;
    let query = User::delete(&state.pool, &query.id).await?;
    Ok(Json(query))
}

pub async fn user_delete_id_range_view(
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
    JsonExtractor(data): JsonExtractor<IdRange>,
) -> Result<Json<Vec<User>>, AppError> {
    request_user.superuser_required()?;
    let query = User::delete_id_range(&state.pool, data.id_range).await?;
    Ok(Json(query))
}

pub async fn user_select_view(
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<UserSelect>>, AppError> {
    let query = UserSelect::all(&state.pool).await?;
    Ok(Json(query))
}

pub async fn admin_user_detail_view(
    Path(id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<User>, AppError> {
    let query = User::get(&state.pool, &id).await?;
    Ok(Json(query))
}

pub async fn admin_user_update_view(
    Path(id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
    JsonExtractor(data): JsonExtractor<AdminUpdateInput>,
) -> Result<Json<User>, AppError> {
    // request_user.superuser_required()?;
    let query = User::update(&state.pool, data, id).await?;
    Ok(Json(query))
}

pub async fn admin_user_delete_view(
    Path(id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
) -> Result<Json<User>, AppError> {
    request_user.superuser_required()?;
    // let query = User::get(&state.pool, &id).await?;
    let query = User::delete(&state.pool, &id).await?;
    Ok(Json(query))
}

pub async fn user_header_view(
    Path(username): Path<String>,
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
) -> Result<Json<UserHeaderQuery>, AppError> {
    let user = User::get_from_username(&state.pool, &username)
        .await?
        .ok_or(AppError::NotFound)?;
    let query =
        UserHeaderQuery::follower_summary(&state.pool, &username, &user.id, &request_user.id)
            .await?
            .ok_or(AppError::NotFound)?;
    Ok(Json(query))
}

pub async fn user_stats_list_view(
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<UserStats>>, AppError> {
    let query = UserStats::all(&state.pool).await?;
    Ok(Json(query))
}

pub async fn user_stats_detail_view(
    Path(id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<UserStats>, AppError> {
    let query = UserStats::get(&state.pool, &id).await?;
    Ok(Json(query))
}
