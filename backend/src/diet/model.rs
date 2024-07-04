use chrono::prelude::*;
use futures::TryStreamExt;
use rust_decimal::Decimal;
use serde::Serialize;
use sqlx::{FromRow, PgPool, Row};
use uuid::Uuid;

use crate::{
    db::Filters,
    meal_food::model::MealFood,
    meal_of_day::model::MealOfDay,
    util::{datetime::NaiveDateExt, query::QueryParams},
};

const ORDERING_FIELDS: &[&str] = &["date", "user_id", "created_at", "updated_at"];

#[derive(Debug, Serialize, FromRow)]
pub struct Diet {
    pub id: Uuid,
    pub date: NaiveDate,
    pub user_id: Uuid,
    pub food_id: Uuid,
    pub meal_of_day_id: Uuid,
    pub quantity: Decimal,
    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,
    pub created_by_id: Uuid,
    pub updated_by_id: Option<Uuid>,
}

impl Diet {
    pub async fn count(pool: &PgPool, params: &QueryParams) -> Result<i64, sqlx::Error> {
        let mut q = sqlx::QueryBuilder::new("SELECT COUNT(t1.*) FROM food_log t1 WHERE TRUE");
        if let Some(user_id) = params.user_id {
            q.push(" AND t1.user_id = ");
            q.push_bind(user_id);
        }
        let count = q.build().fetch_one(pool).await?.get("count");
        Ok(count)
    }
    pub async fn all(pool: &PgPool, params: QueryParams) -> Result<Vec<Self>, sqlx::Error> {
        let mut stream = Vec::new();
        let mut q = sqlx::QueryBuilder::new("SELECT * FROM food_log where true");
        if let Some(user_id) = params.user_id {
            q.push(" AND user_id = ");
            q.push_bind(user_id);
        }
        q.ordering_filter(&params, ORDERING_FIELDS, "date desc");
        q.paginate(params.page, params.size);
        let mut rows = q.build_query_as().fetch(pool);
        while let Some(row) = rows.try_next().await? {
            stream.push(row);
        }
        Ok(stream)
    }
    pub async fn create(
        pool: &PgPool,
        date: NaiveDate,
        user_id: Uuid,
        diet_meal_id: Uuid,
        food_id: Uuid,
        quantity: Decimal,
        created_by_id: Uuid,
    ) -> Result<Self, sqlx::Error> {
        let query = sqlx::query_as(
            "
            INSERT INTO
                food_log (
                    date,
                    user_id,
                    meal_of_day_id,
                    food_id,
                    quantity,
                    created_by_id
                )
            VALUES
                ($1, $2, $3, $4, $5, $6)
            RETURNING
                *
            ",
        )
        .bind(date)
        .bind(user_id)
        .bind(diet_meal_id)
        .bind(food_id)
        .bind(quantity)
        .bind(created_by_id)
        .fetch_one(pool)
        .await?;
        Ok(query)
    }
    pub async fn get(pool: &PgPool, id: &Uuid) -> Result<Option<Self>, sqlx::Error> {
        let query = sqlx::query_as("SELECT * FROM food_log WHERE id = $1")
            .bind(id)
            .fetch_optional(pool)
            .await?;
        Ok(query)
    }
    pub async fn update(
        pool: &PgPool,
        id: Uuid,
        date: NaiveDate,
        user_id: Uuid,
        diet_meal_id: Uuid,
        food_id: Uuid,
        quantity: Decimal,
        updated_by_id: Uuid,
    ) -> Result<Self, sqlx::Error> {
        let query: Diet = sqlx::query_as(
            "
            UPDATE food_log
            SET
                date = $1,
                user_id = $2,
                meal_of_day_id = $3,
                food_id = $4,
                quantity = $5,
                updated_at = $6,
                updated_by_id = $7
            WHERE
                id = $8
            RETURNING
                *
            ",
        )
        .bind(date)
        .bind(user_id)
        .bind(diet_meal_id)
        .bind(food_id)
        .bind(quantity)
        .bind(Utc::now())
        .bind(updated_by_id)
        .bind(id)
        .fetch_one(pool)
        .await?;
        Ok(query)
    }
    pub async fn delete(pool: &PgPool, id: &Uuid) -> Result<Self, sqlx::Error> {
        let query = sqlx::query_as("DELETE FROM food_log WHERE id = $1 RETURNING *")
            .bind(id)
            .fetch_one(pool)
            .await?;
        Ok(query)
    }
    pub async fn create_from_meal_food(
        pool: &PgPool,
        user_id: Uuid,
        date: NaiveDate,
        meal_of_day_id: Uuid,
        meal_food: Vec<MealFood>,
        created_by_id: Uuid,
    ) -> Result<Vec<Self>, sqlx::Error> {
        let mut date_list = Vec::new();
        let mut user_id_list = Vec::new();
        let mut meal_of_day_id_list = Vec::new();
        let mut food_id_list = Vec::new();
        let mut quantity_list = Vec::new();
        let mut created_by_id_list = Vec::new();

        for food in meal_food {
            date_list.push(date);
            user_id_list.push(user_id);
            meal_of_day_id_list.push(meal_of_day_id);
            food_id_list.push(food.food_id);
            quantity_list.push(food.quantity);
            created_by_id_list.push(created_by_id.clone());
        }

        let query = sqlx::query_as(
            "
            INSERT INTO
                food_log (
                    date,
                    user_id,
                    meal_of_day_id,
                    food_id,
                    quantity,
                    created_by_id
                )
            SELECT
                *
            FROM
                UNNEST(
                    $1::DATE[],
                    $2::UUID[],
                    $3::UUID[],
                    $4::UUID[],
                    $5::DECIMAL[],
                    $6::UUID[]
                )
            ",
        )
        .bind(date_list)
        .bind(user_id_list)
        .bind(meal_of_day_id_list)
        .bind(food_id_list)
        .bind(quantity_list)
        .bind(created_by_id_list)
        .fetch_all(pool)
        .await?;
        Ok(query)
    }
    pub async fn delete_id_range(
        pool: &PgPool,
        id_range: Vec<Uuid>,
    ) -> Result<Vec<Self>, sqlx::Error> {
        let query = sqlx::query_as(
            "
            DELETE FROM food_log
            WHERE
                id = ANY ($1)
            RETURNING
                *
            ",
        )
        .bind(id_range)
        .fetch_all(pool)
        .await?;
        Ok(query)
    }
    pub async fn delete_date_range(
        pool: &PgPool,
        user_id: Uuid,
        date_range: Vec<NaiveDate>,
    ) -> Result<Vec<Self>, sqlx::Error> {
        let query = sqlx::query_as(
            "
            DELETE FROM food_log
            WHERE
                user_id = $1
                AND date = ANY ($2)
            RETURNING
                *
            ",
        )
        .bind(user_id)
        .bind(date_range)
        .fetch_all(pool)
        .await?;
        Ok(query)
    }
    pub async fn from_id_range(pool: &PgPool, range: Vec<Uuid>) -> Result<Vec<Self>, sqlx::Error> {
        let query = sqlx::query_as("SELECT * FROM food_log WHERE id = ANY ($1)")
            .bind(range)
            .fetch_all(pool)
            .await?;
        Ok(query)
    }
}

