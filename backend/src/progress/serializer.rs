use chrono::NaiveDate;
use rust_decimal::Decimal;
use serde::Deserialize;
use uuid::Uuid;
use validator::Validate;

#[derive(Debug, Deserialize, Validate)]
pub struct ProgressInput {
    pub user_id: Uuid,
    pub date: NaiveDate,
    pub weight_kg: Option<Decimal>,
    pub energy_burnt: Option<i32>,
    pub notes: Option<String>,
}

#[derive(Debug, Deserialize, Validate)]
pub struct ProgressUpdateInput {
    pub date: NaiveDate,
    pub weight_kg: Option<Decimal>,
    pub energy_burnt: Option<i32>,
    pub notes: Option<String>,
}
