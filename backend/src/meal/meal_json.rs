use futures::TryStreamExt;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, PgPool};
use uuid::Uuid;

use crate::util::query::QueryParams;

#[derive(Debug, Default, Deserialize, Serialize, FromRow)]
pub struct MealFoodJSON {
    pub food_id: Uuid,
    pub food_name: String,
    pub food_slug: String,
    pub brand_name: String,
    pub brand_slug: String,
    pub data_value: Decimal,
    pub data_measurement: String,
    pub energy: Decimal,
    pub protein: Decimal,
    pub carbohydrate: Decimal,
    pub fat: Decimal,
    pub saturates: Decimal,
    pub sugars: Decimal,
    pub fibre: Decimal,
    pub salt: Decimal,
}

#[derive(Debug, Default, Deserialize, Serialize, FromRow)]
pub struct MealJSON {
    pub id: Uuid,
    pub user_id: Uuid,
    pub username: String,
    pub name: String,
    pub food_count: i64,
    pub energy: Decimal,
    pub protein: Decimal,
    pub carbohydrate: Decimal,
    pub fat: Decimal,
    pub saturates: Decimal,
    pub sugars: Decimal,
    pub fibre: Decimal,
    pub salt: Decimal,
    pub meal_items: sqlx::types::Json<Vec<MealFoodJSON>>,
}

impl MealJSON {
    pub async fn all(pool: &PgPool, query: QueryParams) -> Result<Vec<Self>, sqlx::Error> {
        let mut stream = Vec::new();
        let mut q = sqlx::QueryBuilder::new(
            "
            SELECT
                m1.id,
                m1.name,
                m1.user_id,
                m4.username,
                COUNT(m2.*) AS food_count,
                SUM(m2.quantity * m3.energy) AS energy,
                SUM(m2.quantity * m3.protein) AS protein,
                SUM(m2.quantity * m3.carbohydrate) AS carbohydrate,
                SUM(m2.quantity * m3.fat) AS fat,
                SUM(m2.quantity * m3.saturates) AS saturates,
                SUM(m2.quantity * m3.sugars) AS sugars,
                SUM(m2.quantity * m3.fibre) AS fibre,
                SUM(m2.quantity * m3.salt) AS salt,
                (
                    SELECT
                        JSON_AGG(meal_items)
                    FROM
                        (
                            SELECT
                                t1.food_id,
                                t2.name AS food_name,
                                t2.slug AS food_slug,
                                t3.name AS brand_name,
                                t3.slug AS brand_slug,
                                t1.quantity * t2.data_value AS data_value,
                                t2.data_measurement AS data_measurement,
                                t1.quantity * t2.energy AS energy,
                                t1.quantity * t2.protein AS protein,
                                t1.quantity * t2.carbohydrate AS carbohydrate,
                                t1.quantity * t2.fat AS fat,
                                t1.quantity * t2.saturates AS saturates,
                                t1.quantity * t2.sugars AS sugars,
                                t1.quantity * t2.fibre AS fibre,
                                t1.quantity * t2.salt AS salt
                            FROM
                                meal_food t1
                                LEFT JOIN food t2 ON t2.id = t1.food_id
                                LEFT JOIN food_brand t3 ON t3.id = t2.brand_id
                            WHERE
                                t1.meal_id = m1.id
                        ) meal_items
                ) AS meal_items
            FROM
                meal m1
                LEFT JOIN meal_food m2 ON m2.meal_id = m1.id
                LEFT JOIN food m3 ON m3.id = m2.food_id
                LEFT JOIN users_user m4 ON m4.id = m1.user_id
            WHERE
                true
            ",
        );
        if let Some(meal_id) = query.meal_id {
            q.push(" AND m1.id = ");
            q.push_bind(meal_id);
        }
        if let Some(search) = query.search {
            q.push(" AND m1.name ILIKE ");
            q.push_bind(format!("%{}%", search));
        }
        if let Some(user_id) = query.user_id {
            q.push(" AND m1.user_id = ");
            q.push_bind(user_id);
        }
        // if let Some(date) = query.date_to {
        //     q.push(" AND t1.date <= ");
        //     q.push_bind(date);
        // }
        q.push(
            "
            GROUP BY
                m1.id,
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
            q.push(" ORDER BY m1.name");
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
