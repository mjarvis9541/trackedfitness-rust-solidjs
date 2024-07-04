use chrono::prelude::*;
use futures::TryStreamExt;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, PgPool, Row};
use uuid::Uuid;

use crate::{db::Filters, util::query::QueryParams};

#[derive(Debug, Serialize, FromRow)]
pub struct Meal {
    pub id: Uuid,
    pub user_id: Uuid,
    pub name: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,
    pub created_by_id: Uuid,
    pub updated_by_id: Option<Uuid>,
}

impl Meal {
    pub async fn create(
        pool: &PgPool,
        user_id: Uuid,
        name: String,
        created_by_id: Uuid,
    ) -> Result<Self, sqlx::Error> {
        let trimmed_name = name.trim();
        let query = sqlx::query_as(
            "
            INSERT INTO
                meal (user_id, name, created_by_id)
            VALUES
                ($1, $2, $3)
            RETURNING
                *
            ",
        )
        .bind(user_id)
        .bind(trimmed_name)
        .bind(created_by_id)
        .fetch_one(pool)
        .await?;
        Ok(query)
    }
    pub async fn get(pool: &PgPool, id: &Uuid) -> Result<Self, sqlx::Error> {
        let query = sqlx::query_as("SELECT * FROM meal WHERE id = $1")
            .bind(id)
            .fetch_one(pool)
            .await?;
        Ok(query)
    }
    pub async fn update(
        pool: &PgPool,
        id: Uuid,
        user_id: Uuid,
        name: String,
        updated_by_id: Uuid,
    ) -> Result<Self, sqlx::Error> {
        let trimmed_name = name.trim();
        let updated_at = Utc::now();
        let query = sqlx::query_as(
            "
            UPDATE meal
            SET
                user_id = $1,
                name = $2,
                updated_at = $3,
                updated_by_id = $4
            WHERE
                id = $5
            RETURNING
                *
            ",
        )
        .bind(user_id)
        .bind(trimmed_name)
        .bind(updated_at)
        .bind(updated_by_id)
        .bind(id)
        .fetch_one(pool)
        .await?;
        Ok(query)
    }
    pub async fn delete(pool: &PgPool, id: &Uuid) -> Result<Self, sqlx::Error> {
        let query = sqlx::query_as("DELETE FROM meal WHERE id = $1 RETURNING *")
            .bind(id)
            .fetch_one(pool)
            .await?;
        Ok(query)
    }
    pub async fn delete_id_range(
        pool: &PgPool,
        id_range: Vec<Uuid>,
    ) -> Result<Vec<Self>, sqlx::Error> {
        let query = sqlx::query_as(
            "
            DELETE FROM meal
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
}

#[derive(Debug, Serialize, FromRow)]
pub struct MealFilter {
    pub id: Uuid,
    pub name: String,
}

impl MealFilter {
    pub async fn stream(pool: &PgPool) -> Result<Vec<Self>, sqlx::Error> {
        let mut stream = Vec::new();
        let mut rows = sqlx::query_as(
            "
            SELECT
                t1.id,
                CONCAT(t1.name, ' (', COUNT(t2.*), ')') AS name
            FROM
                meal t1
                LEFT JOIN meal_food t2 ON t2.meal_id = t1.id
                LEFT JOIN food t3 ON t3.id = t2.food_id
            GROUP BY
                t1.name,
            ORDER BY
                t1.name
            ",
        )
        .fetch(pool);
        while let Some(row) = rows.try_next().await? {
            stream.push(row);
        }
        Ok(stream)
    }
}

#[derive(Debug, Serialize, FromRow)]
pub struct MealSelect {
    pub id: Uuid,
    pub name: String,
}

impl MealSelect {
    pub async fn stream(pool: &PgPool) -> Result<Vec<Self>, sqlx::Error> {
        let mut stream = Vec::new();
        let mut rows = sqlx::query_as(
            "
            SELECT
                t1.id,
                CONCAT(t1.name, ' (', COUNT(t2.*), ')') AS name
            FROM
                meal t1
                LEFT JOIN meal_food t2 ON t2.meal_id = t1.id
                LEFT JOIN food t3 ON t3.id = t2.food_id
            GROUP BY
                t1.id
            ORDER BY
                t1.name
            ",
        )
        .fetch(pool);
        while let Some(row) = rows.try_next().await? {
            stream.push(row);
        }
        Ok(stream)
    }
}

#[derive(Debug, Serialize, FromRow)]
pub struct MealSerializer {
    pub id: Uuid,
    pub user_id: Uuid,
    pub name: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,
    pub created_by_id: Uuid,
    pub updated_by_id: Option<Uuid>,
    // non-table fields
    pub food_count: Option<i64>,
    pub energy: Option<Decimal>,
    pub protein: Option<Decimal>,
    pub carbohydrate: Option<Decimal>,
    pub fat: Option<Decimal>,
    pub saturates: Option<Decimal>,
    pub sugars: Option<Decimal>,
    pub fibre: Option<Decimal>,
    pub salt: Option<Decimal>,
    pub username: String,
}

impl MealSerializer {
    pub async fn count(pool: &PgPool, query: &QueryParams) -> Result<i64, sqlx::Error> {
        let mut q = sqlx::QueryBuilder::new("SELECT COUNT(t1.*) FROM meal t1 WHERE TRUE");
        q.filter_icontains("t1.name", &query.search);
        q.filter_exact("t4.username", &query.username);
        let count = q.build().fetch_one(pool).await?.get("count");
        Ok(count)
    }
    pub async fn all(pool: &PgPool, params: QueryParams) -> Result<Vec<Self>, sqlx::Error> {
        let mut stream = Vec::new();
        let mut q = sqlx::QueryBuilder::new(
            "
        SELECT
            t1.id,
            t1.user_id,
            t1.name,
            t1.created_at,
            t1.updated_at,
            t1.created_by_id,
            t1.updated_by_id,
            COUNT(t2.*) AS food_count,
            SUM(t2.quantity * t3.energy) AS energy,
            SUM(t2.quantity * t3.protein) AS protein,
            SUM(t2.quantity * t3.carbohydrate) AS carbohydrate,
            SUM(t2.quantity * t3.fat) AS fat,
            SUM(t2.quantity * t3.saturates) AS saturates,
            SUM(t2.quantity * t3.sugars) AS sugars,
            SUM(t2.quantity * t3.fibre) AS fibre,
            SUM(t2.quantity * t3.salt) AS salt,
            t4.username
        FROM
            meal t1
            LEFT JOIN meal_food t2 ON t1.id = t2.meal_id
            LEFT JOIN food t3 ON t2.food_id = t3.id
            LEFT JOIN users_user t4 ON t1.user_id = t4.id
        WHERE
            TRUE
        ",
        );
        if let Some(search) = params.search {
            q.push(" AND t1.name ILIKE ");
            q.push_bind(format!("%{}%", search));
        }
        if let Some(username) = params.username {
            q.push(" AND t4.username = ");
            q.push_bind(username);
        }
        q.push(
            "
            GROUP BY
                t1.id,
                t4.username
            ",
        );
        // q.ordering_filter(&params, ORDERING_FIELDS, "t1.date desc");

        q.paginate(params.page, params.size);

        let mut rows = q.build_query_as().fetch(pool);
        while let Some(row) = rows.try_next().await? {
            stream.push(row);
        }
        Ok(stream)
    }
}

#[derive(Debug, Deserialize)]
pub struct MealDeserializer {
    pub user_id: Uuid,
    pub name: String,
}

#[derive(Debug, Clone, Serialize, FromRow)]
pub struct MealFoodSerializer {
    pub id: Uuid,
    pub meal_id: Uuid,
    pub food_id: Uuid,
    pub quantity: Decimal,
    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,
    pub created_by_id: Uuid,
    pub updated_by_id: Option<Uuid>,
    pub meal_name: String,
    pub food_name: String,
    pub food_slug: String,
    pub brand_name: String,
    pub brand_slug: String,
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
    pub meal_energy: Option<Decimal>,
    pub meal_protein: Option<Decimal>,
    pub meal_carbohydrate: Option<Decimal>,
    pub meal_fat: Option<Decimal>,
    pub meal_saturates: Option<Decimal>,
    pub meal_sugars: Option<Decimal>,
    pub meal_fibre: Option<Decimal>,
    pub meal_salt: Option<Decimal>,
}

impl MealFoodSerializer {
    pub async fn all(pool: &PgPool, id: &Uuid) -> Result<Vec<Self>, sqlx::Error> {
        let mut stream = Vec::new();
        let mut q = sqlx::QueryBuilder::new(
            "
            SELECT
                t1.id,
                -- t4.user_id,
                t1.meal_id,
                t1.food_id,
                t1.created_at,
                t1.updated_at,
                t1.created_by_id,
                t1.updated_by_id,
                t4.name AS meal_name,
                -- food
                t2.name AS food_name,
                t2.slug AS food_slug,
                -- brand
                t3.name AS brand_name,
                t3.slug AS brand_slug,
                -- food
                t1.quantity,
                t1.quantity * t2.data_value AS data_value,
                t2.data_measurement,
                t1.quantity * t2.energy AS energy,
                t1.quantity * t2.protein AS protein,
                t1.quantity * t2.carbohydrate AS carbohydrate,
                t1.quantity * t2.fat AS fat,
                t1.quantity * t2.saturates AS saturates,
                t1.quantity * t2.sugars AS sugars,
                t1.quantity * t2.fibre AS fibre,
                t1.quantity * t2.salt AS salt,
                SUM(t1.quantity * t2.energy) OVER (
                    PARTITION BY
                        t4.id
                ) AS meal_energy,
                SUM(t1.quantity * t2.protein) OVER (
                    PARTITION BY
                        t4.id
                ) AS meal_protein,
                SUM(t1.quantity * t2.carbohydrate) OVER (
                    PARTITION BY
                        t4.id
                ) AS meal_carbohydrate,
                SUM(t1.quantity * t2.fat) OVER (
                    PARTITION BY
                        t4.id
                ) AS meal_fat,
                SUM(t1.quantity * t2.saturates) OVER (
                    PARTITION BY
                        t4.id
                ) AS meal_saturates,
                SUM(t1.quantity * t2.sugars) OVER (
                    PARTITION BY
                        t4.id
                ) AS meal_sugars,
                SUM(t1.quantity * t2.fibre) OVER (
                    PARTITION BY
                        t4.id
                ) AS meal_fibre,
                SUM(t1.quantity * t2.salt) OVER (
                    PARTITION BY
                        t4.id
                ) AS meal_salt
            FROM
                meal_food t1
                LEFT JOIN food t2 ON t1.food_id = t2.id
                LEFT JOIN food_brand t3 ON t2.brand_id = t3.id
                LEFT JOIN meal t4 ON t1.meal_id = t4.id
                LEFT JOIN users_user t5 ON t4.user_id = t5.id
        WHERE
            TRUE
        ",
        );
        q.push(" AND t4.id = ");
        q.push_bind(id);

        let mut rows = q.build_query_as().fetch(pool);
        while let Some(row) = rows.try_next().await? {
            stream.push(row);
        }
        Ok(stream)
    }
}

#[derive(Debug, Default, Serialize)]
pub struct SavedMeal {
    pub id: Uuid,
    pub name: String,
    pub energy: Decimal,
    pub protein: Decimal,
    pub carbohydrate: Decimal,
    pub fat: Decimal,
    pub saturates: Decimal,
    pub sugars: Decimal,
    pub fibre: Decimal,
    pub salt: Decimal,
    pub food: Vec<SavedMealFood>,
}

#[derive(Debug, Default, Serialize)]
pub struct SavedMealFood {
    pub id: Uuid,
    pub meal_id: Uuid,
    pub food_name: String,
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

impl SavedMeal {
    pub async fn build_frontend_data(meal_food: Vec<MealFoodSerializer>) -> Self {
        let mut meal = if meal_food.is_empty() {
            SavedMeal::default()
        } else {
            let meal = meal_food.clone().into_iter().nth(0).unwrap();
            let food = Vec::new();
            SavedMeal {
                id: meal.meal_id,
                name: meal.meal_name,
                energy: meal.meal_energy.unwrap_or_default(),
                protein: meal.meal_protein.unwrap_or_default(),
                carbohydrate: meal.meal_carbohydrate.unwrap_or_default(),
                fat: meal.meal_fat.unwrap_or_default(),
                saturates: meal.meal_saturates.unwrap_or_default(),
                sugars: meal.meal_sugars.unwrap_or_default(),
                fibre: meal.meal_fibre.unwrap_or_default(),
                salt: meal.meal_salt.unwrap_or_default(),
                food,
            }
        };
        for food in meal_food {
            meal.food.push(SavedMealFood {
                id: food.id,
                meal_id: food.meal_id,
                food_name: food.food_name,
                brand_name: food.brand_name,
                data_value: food.data_value.unwrap_or_default(),
                data_measurement: food.data_measurement,
                energy: food.energy.unwrap_or_default(),
                protein: food.protein.unwrap_or_default(),
                carbohydrate: food.carbohydrate.unwrap_or_default(),
                fat: food.fat.unwrap_or_default(),
                saturates: food.saturates.unwrap_or_default(),
                sugars: food.sugars.unwrap_or_default(),
                fibre: food.fibre.unwrap_or_default(),
                salt: food.salt.unwrap_or_default(),
            })
        }
        meal
    }
}
