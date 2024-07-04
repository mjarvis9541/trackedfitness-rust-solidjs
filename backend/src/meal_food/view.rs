use axum::{
    extract::{Path, Query, State},
    Extension, Json,
};
use rust_decimal::Decimal;
use serde_json::{json, Value};
use std::sync::Arc;
use uuid::Uuid;

use crate::{
    error::AppError,
    extractor::JsonExtractor,
    food::model::Food,
    middleware::RequestUser,
    util::{extract::IdRange, query::QueryParams},
    AppState,
};

use super::{
    model::{MealFood, MealFoodDetail},
    serializer::MealFoodInput,
};

pub async fn meal_food_list_view(
    Query(params): Query<QueryParams>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Value>, AppError> {
    let count = MealFood::count(&state.pool, &params).await?;
    let query = MealFood::all(&state.pool, &params).await?;
    let response = json!({"count": count, "results": query});
    Ok(Json(response))
}

pub async fn meal_food_create_view(
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
    JsonExtractor(data): JsonExtractor<MealFoodInput>,
) -> Result<Json<MealFood>, AppError> {
    let food = Food::get(&state.pool, &data.food_id).await?;
    let quantity = match food.data_measurement.as_str() {
        "g" => data.quantity * Decimal::new(1, 2),
        "ml" => data.quantity * Decimal::new(1, 2),
        "srv" => data.quantity * Decimal::new(1, 0),
        _ => data.quantity * Decimal::new(1, 0),
    };
    let query = MealFood::create(
        &state.pool,
        data.meal_id,
        data.food_id,
        quantity,
        request_user.id,
    )
    .await?;
    Ok(Json(query))
}

pub async fn meal_food_detail_view(
    Path(id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<MealFoodDetail>, AppError> {
    let query = MealFoodDetail::get(&state.pool, &id)
        .await?
        .ok_or(AppError::NotFound)?;
    Ok(Json(query))
}

pub async fn meal_food_update_view(
    Path(id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
    JsonExtractor(data): JsonExtractor<MealFoodInput>,
) -> Result<Json<MealFood>, AppError> {
    let food = Food::get(&state.pool, &data.food_id).await?;
    let quantity = match food.data_measurement.as_str() {
        "g" => data.quantity * Decimal::new(1, 2),
        "ml" => data.quantity * Decimal::new(1, 2),
        "srv" => data.quantity * Decimal::new(1, 0),
        _ => data.quantity * Decimal::new(1, 0),
    };
    let query = MealFood::get(&state.pool, &id).await?;
    let query = MealFood::update(
        &state.pool,
        query.id,
        data.meal_id,
        data.food_id,
        quantity,
        request_user.id,
    )
    .await?;
    Ok(Json(query))
}

pub async fn meal_food_delete_view(
    Path(id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<MealFood>, AppError> {
    let query = MealFood::get(&state.pool, &id).await?;
    let query = MealFood::delete(&state.pool, &query.id).await?;
    Ok(Json(query))
}

pub async fn meal_food_delete_id_range_view(
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
    JsonExtractor(data): JsonExtractor<IdRange>,
) -> Result<Json<Vec<MealFood>>, AppError> {
    request_user.superuser_required()?;
    let query = MealFood::delete_id_range(&state.pool, data.id_range).await?;
    Ok(Json(query))
}