#[derive(Debug, Serialize, Clone, FromRow)]
pub struct DietSerializer {
    pub id: Uuid,
    pub date: NaiveDate,
    pub user_id: Uuid,
    pub meal_of_day_id: Uuid,
    pub quantity: Decimal,
    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,
    // user
    pub username: String,
    // meal of day
    pub meal_name: String,
    pub meal_slug: String,
    // food
    pub food_name: String,
    pub food_slug: String,
    // brand
    pub brand_name: String,
    pub brand_slug: String,
    // food
    pub data_value: Option<Decimal>,
    pub data_measurement: String,
    pub energy: Option<Decimal>,
    pub protein: Option<Decimal>,
    pub carbohydrate: Option<Decimal>,
    pub fat: Option<Decimal>,
    pub saturates: Option<Decimal>,
    pub sugars: Option<Decimal>,
    pub fibre: Option<Decimal>,
    pub salt: Option<Decimal>,
    // pub protein_pct: Option<Decimal>,
    // pub carbohydrate_pct: Option<Decimal>,
    // pub fat_pct: Option<Decimal>,
    // Meal macros
    pub meal_energy: Option<Decimal>,
    pub meal_protein: Option<Decimal>,
    pub meal_carbohydrate: Option<Decimal>,
    pub meal_fat: Option<Decimal>,
    pub meal_saturates: Option<Decimal>,
    pub meal_sugars: Option<Decimal>,
    pub meal_fibre: Option<Decimal>,
    pub meal_salt: Option<Decimal>,
    // Day macros
    pub day_energy: Option<Decimal>,
    pub day_protein: Option<Decimal>,
    pub day_carbohydrate: Option<Decimal>,
    pub day_fat: Option<Decimal>,
    pub day_saturates: Option<Decimal>,
    pub day_sugars: Option<Decimal>,
    pub day_fibre: Option<Decimal>,
    pub day_salt: Option<Decimal>,
    // Day pct
    pub day_protein_pct: Option<Decimal>,
    pub day_carbohydrate_pct: Option<Decimal>,
    pub day_fat_pct: Option<Decimal>,
    // Day per kg
    pub day_energy_per_kg: Option<Decimal>,
    pub day_protein_per_kg: Option<Decimal>,
    pub day_carbohydrate_per_kg: Option<Decimal>,
    pub day_fat_per_kg: Option<Decimal>,
    pub latest_weight: Option<Decimal>,
    pub latest_weight_date: Option<NaiveDate>,
}

