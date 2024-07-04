use chrono::prelude::*;
use futures::TryStreamExt;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, PgPool};
use uuid::Uuid;

use crate::util::query::QueryParams;

#[derive(Debug, Deserialize, Serialize, FromRow)]
pub struct DietFoodJSON {
    pub diet_id: Uuid,
    pub food_name: String,
    pub brand_name: String,
    pub energy: Option<Decimal>,
    pub protein: Option<Decimal>,
    pub carbohydrate: Option<Decimal>,
    pub fat: Option<Decimal>,
    pub saturates: Option<Decimal>,
    pub sugars: Option<Decimal>,
    pub fibre: Option<Decimal>,
    pub salt: Option<Decimal>,
}

#[derive(Debug, Deserialize, Serialize, FromRow)]
pub struct DietMealJSON {
    pub user_id: Uuid,
    pub date: NaiveDate,
    pub username: String,
    pub meal_of_day_id: Uuid,
    pub meal_of_day_name: String,
    pub meal_of_day_slug: String,
    pub meal_of_day_order: i32,
    pub energy: Option<Decimal>,
    pub protein: Option<Decimal>,
    pub carbohydrate: Option<Decimal>,
    pub fat: Option<Decimal>,
    pub saturates: Option<Decimal>,
    pub sugars: Option<Decimal>,
    pub fibre: Option<Decimal>,
    pub salt: Option<Decimal>,
    pub diet_food: sqlx::types::Json<Vec<Option<DietFoodJSON>>>,
}

impl DietMealJSON {
    pub async fn all(pool: &PgPool, query: QueryParams) -> Result<Vec<Self>, sqlx::Error> {
        let mut stream = Vec::new();
        let mut q = sqlx::QueryBuilder::new(
            "
            SELECT
                m1.user_id AS user_id,
                m4.username AS username,
                m1.date AS date,
                m1.meal_of_day_id AS meal_of_day_id,
                m3.name AS meal_of_day_name,
                m3.slug AS meal_of_day_slug,
                m3.ordering AS meal_of_day_order,
                COALESCE(SUM(m1.quantity * m2.energy), 0) AS energy,
                COALESCE(SUM(m1.quantity * m2.protein), 0) AS protein,
                COALESCE(SUM(m1.quantity * m2.carbohydrate), 0) AS carbohydrate,
                COALESCE(SUM(m1.quantity * m2.fat), 0) AS fat,
                COALESCE(SUM(m1.quantity * m2.saturates), 0) AS saturates,
                COALESCE(SUM(m1.quantity * m2.sugars), 0) AS sugars,
                COALESCE(SUM(m1.quantity * m2.fibre), 0) AS fibre,
                COALESCE(SUM(m1.quantity * m2.salt), 0) AS salt,
                (
                    SELECT
                        JSON_AGG(diet)
                    FROM
                        (
                            SELECT
                                d1.id AS diet_id,
                                d2.name AS food_name,
                                d3.name AS brand_name,
                                SUM(d1.quantity * d2.data_value) AS data_value,
                                d2.data_measurement AS data_measurement,
                                SUM(d1.quantity * d2.energy) AS energy,
                                SUM(d1.quantity * d2.protein) AS protein,
                                SUM(d1.quantity * d2.carbohydrate) AS carbohydrate,
                                SUM(d1.quantity * d2.fat) AS fat,
                                SUM(d1.quantity * d2.saturates) AS saturates,
                                SUM(d1.quantity * d2.sugars) AS sugars,
                                SUM(d1.quantity * d2.fibre) AS fibre,
                                SUM(d1.quantity * d2.salt) AS salt
                            FROM
                                food_log d1
                                LEFT JOIN food d2 ON d2.id = d1.food_id
                                LEFT JOIN food_brand d3 ON d3.id = d2.brand_id
                            WHERE
                                d1.user_id = m1.user_id
                                AND d1.date = m1.date
                                AND d1.meal_of_day_id = m1.meal_of_day_id
                            GROUP BY
                                d1.id,
                                d2.id,
                                d3.id
                        ) diet
                ) AS diet_food
            FROM
                food_log m1
                LEFT JOIN food m2 ON m2.id = m1.food_id
                LEFT JOIN meal_of_day m3 ON m3.id = m1.meal_of_day_id
                LEFT JOIN users_user m4 ON m4.id = m1.user_id
            WHERE
                TRUE
            ",
        );
        if let Some(username) = query.username {
            q.push(" AND m4.username = ");
            q.push_bind(username);
        }
        if let Some(user_id) = query.user_id {
            q.push(" AND m1.user_id = ");
            q.push_bind(user_id);
        }
        if let Some(date) = query.date_from {
            q.push(" AND m1.date = ");
            q.push_bind(date);
        }
        if let Some(meal_of_day_id) = query.meal_of_day_id {
            q.push(" AND m1.meal_of_day_id = ");
            q.push_bind(meal_of_day_id);
        }
        q.push(
            "
            GROUP BY
            m1.date,
            m1.user_id,
            m1.meal_of_day_id,
            m3.id,
            m4.id
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
            q.push(" ORDER BY m3.ordering");
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
}
