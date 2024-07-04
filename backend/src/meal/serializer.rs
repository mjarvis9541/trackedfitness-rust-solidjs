use serde::Deserialize;
use uuid::Uuid;
use validator::Validate;

use crate::util::validator::validate_not_empty_string;

#[derive(Debug, Deserialize, Validate)]
pub struct MealAPIInput {
    pub user_id: Uuid,
    #[validate(
        length(min = 3, message = "Minimum of 3 characters"),
        length(max = 15, message = "Maximum of 15 characters"),
        custom(
            function = "validate_not_empty_string",
            message = "Name must not be empty"
        )
    )]
    pub name: String,
}

#[derive(Debug, Deserialize, Validate)]
pub struct MealFromDietInput {
    #[validate(
        length(min = 3, message = "Minimum of 3 characters"),
        length(max = 15, message = "Maximum of 15 characters"),
        custom(
            function = "validate_not_empty_string",
            message = "Food name must not be empty"
        )
    )]
    pub username: String,
    #[validate(
        length(min = 3, message = "Minimum of 3 characters"),
        length(max = 15, message = "Maximum of 15 characters"),
        custom(
            function = "validate_not_empty_string",
            message = "Food name must not be empty"
        )
    )]
    pub name: String,
    pub id_range: Vec<Uuid>,
}
