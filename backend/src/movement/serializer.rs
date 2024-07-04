use serde::Deserialize;
use uuid::Uuid;
use validator::{Validate, ValidationError};

#[derive(Debug, Deserialize, Validate)]
pub struct MovementInput {
    #[validate(
        length(min = 3, message = "Minimum of 3 characters"),
        length(max = 15, message = "Maximum of 15 characters"),
        custom(
            function = "validate_not_empty_string",
            message = "Field must not be empty"
        )
    )]
    pub name: String,
    pub muscle_group_id: Uuid,
}

pub fn validate_not_empty_string(name: &str) -> Result<(), ValidationError> {
    if name.trim().is_empty() {
        return Err(ValidationError::new("not_empty"));
    };
    Ok(())
}