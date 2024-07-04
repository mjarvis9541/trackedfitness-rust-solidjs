use rust_decimal::Decimal;
use serde::Deserialize;
use uuid::Uuid;
use validator::Validate;

#[derive(Debug, Deserialize, Validate)]
pub struct ExerciseInput {
    pub workout_id: Uuid,
    pub movement_id: Uuid,
}

#[derive(Debug, Deserialize, Validate)]
pub struct ExerciseSetInput {
    pub workout_id: Uuid,
    pub movement_id: Uuid,
    pub weight: Decimal,
    pub reps: i32,
    pub rest: i32,
    pub set_count: i32,
}
