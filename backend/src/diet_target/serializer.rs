use chrono::prelude::*;
use rust_decimal::Decimal;
use serde::Deserialize;
use uuid::Uuid;
use validator::{Validate, ValidationError};

#[derive(Debug, Deserialize, Validate)]
pub struct DietTargetCreateInput {
    pub user_id: Uuid,
    pub date: NaiveDate,
    #[validate(
        custom(
            function = "validate_non_negative_decimal",
            message = "Must be a positive number"
        ),
        custom(
            function = "validate_max_quantity_weight",
            message = "Must be a maximum of 1000.00"
        )
    )]
    pub weight: Decimal,
    // macros
    #[validate(
        custom(
            function = "validate_non_negative_decimal",
            message = "Must be a positive number"
        ),
        custom(
            function = "validate_max_quantity_per_kg",
            message = "Must be a maximum of 10.00"
        )
    )]
    pub protein_per_kg: Decimal,
    #[validate(
        custom(
            function = "validate_non_negative_decimal",
            message = "Must be a positive number"
        ),
        custom(
            function = "validate_max_quantity_per_kg",
            message = "Must be a maximum of 10.00"
        )
    )]
    pub carbohydrate_per_kg: Decimal,
    #[validate(
        custom(
            function = "validate_non_negative_decimal",
            message = "Must be a positive number"
        ),
        custom(
            function = "validate_max_quantity_per_kg",
            message = "Must be a maximum of 10.00"
        )
    )]
    pub fat_per_kg: Decimal,
}

pub fn validate_max_quantity_weight(value: &Decimal) -> Result<(), ValidationError> {
    let max = Decimal::new(100000, 2);
    dbg!(max);
    if value >= &max {
        return Err(ValidationError::new("max_quantity_weight"));
    }
    Ok(())
}
pub fn validate_max_quantity_per_kg(value: &Decimal) -> Result<(), ValidationError> {
    let max = Decimal::new(1000, 2);
    dbg!(max);
    if value >= &max {
        return Err(ValidationError::new("max_quantity_per_kg"));
    }
    Ok(())
}
pub fn validate_non_negative_decimal(value: &Decimal) -> Result<(), ValidationError> {
    if value.is_sign_negative() {
        return Err(ValidationError::new("non_negative_decimal"));
    }
    Ok(())
}

// new attempt

#[derive(Debug, Deserialize)]
pub struct DietTargetSerializer {
    pub user_id: Uuid,
    pub weight: Decimal,
}

impl DietTargetSerializer {
    fn validate_weight(&self) {
        todo!()
    }
}
