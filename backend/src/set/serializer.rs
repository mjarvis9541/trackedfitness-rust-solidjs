use rust_decimal::Decimal;
use serde::Deserialize;
use uuid::Uuid;
use validator::Validate;

#[derive(Debug, Deserialize, Validate)]
pub struct SetInput {
    pub exercise_id: Uuid,
    pub order: i32,
    pub weight: Decimal,
    pub reps: i32,
    pub rest: Option<i64>,
    pub notes: Option<String>,
}

#[derive(Debug, Deserialize, Validate)]
pub struct SetRangeInput {
    pub exercise_id: Uuid,
    pub weight: Decimal,
    pub reps: i64,
    pub rest: Option<i64>,
    pub notes: String,
    pub set_count: i64,
}