impl DietSerializer {
    pub async fn all(
        pool: &PgPool,
        user_id: &Uuid,
        date: &NaiveDate,
    ) -> Result<Vec<Self>, sqlx::Error> {
        let mut stream = Vec::new();
        let mut rows = sqlx::query_as(
            "
        SELECT
            t1.id,
            t1.user_id,
            t5.username,
            t1.date,
            t1.meal_of_day_id,
            t1.created_at,
            t1.updated_at,
            -- meal
            t4.name AS meal_name,
            t4.slug AS meal_slug,
            -- food
            t2.name AS food_name,
            t2.slug AS food_slug,
            -- brand
            t3.name AS brand_name,
            t3.slug AS brand_slug,
            t1.quantity,
            t1.quantity * t2.data_value AS data_value,
            t2.data_measurement AS data_measurement,
            -- food macros
            t1.quantity * t2.energy AS energy,
            t1.quantity * t2.protein AS protein,
            t1.quantity * t2.carbohydrate AS carbohydrate,
            t1.quantity * t2.fat AS fat,
            t1.quantity * t2.saturates AS saturates,
            t1.quantity * t2.sugars AS sugars,
            t1.quantity * t2.fibre AS fibre,
            t1.quantity * t2.salt AS salt,
            -- meal macros
            SUM(t1.quantity * t2.energy) OVER (
                PARTITION BY
                    t1.user_id,
                    t1.date,
                    t1.meal_of_day_id
            ) AS meal_energy,
            SUM(t1.quantity * t2.protein) OVER (
                PARTITION BY
                    t1.user_id,
                    t1.date,
                    t1.meal_of_day_id
            ) AS meal_protein,
            SUM(t1.quantity * t2.carbohydrate) OVER (
                PARTITION BY
                    t1.user_id,
                    t1.date,
                    t1.meal_of_day_id
            ) AS meal_carbohydrate,
            SUM(t1.quantity * t2.fat) OVER (
                PARTITION BY
                    t1.user_id,
                    t1.date,
                    t1.meal_of_day_id
            ) AS meal_fat,
            SUM(t1.quantity * t2.saturates) OVER (
                PARTITION BY
                    t1.user_id,
                    t1.date,
                    t1.meal_of_day_id
            ) AS meal_saturates,
            SUM(t1.quantity * t2.sugars) OVER (
                PARTITION BY
                    t1.user_id,
                    t1.date,
                    t1.meal_of_day_id
            ) AS meal_sugars,
            SUM(t1.quantity * t2.fibre) OVER (
                PARTITION BY
                    t1.user_id,
                    t1.date,
                    t1.meal_of_day_id
            ) AS meal_fibre,
            SUM(t1.quantity * t2.salt) OVER (
                PARTITION BY
                    t1.user_id,
                    t1.date,
                    t1.meal_of_day_id
            ) AS meal_salt,
            -- day macros
            SUM(t1.quantity * t2.energy) OVER (
                PARTITION BY
                    t1.user_id,
                    t1.date
            ) AS day_energy,
            SUM(t1.quantity * t2.protein) OVER (
                PARTITION BY
                    t1.user_id,
                    t1.date
            ) AS day_protein,
            SUM(t1.quantity * t2.carbohydrate) OVER (
                PARTITION BY
                    t1.user_id,
                    t1.date
            ) AS day_carbohydrate,
            SUM(t1.quantity * t2.fat) OVER (
                PARTITION BY
                    t1.user_id,
                    t1.date
            ) AS day_fat,
            SUM(t1.quantity * t2.saturates) OVER (
                PARTITION BY
                    t1.user_id,
                    t1.date
            ) AS day_saturates,
            SUM(t1.quantity * t2.sugars) OVER (
                PARTITION BY
                    t1.user_id,
                    t1.date
            ) AS day_sugars,
            SUM(t1.quantity * t2.fibre) OVER (
                PARTITION BY
                    t1.user_id,
                    t1.date
            ) AS day_fibre,
            SUM(t1.quantity * t2.salt) OVER (
                PARTITION BY
                    t1.user_id,
                    t1.date
            ) AS day_salt,
            -- day percentage
            SUM(t1.quantity * t2.protein) OVER (
                PARTITION BY
                    t1.user_id,
                    t1.date
            ) * 4 / SUM(t1.quantity * t2.energy) OVER (
                PARTITION BY
                    t1.user_id,
                    t1.date
            ) * 100 AS day_protein_pct,
            SUM(t1.quantity * t2.carbohydrate) OVER (
                PARTITION BY
                    t1.user_id,
                    t1.date
            ) * 4 / SUM(t1.quantity * t2.energy) OVER (
                PARTITION BY
                    t1.user_id,
                    t1.date
            ) * 100 AS day_carbohydrate_pct,
            SUM(t1.quantity * t2.fat) OVER (
                PARTITION BY
                    t1.user_id,
                    t1.date
            ) * 9 / SUM(t1.quantity * t2.energy) OVER (
                PARTITION BY
                    t1.user_id,
                    t1.date
            ) * 100 AS day_fat_pct,
            -- Day macros per kg of latest weight
            SUM(t1.quantity * t2.energy / t6.weight_kg) OVER (
                PARTITION BY
                    t1.user_id,
                    t1.date
            ) AS day_energy_per_kg,
            SUM(t1.quantity * t2.protein / t6.weight_kg) OVER (
                PARTITION BY
                    t1.user_id,
                    t1.date
            ) AS day_protein_per_kg,
            SUM(t1.quantity * t2.carbohydrate / t6.weight_kg) OVER (
                PARTITION BY
                    t1.user_id,
                    t1.date
            ) AS day_carbohydrate_per_kg,
            SUM(t1.quantity * t2.fat / t6.weight_kg) OVER (
                PARTITION BY
                    t1.user_id,
                    t1.date
            ) AS day_fat_per_kg,
            t6.weight_kg AS latest_weight,
            t6.date AS latest_weight_date
        FROM
            food_log t1
            LEFT JOIN food t2 ON t2.id = t1.food_id
            LEFT JOIN food_brand t3 ON t3.id = t2.brand_id
            LEFT JOIN meal_of_day t4 ON t4.id = t1.meal_of_day_id 
            LEFT JOIN users_user t5 ON t5.id = t1.user_id
            LEFT JOIN progress t6 ON t6.user_id = t1.user_id
            AND t6.weight_kg IS NOT NULL
            AND t6.date = (
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
            t1.user_id = $1
            AND t1.date = $2
        ORDER BY
            t1.date,
            t4.ordering,
            t1.updated_at,
            t1.created_at
        ",
        )
        .bind(user_id)
        .bind(date)
        .fetch(pool);
        while let Some(row) = rows.try_next().await? {
            stream.push(row);
        }
        Ok(stream)
    }
}

#[derive(Debug, Default, Serialize, Clone, FromRow)]
pub struct DietDayTotal {
    pub date: Option<NaiveDate>,
    // pub Option<username: String>,
    pub energy: Option<Decimal>,
    pub protein: Option<Decimal>,
    pub carbohydrate: Option<Decimal>,
    pub fat: Option<Decimal>,
    pub saturates: Option<Decimal>,
    pub sugars: Option<Decimal>,
    pub fibre: Option<Decimal>,
    pub salt: Option<Decimal>,
    pub protein_pct: Option<Decimal>,
    pub carbohydrate_pct: Option<Decimal>,
    pub fat_pct: Option<Decimal>,
    pub energy_per_kg: Option<Decimal>,
    pub protein_per_kg: Option<Decimal>,
    pub carbohydrate_per_kg: Option<Decimal>,
    pub fat_per_kg: Option<Decimal>,
    pub latest_weight: Option<Decimal>,
    pub latest_weight_date: Option<NaiveDate>,
}

impl DietDayTotal {
    pub async fn stream(
        pool: &PgPool,
        username: &str,
        date: &NaiveDate,
    ) -> Result<Vec<Self>, sqlx::Error> {
        let start =
            NaiveDate::from_isoywd_opt(date.year(), date.iso_week().week(), Weekday::Mon).unwrap();
        let end =
            NaiveDate::from_isoywd_opt(date.year(), date.iso_week().week(), Weekday::Sun).unwrap();

        let mut stream = Vec::new();
        let mut rows = sqlx::query_as(
            "
            SELECT
                -- t3.username,
                t1.date,
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
                SUM(t1.quantity * t2.energy) / t4.weight_kg AS energy_per_kg,
                SUM(t1.quantity * t2.protein) / t4.weight_kg AS protein_per_kg,
                SUM(t1.quantity * t2.carbohydrate) / t4.weight_kg AS carbohydrate_per_kg,
                SUM(t1.quantity * t2.fat) / t4.weight_kg AS fat_per_kg,
                t4.weight_kg AS latest_weight,
                t4.date as latest_weight_date
            FROM
                food_log t1
                LEFT JOIN food t2 ON t2.id = t1.food_id
                LEFT JOIN users_user t3 ON t3.id = t1.user_id
                LEFT JOIN progress t4 ON t4.user_id = t1.user_id
                AND t4.date = (
                    SELECT
                        MAX(date)
                    FROM
                        progress
                    WHERE
                        date <= t1.date
                        AND weight_kg IS NOT NULL
                )
            WHERE
                t3.username = $1
                AND t1.date >= $2
                AND t1.date <= $3
            GROUP BY
                t3.username,
                t1.date,
                t4.weight_kg,
                t4.date
            ORDER BY
                t1.date
            "
        )
        .bind(username)
        .bind(start)
        .bind(end)
        .fetch(pool);
        while let Some(row) = rows.try_next().await? {
            stream.push(row);
        }
        Ok(stream)
    }

