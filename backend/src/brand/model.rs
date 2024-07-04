use chrono::prelude::*;
use futures::TryStreamExt;
use serde::Serialize;
use sqlx::{FromRow, PgPool, Row};
use uuid::Uuid;

use crate::{db::Filters, util::query::QueryParams};

use super::serializer::BrandCreateSerializer;

#[derive(Debug, Serialize, FromRow)]
pub struct Brand {
    pub id: Uuid,
    pub name: String,
    pub slug: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,
    pub created_by_id: Uuid,
    pub updated_by_id: Option<Uuid>,
    pub image_url: Option<String>,
}

const ORDERING_FIELDS: &[&str] = &[
    "name",
    "food_count",
    "created_at",
    "updated_at",
    "created_by",
    "updated_by",
];

impl Brand {
    pub async fn check_unique_field(
        pool: &PgPool,
        field: &str,
    ) -> Result<Option<Self>, sqlx::Error> {
        let query = sqlx::query_as("SELECT * FROM food_brand WHERE LOWER(name) = $1")
            .bind(field)
            .fetch_optional(pool)
            .await?;
        Ok(query)
    }
    pub async fn create(
        pool: &PgPool,
        data: BrandCreateSerializer,
        created_by_id: Uuid,
    ) -> Result<Self, sqlx::Error> {
        let trimmed_name = data.name.trim();
        let slug = slug::slugify(&trimmed_name);
        let query = sqlx::query_as(
            "
            INSERT INTO
                food_brand (name, slug, image_url, created_by_id)
            VALUES
                ($1, $2, $3, $4)
            RETURNING
                *
            ",
        )
        .bind(trimmed_name)
        .bind(slug)
        .bind(data.image_url)
        .bind(created_by_id)
        .fetch_one(pool)
        .await?;
        Ok(query)
    }
    pub async fn get(pool: &PgPool, id: &Uuid) -> Result<Self, sqlx::Error> {
        let query = sqlx::query_as("SELECT * FROM food_brand WHERE id = $1")
            .bind(id)
            .fetch_one(pool)
            .await?;
        Ok(query)
    }
    pub async fn update(
        pool: &PgPool,
        id: Uuid,
        data: BrandCreateSerializer,
        updated_by_id: Uuid,
    ) -> Result<Self, sqlx::Error> {
        let trimmed_name = data.name.trim();
        let slug = slug::slugify(&trimmed_name);
        let query = sqlx::query_as(
            "
            UPDATE food_brand
            SET
                NAME = $1,
                slug = $2,
                image_url = $3,
                updated_at = $4,
                updated_by_id = $5
            WHERE
                id = $6
            RETURNING
                *
            ",
        )
        .bind(trimmed_name)
        .bind(slug)
        .bind(data.image_url)
        .bind(Utc::now())
        .bind(updated_by_id)
        .bind(id)
        .fetch_one(pool)
        .await?;
        Ok(query)
    }
    pub async fn delete(pool: &PgPool, id: &Uuid) -> Result<Self, sqlx::Error> {
        let query = sqlx::query_as("DELETE FROM food_brand WHERE id = $1 RETURNING *")
            .bind(id)
            .fetch_one(pool)
            .await?;
        Ok(query)
    }
    pub async fn get_from_slug(pool: &PgPool, slug: String) -> Result<Option<Self>, sqlx::Error> {
        let query = sqlx::query_as("SELECT * FROM food_brand WHERE slug = $1")
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
            DELETE FROM food_brand
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
pub struct BrandFilter {
    pub value: String,
    pub label: String,
}

impl BrandFilter {
    pub async fn all(pool: &PgPool) -> Result<Vec<Self>, sqlx::Error> {
        let mut stream = Vec::new();
        let mut rows = sqlx::query_as(
            "
            SELECT
                t1.slug AS value,
                CONCAT(t1.name, ' (', COUNT(t2.*), ')') AS label
            FROM
                food_brand t1
                LEFT JOIN food t2 ON t2.brand_id = t1.id
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
pub struct BrandSelect {
    pub id: Uuid,
    pub name: String,
}

impl BrandSelect {
    pub async fn all(pool: &PgPool) -> Result<Vec<Self>, sqlx::Error> {
        let mut stream = Vec::new();
        let mut rows = sqlx::query_as(
            "
            SELECT
                id,
                name
            FROM
                food_brand
            ORDER BY
                name
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
pub struct BrandSerializer {
    pub id: Uuid,
    pub name: String,
    pub slug: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,
    pub created_by_id: Uuid,
    pub updated_by_id: Option<Uuid>,
    pub image_url: Option<String>,
    pub food_count: Option<i64>,
    pub created_by: String,
    pub updated_by: Option<String>,
}

impl BrandSerializer {
    pub async fn count(pool: &PgPool, query: &QueryParams) -> Result<i64, sqlx::Error> {
        let mut q = sqlx::QueryBuilder::new("SELECT COUNT(t1.*) FROM food_brand t1 WHERE TRUE");
        q.search_filter("t1.name", query);
        let count = q.build().fetch_one(pool).await?.get("count");
        Ok(count)
    }
    pub async fn builder(pool: &PgPool, query: &QueryParams) -> Result<Vec<Self>, sqlx::Error> {
        let mut stream = Vec::new();
        let mut q = sqlx::QueryBuilder::new(
            "
            SELECT 
                t1.*,
                t2.username as created_by,
                t3.username as updated_by,
                (
                    SELECT
                        COUNT(*)
                    FROM
                        food
                    WHERE
                        brand_id = t1.id
                ) AS food_count
            FROM 
                food_brand t1
                LEFT JOIN users_user t2 ON t2.id = t1.created_by_id
                LEFT JOIN users_user t3 ON t3.id = t1.updated_by_id
            WHERE TRUE
            ",
        );
        q.search_filter("t1.name", query);

        q.ordering_filter(query, ORDERING_FIELDS, "name");

        q.paginate(query.page, query.size);

        let mut rows = q.build_query_as().fetch(pool);
        while let Some(row) = rows.try_next().await? {
            stream.push(row);
        }
        Ok(stream)
    }
}

#[derive(Debug, Serialize)]
pub struct BrandListResponse {
    pub count: i64,
    pub results: Vec<BrandSerializer>,
}
