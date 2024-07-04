use rust_decimal::Decimal;
use serde::Deserialize;
use uuid::Uuid;
use validator::Validate;

use crate::util::validator::{
    validate_data_measurement, validate_max_quantity, validate_non_negative_decimal,
    validate_not_empty_string, validate_positive_int,
};

#[derive(Debug, Deserialize, Validate)]
pub struct FoodDeserializer {
    #[validate(
        length(min = 3, message = "Minimum of 3 characters"),
        length(max = 15, message = "Maximum of 15 characters"),
        custom(
            function = "validate_not_empty_string",
            message = "Food name must not be empty"
        )
    )]
    pub name: String,
    pub brand_id: Uuid,
    #[validate(custom(
        function = "validate_positive_int",
        message = "Must be a positive number"
    ))]
    pub data_value: i32,
    #[validate(custom(
        function = "validate_data_measurement",
        message = "Invalid data measurement"
    ))]
    pub data_measurement: String,
    #[validate(custom(
        function = "validate_positive_int",
        message = "Must be a positive number"
    ))]
    pub energy: i32,
    #[validate(
        custom(
            function = "validate_non_negative_decimal",
            message = "Quantity must be a minimum of 0.00"
        ),
        custom(
            function = "validate_max_quantity",
            message = "Quantity must be a maximum of 999.99"
        )
    )]
    pub fat: Decimal,
    #[validate(
        custom(
            function = "validate_non_negative_decimal",
            message = "Quantity must be a minimum of 0.00"
        ),
        custom(
            function = "validate_max_quantity",
            message = "Quantity must be a maximum of 999.99"
        )
    )]
    pub saturates: Decimal,
    #[validate(
        custom(
            function = "validate_non_negative_decimal",
            message = "Quantity must be a minimum of 0.00"
        ),
        custom(
            function = "validate_max_quantity",
            message = "Quantity must be a maximum of 999.99"
        )
    )]
    pub carbohydrate: Decimal,
    #[validate(
        custom(
            function = "validate_non_negative_decimal",
            message = "Quantity must be a minimum of 0.00"
        ),
        custom(
            function = "validate_max_quantity",
            message = "Quantity must be a maximum of 999.99"
        )
    )]
    pub sugars: Decimal,
    #[validate(
        custom(
            function = "validate_non_negative_decimal",
            message = "Quantity must be a minimum of 0.00"
        ),
        custom(
            function = "validate_max_quantity",
            message = "Quantity must be a maximum of 999.99"
        )
    )]
    pub fibre: Decimal,
    #[validate(
        custom(
            function = "validate_non_negative_decimal",
            message = "Quantity must be a minimum of 0.00"
        ),
        custom(
            function = "validate_max_quantity",
            message = "Quantity must be a maximum of 999.99"
        )
    )]
    pub protein: Decimal,
    #[validate(
        custom(
            function = "validate_non_negative_decimal",
            message = "Quantity must be a minimum of 0.00"
        ),
        custom(
            function = "validate_max_quantity",
            message = "Quantity must be a maximum of 999.99"
        )
    )]
    pub salt: Decimal,
}