    pub async fn week_total(
        pool: &PgPool,
        username: &str,
        date: &NaiveDate,
    ) -> Result<Self, sqlx::Error> {
        let start =
            NaiveDate::from_isoywd_opt(date.year(), date.iso_week().week(), Weekday::Mon).unwrap();
        let end =
            NaiveDate::from_isoywd_opt(date.year(), date.iso_week().week(), Weekday::Sun).unwrap();

        let query = sqlx::query_as(
                "
            SELECT
                t3.username,
                DATE_TRUNC('week', t1.date)::date AS date,
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
                SUM(t1.quantity * t2.energy) / t4.weight_kg AS energy_per_kg,
                SUM(t1.quantity * t2.protein) / t4.weight_kg AS protein_per_kg,
                SUM(t1.quantity * t2.carbohydrate) / t4.weight_kg AS carbohydrate_per_kg,
                SUM(t1.quantity * t2.fat) / t4.weight_kg AS fat_per_kg,
                t4.weight_kg AS latest_weight,
                t4.date as latest_weight_date
            FROM
                food_log t1
                LEFT JOIN food t2 ON t2.id = t1.food_id
                LEFT JOIN users_user t3 ON t3.id = t1.user_id
                LEFT JOIN progress t4 ON t4.user_id = t1.user_id
                AND t4.date = (
                    SELECT
                        MAX(date)
                    FROM
                        progress
                    WHERE
                        date <= t1.date
                        AND weight_kg IS NOT NULL
                )
            WHERE
                t3.username = $1
                AND DATE_TRUNC('week', t1.date)::date = $2
            GROUP BY
                t3.username,
                DATE_TRUNC('week', t1.date),
                t4.weight_kg,
                t4.date
                "
            )
            .bind(username)
            .bind(start)
            .bind(end)
            .fetch_optional(pool)
            .await?.unwrap_or_default();
        Ok(query)
    }

