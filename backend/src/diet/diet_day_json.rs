use chrono::prelude::*;
use futures::TryStreamExt;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, PgPool};
use uuid::Uuid;

use crate::util::query::QueryParams;

// const ORDERING_FIELDS: &[&str] = &["date", "user_id", "created_at", "updated_at"];

#[derive(Debug, Default, Deserialize, Serialize, FromRow)]
pub struct DietFoodJSON {
    pub diet_id: Option<Uuid>,
    pub food_name: Option<String>,
    pub brand_name: Option<String>,
    pub data_value: Option<Decimal>,
    pub data_measurement: Option<String>,
    pub energy: Option<Decimal>,
    pub protein: Option<Decimal>,
    pub carbohydrate: Option<Decimal>,
    pub fat: Option<Decimal>,
    pub saturates: Option<Decimal>,
    pub sugars: Option<Decimal>,
    pub fibre: Option<Decimal>,
    pub salt: Option<Decimal>,
}

#[derive(Debug, Default, Deserialize, Serialize, FromRow)]
pub struct DietMealJSON {
    pub meal_of_day_id: Uuid,
    pub meal_of_day_name: String,
    pub meal_of_day_slug: String,
    pub meal_of_day_order: i32,
    pub energy: Decimal,
    pub protein: Decimal,
    pub carbohydrate: Decimal,
    pub fat: Decimal,
    pub saturates: Decimal,
    pub sugars: Decimal,
    pub fibre: Decimal,
    pub salt: Decimal,
    pub diet_food: Option<sqlx::types::Json<Option<Vec<DietFoodJSON>>>>,
}

#[derive(Debug, Default, Deserialize, Serialize, FromRow)]
pub struct DietDayJSON {
    pub user_id: Uuid,
    pub date: NaiveDate,
    pub username: String,
    pub energy: Decimal,
    pub protein: Decimal,
    pub carbohydrate: Decimal,
    pub fat: Decimal,
    pub saturates: Decimal,
    pub sugars: Decimal,
    pub fibre: Decimal,
    pub salt: Decimal,
    pub protein_pct: Decimal,
    pub carbohydrate_pct: Decimal,
    pub fat_pct: Decimal,
    pub latest_weight: Option<Decimal>,
    pub latest_weight_date: Option<NaiveDate>,
    pub energy_per_kg: Option<Decimal>,
    pub protein_per_kg: Option<Decimal>,
    pub carbohydrate_per_kg: Option<Decimal>,
    pub fat_per_kg: Option<Decimal>,
    pub diet_meals: sqlx::types::Json<Vec<DietMealJSON>>,
}

