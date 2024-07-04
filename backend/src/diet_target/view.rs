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
    model::{DietTarget, DietTargetSerializer},
    serializer::DietTargetCreateInput,
};

pub async fn diet_target_list_view(
    Query(params): Query<QueryParams>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Value>, AppError> {
    let count = DietTarget::count(&state.pool, &params).await?;
    let query = DietTarget::admin_all(&state.pool, &params).await?;
    let response = json!({"count": count, "results": query});
    Ok(Json(response))
}

pub async fn diet_target_create_view(
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
    JsonExtractor(data): JsonExtractor<DietTargetCreateInput>,
) -> Result<Json<DietTarget>, AppError> {
    let existing =
        DietTarget::get_from_user_id_date(&state.pool, &data.user_id, &data.date).await?;
    if existing.is_some() {
        return Err(AppError::APIBadRequest(format!("Duplicate entity")));
    }
    let query = DietTarget::create(&state.pool, data, &request_user.id).await?;
    Ok(Json(query))
}

pub async fn diet_target_detail_view(
    Path(id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<DietTargetSerializer>, AppError> {
    let query = DietTargetSerializer::admin_get(&state.pool, &id).await?;
    Ok(Json(query))
}

pub async fn diet_target_update_view(
    Path(id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
    JsonExtractor(data): JsonExtractor<DietTargetCreateInput>,
) -> Result<Json<DietTarget>, AppError> {
    let existing =
        DietTarget::get_from_user_id_date(&state.pool, &data.user_id, &data.date).await?;
    if existing.is_some() {
        return Err(AppError::APIBadRequest(format!("Duplicate entity")));
    }
    let query = DietTarget::admin_get(&state.pool, &id).await?;
    let query = DietTarget::update(&state.pool, &query.id, &data, &request_user.id).await?;
    Ok(Json(query))
}

pub async fn diet_target_delete_view(
    Path(id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<DietTarget>, AppError> {
    let query = DietTarget::delete(&state.pool, &id).await?;
    Ok(Json(query))
}

/// user views
pub async fn user_diet_target_list_view(
    Path(username): Path<String>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<DietTarget>>, AppError> {
    let user = User::get_from_username(&state.pool, &username)
        .await?
        .ok_or(AppError::NotFound)?;
    let query = DietTarget::all(&state.pool, &user.id).await?;
    Ok(Json(query))
}

pub async fn user_diet_target_detail_view(
    Path((username, date)): Path<(String, NaiveDate)>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<DietTargetSerializer>, AppError> {
    let query = DietTargetSerializer::get(&state.pool, &username, &date)
        .await?
        .ok_or(AppError::NotFound)?;
    Ok(Json(query))
}

pub async fn user_diet_target_update_view(
    Path((username, date)): Path<(String, NaiveDate)>,
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
    JsonExtractor(data): JsonExtractor<DietTargetCreateInput>,
) -> Result<Json<DietTarget>, AppError> {
    let query = DietTarget::get(&state.pool, &username, &date)
        .await?
        .ok_or(AppError::NotFound)?;
    let query = DietTarget::update(&state.pool, &query.id, &data, &request_user.id).await?;
    Ok(Json(query))
}

pub async fn user_diet_target_delete_view(
    Path((username, date)): Path<(String, NaiveDate)>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<DietTarget>, AppError> {
    let query = DietTarget::get(&state.pool, &username, &date)
        .await?
        .ok_or(AppError::NotFound)?;
    let result = DietTarget::delete(&state.pool, &query.id).await?;
    Ok(Json(result))
}

pub async fn user_diet_target_week_list_view(
    Path((username, date)): Path<(String, NaiveDate)>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<DietTargetSerializer>>, AppError> {
    let result = DietTargetSerializer::week(&state.pool, &username, &date).await?;
    Ok(Json(result))
}

pub async fn user_diet_target_week_total_view(
    Path((username, date)): Path<(String, NaiveDate)>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<DietTargetSerializer>, AppError> {
    let result = DietTargetSerializer::week_total(&state.pool, &username, &date).await?;
    Ok(Json(result))
}

pub async fn user_diet_target_week_average_view(
    Path((username, date)): Path<(String, NaiveDate)>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<DietTargetSerializer>, AppError> {
    let result = DietTargetSerializer::week_average(&state.pool, &username, &date).await?;
    Ok(Json(result))
}

pub async fn user_diet_target_detail_latest_view(
    Path((username, date)): Path<(String, NaiveDate)>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Option<DietTargetSerializer>>, AppError> {
    let query = DietTargetSerializer::get_latest(&state.pool, &username, &date).await?;
    Ok(Json(query))
}

pub async fn diet_target_delete_id_range_view(
    State(state): State<Arc<AppState>>,
    JsonExtractor(data): JsonExtractor<IdRange>,
) -> Result<Json<Vec<DietTarget>>, AppError> {
    let query = DietTarget::delete_id_range(&state.pool, data.id_range).await?;
    Ok(Json(query))
}

pub async fn diet_target_delete_date_range_view(
    State(state): State<Arc<AppState>>,
    JsonExtractor(data): JsonExtractor<UsernameDateRange>,
) -> Result<Json<Vec<DietTarget>>, AppError> {
    let user = User::get_from_username(&state.pool, &data.username)
        .await?
        .ok_or(AppError::NotFound)?;
    let query = DietTarget::delete_date_range(&state.pool, user.id, data.date_range).await?;
    Ok(Json(query))
}
