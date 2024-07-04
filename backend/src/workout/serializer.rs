use chrono::NaiveDate;
use serde::Deserialize;
use uuid::Uuid;
use validator::Validate;

#[derive(Debug, Deserialize, Validate)]
pub struct WorkoutInput {
    pub user_id: Uuid,
    pub date: NaiveDate,
}
