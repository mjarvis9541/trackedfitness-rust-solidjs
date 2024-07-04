use rust_decimal::Decimal;
use serde::Deserialize;
use uuid::Uuid;
use validator::{Validate, ValidationError};

#[derive(Debug, Deserialize, Validate)]
pub struct MealFoodInput {
    pub meal_id: Uuid,
    pub food_id: Uuid,
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

fn validate_min_quantity(value: &Decimal) -> Result<(), ValidationError> {
    let min = Decimal::new(1, 2);
    // dbg!(min);
    if value <= &min {
        return Err(ValidationError::new("min_quantity"));
    }
    Ok(())
}
fn validate_max_quantity(value: &Decimal) -> Result<(), ValidationError> {
    let max = Decimal::new(99999, 2);
    // dbg!(max);
    if value >= &max {
        return Err(ValidationError::new("max_quantity"));
    }
    Ok(())
}