impl DietDayJSON {
    pub async fn all(pool: &PgPool, query: QueryParams) -> Result<Vec<Self>, sqlx::Error> {
        let mut stream = Vec::new();
        let mut q = sqlx::QueryBuilder::new(
            "
            SELECT
            t1.user_id,
            t1.date,
            t3.username,
            SUM(t1.quantity * t2.energy) AS energy,
            SUM(t1.quantity * t2.protein) AS protein,
            SUM(t1.quantity * t2.carbohydrate) AS carbohydrate,
            SUM(t1.quantity * t2.fat) AS fat,
            SUM(t1.quantity * t2.saturates) AS saturates,
            SUM(t1.quantity * t2.sugars) AS sugars,
            SUM(t1.quantity * t2.fibre) AS fibre,
            SUM(t1.quantity * t2.salt) AS salt,
            SUM(t1.quantity * t2.protein * 4) / SUM(t1.quantity * t2.energy) * 100 AS protein_pct,
            SUM(t1.quantity * t2.carbohydrate * 4) / SUM(t1.quantity * t2.energy) * 100 AS carbohydrate_pct,
            SUM(t1.quantity * t2.fat * 9) / SUM(t1.quantity * t2.energy) * 100 AS fat_pct,
            SUM(t1.quantity * t2.energy) / p1.weight_kg AS energy_per_kg,
            SUM(t1.quantity * t2.protein) / p1.weight_kg AS protein_per_kg,
            SUM(t1.quantity * t2.carbohydrate) / p1.weight_kg AS carbohydrate_per_kg,
            SUM(t1.quantity * t2.fat) / p1.weight_kg AS fat_per_kg,
            p1.weight_kg as latest_weight,
            p1.date as latest_weight_date,
            (
                SELECT
                    JSON_AGG(meal)
                FROM
                    (
                        SELECT
                            m1.id AS meal_of_day_id,
                            m1.name AS meal_of_day_name,
                            m1.slug AS meal_of_day_slug,
                            m1.ordering AS meal_of_day_order,
                            COALESCE(SUM(m2.quantity * m3.energy), 0) AS energy,
                            COALESCE(SUM(m2.quantity * m3.protein), 0) AS protein,
                            COALESCE(SUM(m2.quantity * m3.carbohydrate), 0) AS carbohydrate,
                            COALESCE(SUM(m2.quantity * m3.fat), 0) AS fat,
                            COALESCE(SUM(m2.quantity * m3.saturates), 0) AS saturates,
                            COALESCE(SUM(m2.quantity * m3.sugars), 0) AS sugars,
                            COALESCE(SUM(m2.quantity * m3.fibre), 0) AS fibre,
                            COALESCE(SUM(m2.quantity * m3.salt), 0) AS salt,
                            (
                                SELECT
                                    JSON_AGG(diet)
                                FROM
                                    (
                                        SELECT
                                            d1.id AS diet_id,
                                            d2.name AS food_name,
                                            d3.name AS brand_name,
                                            d1.quantity * d2.data_value AS data_value,
                                            d2.data_measurement AS data_measurement,
                                            d1.quantity * d2.energy AS energy,
                                            d1.quantity * d2.protein AS protein,
                                            d1.quantity * d2.carbohydrate AS carbohydrate,
                                            d1.quantity * d2.fat AS fat,
                                            d1.quantity * d2.saturates AS saturates,
                                            d1.quantity * d2.sugars AS sugars,
                                            d1.quantity * d2.fibre AS fibre,
                                            d1.quantity * d2.salt AS salt
                                        FROM
                                            food_log d1
                                            LEFT JOIN food d2 ON d2.id = d1.food_id
                                            LEFT JOIN food_brand d3 ON d3.id = d2.brand_id
                                        WHERE
                                            d1.user_id = t1.user_id
                                            AND d1.date = t1.date
                                            AND d1.meal_of_day_id = m1.id
                                    ) diet
                            ) AS diet_food
                        FROM
                            meal_of_day m1
                            LEFT JOIN food_log m2 ON m2.meal_of_day_id = m1.id
                            AND m2.date = t1.date
                            AND m2.user_id = t1.user_id
                            LEFT JOIN food m3 ON m3.id = m2.food_id
                        GROUP BY
                            m1.id
                        ORDER BY
                            m1.ordering
                    ) meal
            ) AS diet_meals
        FROM
            food_log t1
            LEFT JOIN food t2 ON t2.id = t1.food_id
            LEFT JOIN users_user t3 ON t3.id = t1.user_id
            LEFT JOIN progress p1 ON p1.user_id = t1.user_id
            AND p1.date = (
                SELECT
                    MAX(date)
                FROM
                    progress
                WHERE
                    user_id = t1.user_id
                    AND date <= t1.date
                    AND weight_kg IS NOT NULL
            )
        WHERE
            true
            ",
        );
        if let Some(username) = query.username {
            q.push(" AND t3.username = ");
            q.push_bind(username);
        }
        if let Some(user_id) = query.user_id {
            q.push(" AND t1.user_id = ");
            q.push_bind(user_id);
        }
        if let Some(date) = query.date_from {
            q.push(" AND t1.date >= ");
            q.push_bind(date);
        }
        if let Some(date) = query.date_to {
            q.push(" AND t1.date <= ");
            q.push_bind(date);
        }
        q.push(
            "
            GROUP BY
                t1.user_id,
                t1.date,
                p1.id,
                t3.id
            ",
        );
        if let Some(order) = query.order {
            q.push(" ORDER BY ");
            let mut order = order;
            if !order.contains('-') {
                q.push(format!("{} ASC NULLS LAST", order));
            } else {
                order.remove(0);
                q.push(format!("{} DESC NULLS LAST", order));
            }
        } else {
            q.push(" ORDER BY t1.date");
        }
        let limit = query.size.unwrap_or(10);
        if let Some(page) = query.page {
            if page > 1 {
                q.push(" OFFSET ");
                q.push_bind(page * limit);
            }
        }
        q.push(" LIMIT ");
        q.push_bind(limit);
        let mut rows = q.build_query_as().fetch(pool);
        while let Some(row) = rows.try_next().await? {
            stream.push(row);
        }
        Ok(stream)
    }
    pub async fn empty(pool: &PgPool) -> Result<Vec<Self>, sqlx::Error> {
        let mut stream = Vec::new();
        let mut diet_day = Self::default();

        let mut rows = sqlx::query_as(
            "
            SELECT 
                m1.id AS meal_of_day_id,
                m1.name AS meal_of_day_name,
                m1.slug AS meal_of_day_slug,
                m1.ordering AS meal_of_day_order,
                0::DECIMAL AS energy,
                0::DECIMAL AS protein,
                0::DECIMAL AS carbohydrate,
                0::DECIMAL AS fat,
                0::DECIMAL AS saturates,
                0::DECIMAL AS sugars,
                0::DECIMAL AS fibre,
                0::DECIMAL AS salt,
                null as diet_food
            FROM 
                meal_of_day m1
            GROUP BY
                m1.id
            ORDER BY
                m1.ordering
            ",
        )
        .fetch(pool);
        while let Some(row) = rows.try_next().await? {
            diet_day.diet_meals.push(row);
        }

        stream.push(diet_day);
        Ok(stream)
    }
}
