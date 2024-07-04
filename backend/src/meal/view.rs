use axum::{
    extract::{Path, Query, State},
    Extension, Json,
};
use serde_json::{json, Value};
use std::sync::Arc;
use uuid::Uuid;

use crate::{
    diet::model::Diet,
    error::AppError,
    extractor::JsonExtractor,
    meal_food::model::MealFood,
    middleware::RequestUser,
    user::model::User,
    util::{extract::IdRange, query::QueryParams},
    AppState,
};

use super::{
    meal_json::MealJSON,
    model::{Meal, MealFilter, MealFoodSerializer, MealSelect, MealSerializer, SavedMeal},
    serializer::{MealAPIInput, MealFromDietInput},
};

pub async fn meal_list_view(
    Query(params): Query<QueryParams>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Value>, AppError> {
    let count = MealSerializer::count(&state.pool, &params).await?;
    let query = MealSerializer::all(&state.pool, params).await?;
    let response = json!({"count": count, "results": query});
    Ok(Json(response))
}

pub async fn meal_create_view(
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
    JsonExtractor(data): JsonExtractor<MealAPIInput>,
) -> Result<Json<Meal>, AppError> {
    let query = Meal::create(&state.pool, data.user_id, data.name, request_user.id).await?;
    Ok(Json(query))
}

pub async fn meal_detail_view(
    Path(id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Meal>, AppError> {
    let query = Meal::get(&state.pool, &id).await?;
    Ok(Json(query))
}

pub async fn meal_update_view(
    Path(id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
    JsonExtractor(data): JsonExtractor<MealAPIInput>,
) -> Result<Json<Meal>, AppError> {
    let query = Meal::get(&state.pool, &id).await?;
    let query = Meal::update(
        &state.pool,
        query.id,
        data.user_id,
        data.name,
        request_user.id,
    )
    .await?;
    Ok(Json(query))
}

pub async fn meal_delete_view(
    Path(id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Meal>, AppError> {
    let query = Meal::get(&state.pool, &id).await?;
    let query = Meal::delete(&state.pool, &query.id).await?;
    Ok(Json(query))
}

pub async fn meal_food_list_view(
    Path(id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<SavedMeal>, AppError> {
    let query = MealFoodSerializer::all(&state.pool, &id).await?;
    let response = SavedMeal::build_frontend_data(query).await;
    Ok(Json(response))
}

pub async fn meal_filter_view(
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<MealFilter>>, AppError> {
    let query = MealFilter::stream(&state.pool).await?;
    Ok(Json(query))
}

pub async fn meal_select_view(
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<MealSelect>>, AppError> {
    let query = MealSelect::stream(&state.pool).await?;
    Ok(Json(query))
}

pub async fn meal_create_from_diet_view(
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
    JsonExtractor(data): JsonExtractor<MealFromDietInput>,
) -> Result<Json<Meal>, AppError> {
    let user = User::get_from_username(&state.pool, &data.username)
        .await?
        .ok_or(AppError::NotFound)?;
    let diet_list = Diet::from_id_range(&state.pool, data.id_range).await?;
    let meal = Meal::create(&state.pool, user.id, data.name, request_user.id).await?;
    MealFood::create_from_diet_range(&state.pool, meal.id, diet_list, request_user.id).await?;
    Ok(Json(meal))
}

pub async fn meal_delete_id_range_view(
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
    JsonExtractor(data): JsonExtractor<IdRange>,
) -> Result<Json<Vec<Meal>>, AppError> {
    request_user.superuser_required()?;
    let query = Meal::delete_id_range(&state.pool, data.id_range).await?;
    Ok(Json(query))
}

pub async fn meal_json_view(
    Query(params): Query<QueryParams>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<MealJSON>>, AppError> {
    let query = MealJSON::all(&state.pool, params).await?;
    Ok(Json(query))
}
