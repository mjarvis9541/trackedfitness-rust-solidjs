use chrono::prelude::*;
use futures::TryStreamExt;
use rust_decimal::Decimal;
use serde::Serialize;
use sqlx::{FromRow, PgPool, Row};
use uuid::Uuid;

use crate::{db::Filters, middleware::RequestUser, util::query::QueryParams};

use super::serializer::FoodDeserializer;

pub const DATA_MEASUREMENT_OPTS: &[&str; 3] = &["g", "ml", "srv"];

const ORDERING_FIELDS: &[&str] = &[
    "name",
    "energy",
    "fat",
    "saturates",
    "carbohydrate",
    "sugars",
    "fibre",
    "protein",
    "salt",
    "food_count",
    "created_at",
    "updated_at",
    // auth only
    "added_count",
    "last_added_qty",
    "last_added_date",
];

#[derive(Debug, Serialize, FromRow)]
pub struct Food {
    pub id: Uuid,
    pub name: String,
    pub slug: String,
    pub brand_id: Uuid,
    pub data_value: i32,
    pub data_measurement: String,
    pub energy: i32,
    pub fat: Decimal,
    pub saturates: Decimal,
    pub carbohydrate: Decimal,
    pub sugars: Decimal,
    pub fibre: Decimal,
    pub protein: Decimal,
    pub salt: Decimal,
    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,
    pub created_by_id: Uuid,
    pub updated_by_id: Option<Uuid>,
}

