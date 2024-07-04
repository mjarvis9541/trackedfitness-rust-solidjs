use chrono::NaiveDate;
use serde::{de, Deserialize, Deserializer};
use std::{fmt, str::FromStr};
use uuid::Uuid;

pub fn empty_string_as_none<'de, D, T>(de: D) -> Result<Option<T>, D::Error>
where
    D: Deserializer<'de>,
    T: FromStr,
    T::Err: fmt::Display,
{
    let opt = Option::<String>::deserialize(de)?;
    match opt.as_deref() {
        None | Some("") => Ok(None),
        Some(s) => FromStr::from_str(s).map_err(de::Error::custom).map(Some),
    }
}

#[derive(Debug, Deserialize)]
#[allow(dead_code)]
pub struct QueryParams {
    #[serde(default, deserialize_with = "empty_string_as_none")]
    pub is_following: Option<Uuid>,
    #[serde(default, deserialize_with = "empty_string_as_none")]
    pub user_id: Option<Uuid>,
    #[serde(default, deserialize_with = "empty_string_as_none")]
    pub follower_id: Option<Uuid>,
    #[serde(default, deserialize_with = "empty_string_as_none")]
    pub meal_id: Option<Uuid>,
    #[serde(default, deserialize_with = "empty_string_as_none")]
    pub meal_of_day_id: Option<Uuid>,
    #[serde(default, deserialize_with = "empty_string_as_none")]
    pub username: Option<String>,
    #[serde(default, deserialize_with = "empty_string_as_none")]
    pub date: Option<NaiveDate>,
    #[serde(default, deserialize_with = "empty_string_as_none")]
    pub date_from: Option<NaiveDate>,
    #[serde(default, deserialize_with = "empty_string_as_none")]
    pub date_to: Option<NaiveDate>,
    #[serde(default, deserialize_with = "empty_string_as_none")]
    pub search: Option<String>,
    #[serde(default, deserialize_with = "empty_string_as_none")]
    pub brand: Option<String>,
    #[serde(default, deserialize_with = "empty_string_as_none")]
    pub serving: Option<String>,
    #[serde(default, deserialize_with = "empty_string_as_none")]
    pub order: Option<String>,
    #[serde(default, deserialize_with = "empty_string_as_none")]
    pub page: Option<i32>,
    #[serde(default, deserialize_with = "empty_string_as_none")]
    pub size: Option<i32>,
}
