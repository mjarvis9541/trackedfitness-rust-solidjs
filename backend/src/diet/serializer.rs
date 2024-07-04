use chrono::prelude::*;
use rust_decimal::Decimal;
use serde::Deserialize;
use uuid::Uuid;
use validator::Validate;

use crate::util::validator::{validate_max_quantity, validate_min_quantity};

#[derive(Debug, Deserialize, Validate)]
pub struct DietCreateInput {
    pub date: NaiveDate,
    pub username: String,
    pub food_id: Uuid,
    pub meal_of_day_id: Option<Uuid>,
    pub meal_of_day_slug: Option<String>,
    #[validate(
        custom(
            function = "validate_min_quantity",
            message = "Quantity must be a minimum of 0.01"
        ),
        custom(
            function = "validate_max_quantity",
            message = "Quantity must be a maximum of 999.99"
        )
    )]
    pub quantity: Decimal,
}

#[derive(Debug, Deserialize, Validate)]
pub struct DietUpdateInput {
    pub date: NaiveDate,
    pub username: String,
    pub food_id: Uuid,
    pub meal_of_day_id: Uuid,
    #[validate(
        custom(
            function = "validate_min_quantity",
            message = "Quantity must be a minimum of 0.01"
        ),
        custom(
            function = "validate_max_quantity",
            message = "Quantity must be a maximum of 999.99"
        )
    )]
    pub quantity: Decimal,
}

#[derive(Debug, Deserialize, Validate)]
pub struct DietFromMealInput {
    pub username: String,
    pub date: NaiveDate,
    pub meal_of_day_slug: String,
    pub meal_id: Uuid,
}
