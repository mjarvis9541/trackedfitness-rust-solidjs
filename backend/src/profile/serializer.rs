use chrono::NaiveDate;
use rust_decimal::Decimal;
use serde::Deserialize;
use uuid::Uuid;
use validator::Validate;

#[derive(Debug, Deserialize, Validate)]
pub struct ProfileInput {
    pub user_id: Uuid,
    pub sex: String,
    pub height: Decimal,
    pub weight: Decimal,
    pub date_of_birth: NaiveDate,
    pub fitness_goal: String,
    pub activity_level: String,
}

#[derive(Debug, Deserialize, Validate)]
pub struct ProfileUpdateInput {
    pub user_id: Uuid,
    pub sex: String,
    pub height: Decimal,
    pub date_of_birth: NaiveDate,
    pub fitness_goal: String,
    pub activity_level: String,
}
