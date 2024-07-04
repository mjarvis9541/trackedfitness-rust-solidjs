use axum::{
    extract::{Path, Query, State},
    Extension, Json,
};
use serde_json::{json, Value};
use std::sync::Arc;
use uuid::Uuid;

use crate::{
    error::AppError,
    extractor::{DBJsonExtractor, JsonExtractor},
    middleware::RequestUser,
    util::{extract::IdRange, query::QueryParams},
    AppState,
};

use super::{
    model::{Brand, BrandFilter, BrandListResponse, BrandSelect, BrandSerializer},
    serializer::BrandCreateSerializer,
};

pub async fn brand_list_view(
    Query(query): Query<QueryParams>,
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
) -> Result<Json<Value>, AppError> {
    request_user.superuser_required()?;
    let count = BrandSerializer::count(&state.pool, &query).await?;
    let query = BrandSerializer::builder(&state.pool, &query).await?;
    let response = json!({"count": count, "results": query});
    Ok(Json(response))
}

pub async fn brand_create_view(
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
    // ExtractSuperuser(request_user): ExtractSuperuser,
    DBJsonExtractor(data): DBJsonExtractor<BrandCreateSerializer>,
) -> Result<Json<Brand>, AppError> {
    request_user.superuser_required()?;
    let query = Brand::create(&state.pool, data, request_user.id).await?;
    Ok(Json(query))
}

pub async fn brand_detail_view(
    Path(slug): Path<String>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Brand>, AppError> {
    let query = Brand::get_from_slug(&state.pool, slug)
        .await?
        .ok_or(AppError::NotFound)?;
    Ok(Json(query))
}

pub async fn brand_update_view(
    Path(slug): Path<String>,
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
    JsonExtractor(data): JsonExtractor<BrandCreateSerializer>,
) -> Result<Json<Brand>, AppError> {
    request_user.superuser_required()?;
    let query = Brand::get_from_slug(&state.pool, slug)
        .await?
        .ok_or(AppError::NotFound)?;
    let query = Brand::update(&state.pool, query.id, data, request_user.id).await?;
    Ok(Json(query))
}

pub async fn brand_delete_view(
    Path(slug): Path<String>,
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
) -> Result<Json<Brand>, AppError> {
    request_user.superuser_required()?;
    let query = Brand::get_from_slug(&state.pool, slug)
        .await?
        .ok_or(AppError::NotFound)?;
    let result = Brand::delete(&state.pool, &query.id).await?;
    Ok(Json(result))
}

pub async fn brand_filter_view(
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<BrandFilter>>, AppError> {
    let query = BrandFilter::all(&state.pool).await?;
    Ok(Json(query))
}

pub async fn brand_select_view(
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<BrandSelect>>, AppError> {
    let query = BrandSelect::all(&state.pool).await?;
    Ok(Json(query))
}

pub async fn brand_delete_id_range_view(
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
    JsonExtractor(data): JsonExtractor<IdRange>,
) -> Result<Json<Vec<Brand>>, AppError> {
    request_user.superuser_required()?;
    let query = Brand::delete_id_range(&state.pool, data.id_range).await?;
    Ok(Json(query))
}

pub async fn admin_brand_detail_view(
    Path(id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Brand>, AppError> {
    let query = Brand::get(&state.pool, &id).await?;
    Ok(Json(query))
}

pub async fn admin_brand_update_view(
    Path(id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
    JsonExtractor(data): JsonExtractor<BrandCreateSerializer>,
) -> Result<Json<Brand>, AppError> {
    request_user.superuser_required()?;
    let query = Brand::get(&state.pool, &id).await?;
    let query = Brand::update(&state.pool, query.id, data, request_user.id).await?;
    Ok(Json(query))
}

pub async fn admin_brand_delete_view(
    Path(id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
) -> Result<Json<Brand>, AppError> {
    request_user.superuser_required()?;
    let query = Brand::get(&state.pool, &id).await?;
    let query = Brand::delete(&state.pool, &query.id).await?;
    Ok(Json(query))
}

pub async fn new_brand_list_view(
    Query(query): Query<QueryParams>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<BrandListResponse>, AppError> {
    let count = BrandSerializer::count(&state.pool, &query).await?;
    let results = BrandSerializer::builder(&state.pool, &query).await?;
    // dbg!(&query);
    // let response = json!({ "count": count, "results": results});
    let list_response = BrandListResponse { count, results };
    Ok(Json(list_response))
}
