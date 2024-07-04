use rust_decimal::Decimal;
use validator::ValidationError;

use crate::food::model::DATA_MEASUREMENT_OPTS;

pub fn validate_not_empty_string(name: &str) -> Result<(), ValidationError> {
    if name.trim().is_empty() {
        return Err(ValidationError::new("not_empty"));
    };
    Ok(())
}

pub fn validate_min_quantity(value: &Decimal) -> Result<(), ValidationError> {
    let min = Decimal::new(1, 2);
    // dbg!(min);
    if value <= &min {
        return Err(ValidationError::new("min_quantity"));
    }
    Ok(())
}

pub fn validate_max_quantity(value: &Decimal) -> Result<(), ValidationError> {
    let max = Decimal::new(99999, 2);
    // dbg!(max);
    if value >= &max {
        return Err(ValidationError::new("max_quantity"));
    }
    Ok(())
}

pub fn validate_non_negative_decimal(value: &Decimal) -> Result<(), ValidationError> {
    // // dbg!(min);
    if value.is_sign_negative() {
        return Err(ValidationError::new("non_negative_decimal"));
    }
    Ok(())
}

pub fn validate_positive_int(value: i32) -> Result<(), ValidationError> {
    dbg!(value);
    if value <= 0 {
        return Err(ValidationError::new("positive_int"));
    }
    Ok(())
}

pub fn validate_data_measurement(value: &str) -> Result<(), ValidationError> {
    if !DATA_MEASUREMENT_OPTS.contains(&value) {
        return Err(ValidationError::new("invalid_data_measurement"));
    }
    Ok(())
}