impl Food {
    pub async fn create(
        pool: &PgPool,
        data: &FoodDeserializer,
        created_by_id: &Uuid,
    ) -> Result<Self, sqlx::Error> {
        let trimmed_name = data.name.trim();
        let slug = slug::slugify(&trimmed_name);
        let query = sqlx::query_as(
            "
            INSERT INTO
            food (
                name,
                slug,
                brand_id,
                data_value,
                data_measurement,
                energy,
                fat,
                saturates,
                carbohydrate,
                sugars,
                fibre,
                protein,
                salt,
                created_by_id
            )
        VALUES
            (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7,
                $8,
                $9,
                $10,
                $11,
                $12,
                $13,
                $14
            )
        RETURNING
            *
            ",
        )
        .bind(trimmed_name)
        .bind(slug)
        .bind(data.brand_id)
        .bind(data.data_value)
        .bind(&data.data_measurement)
        .bind(data.energy)
        .bind(data.fat)
        .bind(data.saturates)
        .bind(data.carbohydrate)
        .bind(data.sugars)
        .bind(data.fibre)
        .bind(data.protein)
        .bind(data.salt)
        .bind(created_by_id)
        .fetch_one(pool)
        .await?;
        Ok(query)
    }
    pub async fn get(pool: &PgPool, id: &Uuid) -> Result<Self, sqlx::Error> {
        let query = sqlx::query_as("SELECT * FROM food WHERE id = $1")
            .bind(id)
            .fetch_one(pool)
            .await?;
        Ok(query)
    }
    pub async fn get_opt(pool: &PgPool, id: &Uuid) -> Result<Option<Self>, sqlx::Error> {
        let query = sqlx::query_as("SELECT * FROM food WHERE id = $1")
            .bind(id)
            .fetch_optional(pool)
            .await?;
        Ok(query)
    }
    pub async fn update(
        pool: &PgPool,
        id: &Uuid,
        data: &FoodDeserializer,
        updated_by_id: &Uuid,
    ) -> Result<Self, sqlx::Error> {
        let trimmed_name = data.name.trim();
        let slug = slug::slugify(&trimmed_name);
        let updated_at = Utc::now();
        let query = sqlx::query_as(
            "
            UPDATE food
            SET
                name = $1,
                slug = $2,
                brand_id = $3,
                data_value = $4,
                data_measurement = $5,
                energy = $6,
                fat = $7,
                saturates = $8,
                carbohydrate = $9,
                sugars = $10,
                fibre = $11,
                protein = $12,
                salt = $13,
                updated_at = $14,
                updated_by_id = $15
            WHERE
                id = $16
            RETURNING
                *
            ",
        )
        .bind(trimmed_name)
        .bind(slug)
        .bind(data.brand_id)
        .bind(data.data_value)
        .bind(&data.data_measurement)
        .bind(data.energy)
        .bind(data.fat)
        .bind(data.saturates)
        .bind(data.carbohydrate)
        .bind(data.sugars)
        .bind(data.fibre)
        .bind(data.protein)
        .bind(data.salt)
        .bind(updated_at)
        .bind(updated_by_id)
        .bind(id)
        .fetch_one(pool)
        .await?;
        Ok(query)
    }
    pub async fn delete(pool: &PgPool, id: &Uuid) -> Result<Self, sqlx::Error> {
        let query = sqlx::query_as("DELETE FROM food WHERE id = $1 RETURNING *")
            .bind(id)
            .fetch_one(pool)
            .await?;
        Ok(query)
    }
    pub async fn get_from_slug(pool: &PgPool, slug: &str) -> Result<Option<Self>, sqlx::Error> {
        let query = sqlx::query_as("SELECT * FROM food WHERE slug = $1")
            .bind(slug)
            .fetch_optional(pool)
            .await?;
        Ok(query)
    }
    pub async fn delete_id_range(
        pool: &PgPool,
        id_range: Vec<Uuid>,
    ) -> Result<Vec<Self>, sqlx::Error> {
        let query = sqlx::query_as(
            "
            DELETE FROM food
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
pub struct FoodSerializer {
    pub id: Uuid,
    pub name: String,
    pub slug: String,
    pub brand_id: Uuid,
    pub brand_name: String,
    pub brand_slug: String,
    pub brand_image_url: Option<String>,
    pub data_value: i32,
    pub data_measurement: String,
    pub energy: i32,
    pub fat: Decimal,
    pub saturates: Decimal,
    pub carbohydrate: Decimal,
    pub sugars: Decimal,
    pub fibre: Decimal,
    pub protein: Decimal,
    pub salt: Decimal,
    pub protein_pct: Option<Decimal>,
    pub carbohydrate_pct: Option<Decimal>,
    pub fat_pct: Option<Decimal>,
    pub added_count: Option<i64>,
    pub last_added_qty: Option<Decimal>,
    pub last_added_date: Option<DateTime<Utc>>,
}

impl FoodSerializer {
    pub async fn count(pool: &PgPool, query: &QueryParams) -> Result<i64, sqlx::Error> {
        let mut q = sqlx::QueryBuilder::new("SELECT COUNT(t1.*) FROM food t1 WHERE TRUE");
        q.filter_icontains("t1.name", &query.search);
        q.filter_exact("t1.data_measurement", &query.serving);
        q.filter_exact("t2.slug", &query.brand);
        let count = q.build().fetch_one(pool).await?.get("count");
        Ok(count)
    }
    pub async fn all(
        pool: &PgPool,
        params: &QueryParams,
        request_user: RequestUser,
    ) -> Result<Vec<Self>, sqlx::Error> {
        let mut stream = Vec::new();
        let mut q = sqlx::QueryBuilder::new(
            "
            SELECT
                t1.*,
                t2.name AS brand_name,
                t2.slug AS brand_slug,
                t2.image_url AS brand_image_url,
                NULLIF(t1.protein * 4, 0) / t1.energy * 100 AS protein_pct,
                NULLIF(t1.carbohydrate * 4, 0) / t1.energy * 100 AS carbohydrate_pct,
                NULLIF(t1.fat * 9, 0) / t1.energy * 100 AS fat_pct,
            ",
        );
        if request_user.is_authenticated {
            q.push("(SELECT COUNT(*) FROM food_log WHERE food_id = t1.id AND user_id = ");
            q.push_bind(request_user.id);
            q.push(") AS added_count,");

            q.push("(SELECT quantity FROM food_log WHERE food_id = t1.id AND user_id = ");
            q.push_bind(request_user.id);
            q.push(" ORDER BY food_log.created_at DESC LIMIT 1) AS last_added_qty,");

            q.push("(SELECT created_at FROM food_log WHERE food_log.food_id = t1.id AND food_log.user_id = ");
            q.push_bind(request_user.id);
            q.push(" ORDER BY food_log.created_at DESC LIMIT 1) AS last_added_date");
        } else {
            q.push("null AS added_count,");
            q.push("null AS last_added_qty,");
            q.push("null AS last_added_date");
        }
        q.push(
            "
            FROM
                food t1
                LEFT JOIN food_brand t2 ON t1.brand_id = t2.id
            WHERE
                TRUE
            ",
        );
        q.filter_icontains("t1.name", &params.search);
        q.filter_exact("t1.data_measurement", &params.serving);
        q.filter_exact("t2.slug", &params.brand);

        q.ordering_filter(&params, ORDERING_FIELDS, "t1.name");

        q.paginate(params.page, params.size);

        let mut rows = q.build_query_as().fetch(pool);
        while let Some(row) = rows.try_next().await? {
            stream.push(row);
        }
        Ok(stream)
    }
    pub async fn get(
        pool: &PgPool,
        id: &Uuid,
        request_user: RequestUser,
    ) -> Result<Option<Self>, sqlx::Error> {
        let mut q = sqlx::QueryBuilder::new(
            "
        SELECT
            t1.*,
            t2.name AS brand_name,
            t2.slug AS brand_slug,
            t2.image_url AS brand_image_url,
            NULLIF(t1.protein * 4, 0) / t1.energy * 100 AS protein_pct,
            NULLIF(t1.carbohydrate * 4, 0) / t1.energy * 100 AS carbohydrate_pct,
            NULLIF(t1.fat * 9, 0) / t1.energy * 100 AS fat_pct,
        ",
        );
        if request_user.is_authenticated {
            q.push("(SELECT COUNT(*) FROM food_log WHERE food_id = t1.id AND user_id = ");
            q.push_bind(request_user.id);
            q.push(") AS added_count,");

            q.push("(SELECT quantity FROM food_log WHERE food_id = t1.id AND user_id = ");
            q.push_bind(request_user.id);
            q.push(" ORDER BY food_log.created_at DESC LIMIT 1) AS last_added_qty,");

            q.push("(SELECT created_at FROM food_log WHERE food_log.food_id = t1.id AND food_log.user_id = ");
            q.push_bind(request_user.id);
            q.push(" ORDER BY food_log.created_at DESC LIMIT 1) AS last_added_date");
        } else {
            q.push("null AS added_count");
            q.push("null AS last_added_qty");
            q.push("null AS last_added_date");
        }
        q.push(
            "
        FROM
            food t1
            LEFT JOIN food_brand t2 ON t2.id = t1.brand_id
        ",
        );
        q.push(" WHERE t1.id = ");
        q.push_bind(id);
        let query = q.build_query_as().fetch_optional(pool).await?;
        Ok(query)
    }
}

#[derive(Debug, Serialize, FromRow)]
pub struct FoodSelect {
    pub id: Uuid,
    pub name: String,
}

impl FoodSelect {
    pub async fn all(pool: &PgPool) -> Result<Vec<Self>, sqlx::Error> {
        let mut stream = Vec::new();
        let mut rows = sqlx::query_as(
            "
            SELECT
                id,
                name
            FROM
                food
            ORDER BY
                name
            LIMIT 100
            ",
        )
        .fetch(pool);
        while let Some(row) = rows.try_next().await? {
            stream.push(row);
        }
        Ok(stream)
    }
}
