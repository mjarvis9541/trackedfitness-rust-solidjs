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
    progress::model::Progress,
    user::model::User,
    util::{extract::IdRange, query::QueryParams},
    AppState,
};

use super::{
    model::{Profile, ProfileMetric, ProfileSerializer},
    serializer::{ProfileInput, ProfileUpdateInput},
};

pub async fn profile_list_view(
    Query(params): Query<QueryParams>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Value>, AppError> {
    let count = Profile::count(&state.pool, &params).await?;
    let query = Profile::all(&state.pool, &params).await?;
    let response = json!({"count": count, "results": query});
    Ok(Json(response))
}

pub async fn profile_create_view(
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
    JsonExtractor(data): JsonExtractor<ProfileInput>,
) -> Result<Json<Profile>, AppError> {
    let now = Utc::now().date_naive();
    let user = User::get(&state.pool, &data.user_id).await?;
    let progress = Progress::get_by_username_date(&state.pool, user.username, &now).await?;
    if progress.is_none() {
        sqlx::query(
            "INSERT INTO progress (user_id, date, weight_kg, created_by_id) VALUES ($1, $2, $3, $4) RETURNING *"
        )
        .bind(user.id)
        .bind(now)
        .bind(data.weight)
        .bind(request_user.id)
        .fetch_all(&state.pool)
        .await?;
    }
    let query = Profile::create(&state.pool, data.user_id, data, request_user.id).await?;
    Ok(Json(query))
}

pub async fn profile_detail_view(
    Path(username): Path<String>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<ProfileMetric>, AppError> {
    let user = User::get_from_username(&state.pool, &username)
        .await?
        .ok_or(AppError::NotFound)?;
    let query = ProfileSerializer::get(&state.pool, &user.id, None)
        .await?
        .ok_or(AppError::NotFound)?;
    Ok(Json(query.into_metric()))
}

pub async fn profile_update_view(
    Path(username): Path<String>,
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
    JsonExtractor(data): JsonExtractor<ProfileUpdateInput>,
) -> Result<Json<Profile>, AppError> {
    let user = User::get_from_username(&state.pool, &username)
        .await?
        .ok_or(AppError::NotFound)?;
    let query = ProfileSerializer::get(&state.pool, &user.id, None)
        .await?
        .ok_or(AppError::NotFound)?;
    let query = Profile::update(&state.pool, query.id, data, request_user.id).await?;
    Ok(Json(query))
}

pub async fn profile_delete_view(
    Path(username): Path<String>,
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
) -> Result<Json<Profile>, AppError> {
    request_user.superuser_required()?;
    let user = User::get_from_username(&state.pool, &username)
        .await?
        .ok_or(AppError::NotFound)?;
    let query = ProfileSerializer::get(&state.pool, &user.id, None)
        .await?
        .ok_or(AppError::NotFound)?;
    let result = Profile::delete(&state.pool, query.id).await?;
    Ok(Json(result))
}

pub async fn profile_date_detail_view(
    Path((username, date)): Path<(String, NaiveDate)>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<ProfileMetric>, AppError> {
    let user = User::get_from_username(&state.pool, &username)
        .await?
        .ok_or(AppError::NotFound)?;
    let query = ProfileSerializer::get(&state.pool, &user.id, Some(date))
        .await?
        .ok_or(AppError::NotFound)?;
    Ok(Json(query.into_metric()))
}

pub async fn profile_delete_id_range_view(
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
    JsonExtractor(data): JsonExtractor<IdRange>,
) -> Result<Json<Vec<Profile>>, AppError> {
    request_user.superuser_required()?;
    let query = Profile::delete_id_range(&state.pool, data.id_range).await?;
    Ok(Json(query))
}

pub async fn admin_profile_detail_view(
    Path(id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Profile>, AppError> {
    let query = Profile::get(&state.pool, id).await?;
    Ok(Json(query))
}

pub async fn admin_profile_update_view(
    Path(id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
    JsonExtractor(data): JsonExtractor<ProfileUpdateInput>,
) -> Result<Json<Profile>, AppError> {
    request_user.superuser_required()?;
    let query = Profile::update(&state.pool, id, data, request_user.id).await?;
    Ok(Json(query))
}

pub async fn admin_profile_delete_view(
    Path(id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
) -> Result<Json<Profile>, AppError> {
    request_user.superuser_required()?;
    let query = Profile::delete(&state.pool, id).await?;
    Ok(Json(query))
}