    pub async fn week_average(
        pool: &PgPool,
        username: &str,
        date: &NaiveDate,
    ) -> Result<Self, sqlx::Error> {
        let query = sqlx::query_as(
                "
                WITH
                cte AS (
                    SELECT
                        t1.date,
                        t1.user_id,
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
                        SUM(t1.quantity * t2.energy) / MAX(t3.weight_kg) AS energy_per_kg,
                        SUM(t1.quantity * t2.protein) / MAX(t3.weight_kg) AS protein_per_kg,
                        SUM(t1.quantity * t2.carbohydrate) / MAX(t3.weight_kg) AS carbohydrate_per_kg,
                        SUM(t1.quantity * t2.fat) / MAX(t3.weight_kg) AS fat_per_kg,
                        MAX(t3.weight_kg) AS latest_weight,
                        MAX(t3.date) AS latest_weight_date
                    FROM
                        food_log t1
                        LEFT JOIN food t2 ON t2.id = t1.food_id
                        LEFT JOIN progress t3 ON t3.user_id = t1.user_id
                        AND t3.date = (
                            SELECT
                                MAX(date)
                            FROM
                                progress
                            WHERE
                                t1.user_id = progress.user_id
                                AND weight_kg IS NOT NULL
                                AND EXTRACT(
                                    week
                                    FROM
                                        progress.date
                                ) <= EXTRACT(
                                    week
                                    FROM
                                        t1.date
                                )
                        )
                    GROUP BY
                        t1.date,
                        t1.user_id
                )
            SELECT
                MAX(DATE_TRUNC('week', t1.date)::date) AS date,
                AVG(t1.energy) AS energy,
                AVG(t1.protein) AS protein,
                AVG(t1.carbohydrate) AS carbohydrate,
                AVG(t1.fat) AS fat,
                AVG(t1.saturates) AS saturates,
                AVG(t1.sugars) AS sugars,
                AVG(t1.fibre) AS fibre,
                AVG(t1.salt) AS salt,
                AVG(t1.protein_pct) AS protein_pct,
                AVG(t1.carbohydrate_pct) AS carbohydrate_pct,
                AVG(t1.fat_pct) AS fat_pct,
                AVG(t1.energy_per_kg) AS energy_per_kg,
                AVG(t1.protein_per_kg) AS protein_per_kg,
                AVG(t1.carbohydrate_per_kg) AS carbohydrate_per_kg,
                AVG(t1.fat_per_kg) AS fat_per_kg,
                MAX(t1.latest_weight) AS latest_weight,
                MAX(t1.latest_weight_date) AS latest_weight_date
            FROM
                cte t1
                LEFT JOIN users_user t2 ON t1.user_id = t2.id
            WHERE
                t2.username = $1
                AND EXTRACT(
                    week
                    FROM
                        t1.date
                ) = EXTRACT(
                    week
                    FROM
                        $2::date
                )
                "
            )
            .bind(username)
            .bind(date)
            .fetch_optional(pool)
            .await?.unwrap_or_default();
        Ok(query)
    }
}

#[derive(Debug, Default, Serialize, FromRow)]
pub struct DietDetail {
    pub id: Uuid,
    pub date: NaiveDate,
    pub meal_of_day_id: Uuid,
    pub food_id: Uuid,
    pub food_name: String,
    pub food_slug: String,
    pub brand_name: String,
    pub brand_slug: String,
    pub data_value: Decimal,
    pub data_measurement: String,
    pub energy: Decimal,
    pub fat: Decimal,
    pub saturates: Decimal,
    pub carbohydrate: Decimal,
    pub sugars: Decimal,
    pub fibre: Decimal,
    pub protein: Decimal,
    pub salt: Decimal,
}

impl DietDetail {
    pub async fn get(pool: &PgPool, id: Uuid) -> Result<Option<Self>, sqlx::Error> {
        let query = sqlx::query_as(
            "
            SELECT
            t1.id,
            t1.date,
            t1.meal_of_day_id,
            t1.food_id,
            --
            t2.name as food_name,
            t2.slug as food_slug,
            t3.name as brand_name,
            t3.slug as brand_slug,
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
            FROM food_log t1
            LEFT JOIN food t2 ON t1.food_id = t2.id
            LEFT JOIN food_brand t3 ON t2.brand_id = t3.id
            WHERE t1.id = $1
            ",
        )
        .bind(id)
        .fetch_optional(pool)
        .await?;
        Ok(query)
    }
}

#[derive(Debug, Default, Serialize, FromRow)]
pub struct DietDay {
    pub username: String,
    pub date: NaiveDate,
    pub energy: Decimal,
    pub protein: Decimal,
    pub carbohydrate: Decimal,
    pub fat: Decimal,
    pub saturates: Decimal,
    pub sugars: Decimal,
    pub fibre: Decimal,
    pub salt: Decimal,
    pub meal: Vec<DietMeal>,
    pub protein_pct: Decimal,
    pub carbohydrate_pct: Decimal,
    pub fat_pct: Decimal,
    pub energy_per_kg: Decimal,
    pub protein_per_kg: Decimal,
    pub carbohydrate_per_kg: Decimal,
    pub fat_per_kg: Decimal,
    pub latest_weight: Decimal,
    pub latest_weight_date: NaiveDate,
}

#[derive(Debug, Default, Serialize, FromRow)]
pub struct DietMeal {
    pub id: Uuid,
    pub name: String,
    pub ordering: i32,
    pub slug: String,
    pub energy: Decimal,
    pub protein: Decimal,
    pub carbohydrate: Decimal,
    pub fat: Decimal,
    pub saturates: Decimal,
    pub sugars: Decimal,
    pub fibre: Decimal,
    pub salt: Decimal,
    pub food: Vec<DietFood>,
}

#[derive(Debug, Default, Serialize, FromRow)]
pub struct DietFood {
    pub id: Uuid,
    pub username: String,
    pub date: NaiveDate,
    pub meal_slug: String,
    pub name: String,
    pub brand_name: String,
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

impl DietDay {
    pub async fn build_dataset(
        username: String,
        date: NaiveDate,
        meal_of_day_list: Vec<MealOfDay>,
        diet_list: Vec<DietSerializer>,
    ) -> Self {
        let mut meal_list = Vec::new();
        for meal_of_day in meal_of_day_list {
            let mut meal = DietMeal {
                id: meal_of_day.id,
                name: meal_of_day.name,
                slug: meal_of_day.slug,
                ordering: meal_of_day.ordering,
                ..Default::default()
            };
            for diet in diet_list.clone() {
                if diet.meal_of_day_id == meal_of_day.id {
                    meal.energy = diet.meal_energy.unwrap_or_default();
                    meal.protein = diet.meal_protein.unwrap_or_default();
                    meal.carbohydrate = diet.meal_carbohydrate.unwrap_or_default();
                    meal.fat = diet.meal_fat.unwrap_or_default();
                    meal.saturates = diet.meal_saturates.unwrap_or_default();
                    meal.sugars = diet.meal_sugars.unwrap_or_default();
                    meal.fibre = diet.meal_fibre.unwrap_or_default();
                    meal.salt = diet.meal_salt.unwrap_or_default();
                    meal.food.push(DietFood {
                        id: diet.id,
                        username: diet.username,
                        date: diet.date,
                        meal_slug: diet.meal_slug,
                        name: diet.food_name,
                        brand_name: diet.brand_name,
                        data_value: diet.data_value.unwrap_or_default(),
                        data_measurement: diet.data_measurement,
                        energy: diet.energy.unwrap_or_default(),
                        protein: diet.protein.unwrap_or_default(),
                        carbohydrate: diet.carbohydrate.unwrap_or_default(),
                        fat: diet.fat.unwrap_or_default(),
                        saturates: diet.saturates.unwrap_or_default(),
                        sugars: diet.sugars.unwrap_or_default(),
                        fibre: diet.fibre.unwrap_or_default(),
                        salt: diet.salt.unwrap_or_default(),
                    })
                }
            }
            meal_list.push(meal)
        }
        let result = if diet_list.is_empty() {
            Self {
                username,
                date,
                meal: meal_list,
                ..Default::default()
            }
        } else {
            let diet = diet_list
                .clone()
                .into_iter()
                .nth(0)
                .expect("diet_list vec to contain data");
            Self {
                username,
                date,
                meal: meal_list,
                energy: diet.day_energy.unwrap_or_default(),
                protein: diet.day_protein.unwrap_or_default(),
                carbohydrate: diet.day_carbohydrate.unwrap_or_default(),
                fat: diet.day_fat.unwrap_or_default(),
                saturates: diet.day_saturates.unwrap_or_default(),
                sugars: diet.day_sugars.unwrap_or_default(),
                fibre: diet.day_fibre.unwrap_or_default(),
                salt: diet.day_salt.unwrap_or_default(),
                protein_pct: diet.day_protein_pct.unwrap_or_default(),
                carbohydrate_pct: diet.day_carbohydrate_pct.unwrap_or_default(),
                fat_pct: diet.day_fat_pct.unwrap_or_default(),
                energy_per_kg: diet.day_energy_per_kg.unwrap_or_default(),
                protein_per_kg: diet.day_protein_per_kg.unwrap_or_default(),
                carbohydrate_per_kg: diet.day_carbohydrate_per_kg.unwrap_or_default(),
                fat_per_kg: diet.day_fat_per_kg.unwrap_or_default(),
                latest_weight: diet.latest_weight.unwrap_or_default(),
                latest_weight_date: diet.latest_weight_date.unwrap_or_default(),
            }
        };
        result
    }
}

#[derive(Debug, Default, Serialize, FromRow)]
pub struct DayTotal {
    // time series
    pub date: NaiveDate,
    pub user_id: Uuid,
    // diet
    pub energy: Option<Decimal>,
    pub protein: Option<Decimal>,
    pub carbohydrate: Option<Decimal>,
    pub fat: Option<Decimal>,
    pub week_avg_energy: Option<Decimal>,
    pub week_avg_protein: Option<Decimal>,
    pub week_avg_carbohydrate: Option<Decimal>,
    pub week_avg_fat: Option<Decimal>,
    // target
    pub target_energy: Option<i32>,
    pub target_protein: Option<Decimal>,
    pub target_carbohydrate: Option<Decimal>,
    pub target_fat: Option<Decimal>,

