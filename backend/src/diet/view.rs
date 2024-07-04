use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    Extension, Json,
};
use chrono::prelude::*;
use rust_decimal::Decimal;
use serde_json::{json, Value};
use std::sync::Arc;
use uuid::Uuid;

use crate::{
    error::AppError,
    extractor::JsonExtractor,
    food::model::Food,
    meal_food::model::MealFood,
    meal_of_day::model::MealOfDay,
    middleware::RequestUser,
    user::model::User,
    util::{
        extract::{IdRange, UsernameDateRange},
        permission::user_privacy_check,
        query::QueryParams,
    },
    AppState,
};

use super::{
    diet_day_json::DietDayJSON,
    diet_meal_json::DietMealJSON,
    model::{DayTotal, Diet, DietDay, DietDayTotal, DietDetail, DietSerializer},
    serializer::{DietCreateInput, DietFromMealInput, DietUpdateInput},
};

pub async fn diet_list_view(
    Query(params): Query<QueryParams>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Value>, AppError> {
    let count = Diet::count(&state.pool, &params).await?;
    let query = Diet::all(&state.pool, params).await?;
    let response = json!({"count": count, "results": query});
    Ok(Json(response))
}

pub async fn diet_create_view(
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
    JsonExtractor(data): JsonExtractor<DietCreateInput>,
) -> Result<(StatusCode, Json<Diet>), AppError> {
    dbg!(&data);
    let user = User::get_from_username(&state.pool, &data.username)
        .await?
        .ok_or(AppError::APIBadRequest(format!(
            "User {} not found",
            data.username
        )))?;
    let food = Food::get_opt(&state.pool, &data.food_id)
        .await?
        .ok_or(AppError::APIBadRequest(format!(
            "Food {} not found",
            data.food_id
        )))?;
    let meal_of_day_id = if let Some(id) = data.meal_of_day_id {
        id
    } else {
        if let Some(slug) = data.meal_of_day_slug {
            MealOfDay::get_from_slug(&state.pool, &slug)
                .await?
                .ok_or(AppError::APIBadRequest(format!(
                    "Meal of day {} not found",
                    slug
                )))?
                .id
        } else {
            return Err(AppError::BadRequest);
        }
    };
    let quantity = match food.data_measurement.as_str() {
        "g" => data.quantity * Decimal::new(1, 2),
        "ml" => data.quantity * Decimal::new(1, 2),
        "srv" => data.quantity * Decimal::new(1, 0),
        _ => data.quantity * Decimal::new(1, 0),
    };
    let result = Diet::create(
        &state.pool,
        data.date,
        user.id,
        meal_of_day_id,
        food.id,
        quantity,
        request_user.id,
    )
    .await?;
    Ok((StatusCode::CREATED, Json(result)))
}

pub async fn diet_detail_view(
    Path(id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<DietDetail>, AppError> {
    let query = DietDetail::get(&state.pool, id)
        .await?
        .ok_or(AppError::NotFound)?;
    Ok(Json(query))
}

pub async fn diet_update_view(
    Path(id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
    JsonExtractor(data): JsonExtractor<DietUpdateInput>,
) -> Result<Json<Diet>, AppError> {
    let diet = Diet::get(&state.pool, &id)
        .await?
        .ok_or(AppError::NotFound)?;
    let user = User::get_from_username(&state.pool, &data.username)
        .await?
        .ok_or(AppError::APIBadRequest(format!(
            "User {:?} not found",
            data.username
        )))?;
    if request_user.id != user.id {
        return Err(AppError::BadRequestMessage(String::from(
            "You are unable to update another users food diary.",
        )));
    }
    let food = Food::get(&state.pool, &data.food_id).await?;
    let meal_of_day = MealOfDay::get(&state.pool, &data.meal_of_day_id).await?;
    let quantity = match food.data_measurement.as_str() {
        "g" => data.quantity * Decimal::new(1, 2),
        "ml" => data.quantity * Decimal::new(1, 2),
        "srv" => data.quantity * Decimal::new(1, 0),
        _ => data.quantity * Decimal::new(1, 0),
    };
    let result = Diet::update(
        &state.pool,
        diet.id,
        data.date,
        user.id,
        meal_of_day.id,
        food.id,
        quantity,
        request_user.id,
    )
    .await?;
    Ok(Json(result))
}

pub async fn diet_delete_view(
    Path(id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Diet>, AppError> {
    let result = Diet::get(&state.pool, &id)
        .await?
        .ok_or(AppError::NotFound)?;
    let result = Diet::delete(&state.pool, &result.id).await?;
    Ok(Json(result))
}

pub async fn diet_day_view(
    Path((username, date)): Path<(String, NaiveDate)>,
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
) -> Result<Json<DietDay>, AppError> {
    let user = User::get_from_username(&state.pool, &username)
        .await?
        .ok_or(AppError::NotFound)?;
    user_privacy_check(&state.pool, &request_user, &user).await?;
    let meal_of_day_list = MealOfDay::all(&state.pool).await?;
    let diet_list = DietSerializer::all(&state.pool, &user.id, &date).await?;
    let query = DietDay::build_dataset(username, date, meal_of_day_list, diet_list).await;
    Ok(Json(query))
}

pub async fn diet_day_total_list_view(
    Path((username, date)): Path<(String, NaiveDate)>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<DietDayTotal>>, AppError> {
    let query = DietDayTotal::stream(&state.pool, &username, &date).await?;
    Ok(Json(query))
}

pub async fn diet_week_total_detail_view(
    Path((username, date)): Path<(String, NaiveDate)>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<DietDayTotal>, AppError> {
    let query = DietDayTotal::week_total(&state.pool, &username, &date).await?;
    Ok(Json(query))
}

pub async fn diet_week_average_detail_view(
    Path((username, date)): Path<(String, NaiveDate)>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<DietDayTotal>, AppError> {
    let query = DietDayTotal::week_average(&state.pool, &username, &date).await?;
    Ok(Json(query))
}

pub async fn diet_create_from_meal_view(
    State(state): State<Arc<AppState>>,
    Extension(request_user): Extension<RequestUser>,
    JsonExtractor(data): JsonExtractor<DietFromMealInput>,
) -> Result<Json<Vec<Diet>>, AppError> {
    let user = User::get_from_username(&state.pool, &data.username)
        .await?
        .ok_or(AppError::NotFound)?;
    let meal_of_day = MealOfDay::get_from_slug(&state.pool, &data.meal_of_day_slug)
        .await?
        .ok_or(AppError::NotFound)?;
    let meal_food = MealFood::food_from_meal(&state.pool, &data.meal_id).await?;
    let query = Diet::create_from_meal_food(
        &state.pool,
        user.id,
        data.date,
        meal_of_day.id,
        meal_food,
        request_user.id,
    )
    .await?;
    Ok(Json(query))
}

pub async fn diet_day_month_list_view(
    Path((username, date)): Path<(String, NaiveDate)>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<DayTotal>>, AppError> {
    let user = User::get_from_username(&state.pool, &username)
        .await?
        .ok_or(AppError::NotFound)?;
    let query = DayTotal::all(&state.pool, user.id, &date).await?;
    Ok(Json(query))
}

pub async fn diet_delete_id_range_view(
    State(state): State<Arc<AppState>>,
    JsonExtractor(data): JsonExtractor<IdRange>,
) -> Result<Json<Vec<Diet>>, AppError> {
    let query = Diet::delete_id_range(&state.pool, data.id_range).await?;
    Ok(Json(query))
}

pub async fn diet_delete_date_range_view(
    State(state): State<Arc<AppState>>,
    JsonExtractor(data): JsonExtractor<UsernameDateRange>,
) -> Result<Json<Vec<Diet>>, AppError> {
    let user = User::get_from_username(&state.pool, &data.username)
        .await?
        .ok_or(AppError::NotFound)?;
    let query = Diet::delete_date_range(&state.pool, user.id, data.date_range).await?;
    Ok(Json(query))
}

pub async fn diet_meal_json_view(
    Query(params): Query<QueryParams>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<DietMealJSON>>, AppError> {
    let query = DietMealJSON::all(&state.pool, params).await?;
    Ok(Json(query))
}

pub async fn diet_day_json_view(
    Query(params): Query<QueryParams>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<DietDayJSON>>, AppError> {
    let query = DietDayJSON::all(&state.pool, params).await?;
    if query.is_empty() {
        return Ok(Json(DietDayJSON::empty(&state.pool).await?));
    }
    Ok(Json(query))
}
