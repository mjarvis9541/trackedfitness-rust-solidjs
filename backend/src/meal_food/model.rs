use chrono::prelude::*;
use futures::TryStreamExt;
use rust_decimal::Decimal;
use serde::Serialize;
use sqlx::{FromRow, PgPool, Row};
use uuid::Uuid;

use crate::{diet::model::Diet, util::query::QueryParams};

#[derive(Debug, Serialize, FromRow)]
pub struct MealFood {
    pub id: Uuid,
    pub meal_id: Uuid,
    pub food_id: Uuid,
    pub quantity: Decimal,
    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,
    pub created_by_id: Uuid,
    pub updated_by_id: Option<Uuid>,
}

impl MealFood {
    pub async fn count(pool: &PgPool, params: &QueryParams) -> Result<i64, sqlx::Error> {
        let mut q = sqlx::QueryBuilder::new("SELECT COUNT(t1.*) FROM meal_food t1 WHERE TRUE");
        let count = q.build().fetch_one(pool).await?.get("count");
        Ok(count)
    }
    pub async fn all(pool: &PgPool, params: &QueryParams) -> Result<Vec<Self>, sqlx::Error> {
        let mut stream = Vec::new();
        let mut q = sqlx::QueryBuilder::new("SELECT t1.* FROM meal_food t1 WHERE TRUE");
        let mut rows = q.build_query_as().fetch(pool);
        while let Some(row) = rows.try_next().await? {
            stream.push(row);
        }
        Ok(stream)
    }
    pub async fn create(
        pool: &PgPool,
        meal_id: Uuid,
        food_id: Uuid,
        quantity: Decimal,
        created_by_id: Uuid,
    ) -> Result<Self, sqlx::Error> {
        let query = sqlx::query_as(
            "
            INSERT INTO
                meal_food (meal_id, food_id, quantity, created_by_id)
            VALUES
                ($1, $2, $3, $4)
            RETURNING
                *
            ",
        )
        .bind(meal_id)
        .bind(food_id)
        .bind(quantity)
        .bind(created_by_id)
        .fetch_one(pool)
        .await?;
        Ok(query)
    }
    pub async fn get(pool: &PgPool, id: &Uuid) -> Result<Self, sqlx::Error> {
        let query = sqlx::query_as("SELECT * FROM meal_food WHERE id = $1")
            .bind(id)
            .fetch_one(pool)
            .await?;
        Ok(query)
    }
    pub async fn update(
        pool: &PgPool,
        id: Uuid,
        meal_id: Uuid,
        food_id: Uuid,
        quantity: Decimal,
        updated_by_id: Uuid,
    ) -> Result<Self, sqlx::Error> {
        let updated_at = Utc::now();
        let query: MealFood = sqlx::query_as(
            "
            UPDATE meal_food
            SET
                meal_id = $1,
                food_id = $2,
                quantity = $3,
                updated_at = $4,
                updated_by_id = $5
            WHERE
                id = $6
            RETURNING
                *
            ",
        )
        .bind(meal_id)
        .bind(food_id)
        .bind(quantity)
        .bind(updated_at)
        .bind(updated_by_id)
        .bind(id)
        .fetch_one(pool)
        .await?;
        Ok(query)
    }
    pub async fn delete(pool: &PgPool, id: &Uuid) -> Result<Self, sqlx::Error> {
        let query = sqlx::query_as("DELETE FROM meal_food WHERE id = $1 RETURNING *")
            .bind(id)
            .fetch_one(pool)
            .await?;
        Ok(query)
    }
    pub async fn food_from_meal(pool: &PgPool, meal_id: &Uuid) -> Result<Vec<Self>, sqlx::Error> {
        let query = sqlx::query_as("SELECT * FROM meal_food WHERE meal_id = $1")
            .bind(meal_id)
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
            DELETE FROM meal_food
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
    pub async fn create_from_diet_range(
        pool: &PgPool,
        meal_id: Uuid,
        diet_range: Vec<Diet>,
        created_by_id: Uuid,
    ) -> Result<Vec<Self>, sqlx::Error> {
        let mut meal_id_list: Vec<Uuid> = Vec::new();
        let mut food_id_list: Vec<Uuid> = Vec::new();
        let mut quantity_list: Vec<Decimal> = Vec::new();
        let mut created_by_id_list: Vec<Uuid> = Vec::new();
        for row in diet_range.iter() {
            meal_id_list.push(meal_id);
            food_id_list.push(row.food_id);
            quantity_list.push(row.quantity);
            created_by_id_list.push(created_by_id);
        }
        let query = sqlx::query_as(
            "
            INSERT INTO
                meal_food (meal_id, food_id, quantity, created_by_id)
            SELECT
                *
            FROM
                UNNEST($1::UUID[], $2::UUID[], $3::NUMERIC[], $4::UUID[])
            RETURNING
                *
            ",
        )
        .bind(&meal_id_list)
        .bind(&food_id_list)
        .bind(&quantity_list)
        .bind(&created_by_id_list)
        .fetch_all(pool)
        .await?;
        Ok(query)
    }
}

#[derive(Debug, Serialize, FromRow)]
pub struct MealFoodDetail {
    pub id: Uuid,
    pub meal_id: Uuid,
    pub food_id: Uuid,
    pub quantity: Decimal,
    pub meal_name: String,
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
    pub protein_pct: Decimal,
    pub carbohydrate_pct: Decimal,
    pub fat_pct: Decimal,
}

impl MealFoodDetail {
    pub async fn get(pool: &PgPool, id: &Uuid) -> Result<Option<Self>, sqlx::Error> {
        let query = sqlx::query_as(
            "
            SELECT
                t1.id,
                t1.meal_id,
                t1.food_id,
                t1.quantity,
                t1.quantity * t2.data_value AS data_value,
                t2.data_measurement AS data_measurement,
                t1.quantity * t2.energy AS energy,
                t1.quantity * t2.protein AS protein,
                t1.quantity * t2.carbohydrate AS carbohydrate,
                t1.quantity * t2.fat AS fat,
                t1.quantity * t2.saturates AS saturates,
                t1.quantity * t2.sugars AS sugars,
                t1.quantity * t2.fibre AS fibre,
                t1.quantity * t2.salt AS salt,
                (t2.protein * 4) / t2.energy * 100 AS protein_pct,
                (t2.carbohydrate * 4) / t2.energy * 100 AS carbohydrate_pct,
                (t2.fat * 9) / t2.energy * 100 AS fat_pct,
                -- food
                t2.name AS food_name,
                t2.slug AS food_slug,
                -- brand
                t3.name AS brand_name,
                t3.slug AS brand_slug,
                -- meal
                t4.name AS meal_name
            FROM
                meal_food t1
                LEFT JOIN food t2 ON t2.id = t1.food_id
                LEFT JOIN food_brand t3 ON t3.id = t2.brand_id
                LEFT JOIN meal t4 ON t4.id = t1.meal_id
                LEFT JOIN users_user t5 ON t5.id = t4.user_id
            WHERE
                t1.id = $1
            ",
        )
        .bind(id)
        .fetch_optional(pool)
        .await?;
        Ok(query)
    }
}