    // progress
    pub progress_id: Option<Uuid>,
    pub energy_burnt: Option<i32>,
    pub week_avg_energy_burnt: Option<Decimal>,
    pub weight: Option<Decimal>,
    pub week_avg_weight: Option<Decimal>,
    pub month_avg_weight: Option<Decimal>,
    // week
    // month
    pub month_avg_energy: Option<Decimal>,
}

impl DayTotal {
    pub async fn all(
        pool: &PgPool,
        user_id: Uuid,
        date: &NaiveDate,
        // end: &NaiveDate,
    ) -> Result<Vec<Self>, sqlx::Error> {
        let start_month = NaiveDate::from_ymd_opt(date.year(), date.month(), 1).unwrap();
        let end_month =
            NaiveDate::from_ymd_opt(date.year(), date.month(), date.days_in_month()).unwrap();
        let start_month_week = NaiveDate::from_isoywd_opt(
            start_month.iso_week().year(),
            start_month.iso_week().week(),
            Weekday::Mon,
        )
        .unwrap();
        let end_month_week = NaiveDate::from_isoywd_opt(
            end_month.iso_week().year(),
            end_month.iso_week().week(),
            Weekday::Sun,
        )
        .unwrap();
        let mut stream = Vec::new();
        let mut rows = sqlx::query_as(
            "
            WITH
                time_series AS (
                    SELECT
                        $3 AS user_id,
                        DATE_TRUNC('day', dd)::date AS date
                    FROM
                        GENERATE_SERIES($1::TIMESTAMP, $2::TIMESTAMP, '1 day'::INTERVAL) AS dd
                ),
                diet_day_total AS (
                    SELECT
                        t1.date,
                        t1.user_id,
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
                        SUM(t1.quantity * t2.fat * 9) / SUM(t1.quantity * t2.energy) * 100 AS fat_pct
                    FROM
                        food_log t1
                        LEFT JOIN food t2 ON t2.id = t1.food_id
                    WHERE
                        t1.user_id = $3
                    GROUP BY
                        t1.date,
                        t1.user_id
                )
            SELECT
                t1.date,
                t1.user_id,
                -- diet data
                t2.energy,
                t2.protein,
                t2.carbohydrate,
                t2.fat,
                -- diet week avg
                AVG(t2.energy) OVER (
                    PARTITION BY
                        DATE_TRUNC('week', t1.date),
                        t1.user_id
                ) AS week_avg_energy,
                AVG(t2.energy) OVER (
                    PARTITION BY
                        DATE_TRUNC('month', t1.date),
                        t1.user_id
                ) AS month_avg_energy,
                AVG(t2.protein) OVER (
                    PARTITION BY
                        DATE_TRUNC('week', t1.date),
                        t1.user_id
                ) AS week_avg_protein,
                AVG(t2.carbohydrate) OVER (
                    PARTITION BY
                        DATE_TRUNC('week', t1.date),
                        t1.user_id
                ) AS week_avg_carbohydrate,
                AVG(t2.fat) OVER (
                    PARTITION BY
                        DATE_TRUNC('week', t1.date),
                        t1.user_id
                ) AS week_avg_fat,
                
                -- target
                t4.energy AS target_energy,
                t4.protein AS target_protein,
                t4.carbohydrate AS target_carbohydrate,
                t4.fat AS target_fat,
                
                -- progress
                t3.id AS progress_id,
                t3.weight_kg AS weight,
                t3.energy_burnt,
                AVG(t3.energy_burnt) OVER (
                    PARTITION BY
                        DATE_TRUNC('week', t1.date),
                        t1.user_id
                ) AS week_avg_energy_burnt,
                AVG(t3.weight_kg) OVER (
                    PARTITION BY
                        DATE_TRUNC('week', t1.date),
                        t1.user_id
                ) AS week_avg_weight,
                -- month
                AVG(t3.weight_kg) OVER (
                    PARTITION BY
                        DATE_TRUNC('month', t3.date),
                        t1.user_id
                ) AS month_avg_weight
            FROM
                time_series t1
                LEFT JOIN diet_day_total t2 ON t2.date = t1.date
                LEFT JOIN progress t3 ON t3.date = t1.date AND t3.user_id = t1.user_id
                LEFT JOIN diet_target t4 ON t4.date = t1.date AND t4.user_id = t1.user_id
            WHERE
                t1.user_id = $3                
            ORDER BY
                t1.date
            ",
        )
        .bind(start_month_week)
        .bind(end_month_week)
        .bind(user_id)
        .fetch(pool);
        while let Some(row) = rows.try_next().await? {
            stream.push(row);
        }
        Ok(stream)
    }
}
