use async_trait::async_trait;
use serde::Deserialize;
use sqlx::PgPool;
use validator::{Validate, ValidationError};

use crate::error::AppError;
use crate::util::validator::validate_not_empty_string;

use super::model::Brand;

#[async_trait]
pub trait DatabaseValidation {
    async fn db_validate(&self, pool: &PgPool) -> Result<(), AppError>;
}

#[derive(Debug, Deserialize, Validate)]
pub struct BrandCreateSerializer {
    #[validate(
        length(min = 3, message = "Minimum of 3 characters"),
        length(max = 15, message = "Maximum of 15 characters"),
        custom(function = "validate_brand_name", message = "Invalid brand name"),
        custom(
            function = "validate_not_empty_string",
            message = "Brand name must not be empty"
        )
    )]
    pub name: String,
    #[validate(length(min = 3, message = "Minimum of 3 characters"))]
    pub image_url: Option<String>,
}

fn validate_brand_name(name: &str) -> Result<(), ValidationError> {
    if name == "michael" {
        return Err(ValidationError::new("unique_brand_name"));
    };
    Ok(())
}

#[async_trait]
impl DatabaseValidation for BrandCreateSerializer {
    async fn db_validate(&self, pool: &PgPool) -> Result<(), AppError> {
        let q = Brand::check_unique_field(pool, &self.name).await?;

        if let Some(brand) = q {
            return Err(AppError::DBValidate(format!(
                "brand already exists - {:?}",
                brand.id,
            )));
        }

        Ok(())
    }
}
