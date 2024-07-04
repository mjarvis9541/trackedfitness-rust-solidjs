use serde::Deserialize;
use validator::Validate;

#[derive(Debug, Deserialize, Validate)]
pub struct MealOfDayInput {
    pub name: String,
    pub ordering: i32,
}
