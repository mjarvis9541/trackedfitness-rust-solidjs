use chrono::prelude::*;
use serde::Deserialize;
use uuid::Uuid;
use validator::Validate;

#[derive(Debug, Deserialize, Validate)]
pub struct IdRange {
    #[validate(length(min = 1))]
    pub id_range: Vec<Uuid>,
}

#[derive(Debug, Deserialize, Validate)]
pub struct UsernameDateRange {
    pub username: String,
    pub date_range: Vec<NaiveDate>,
}
