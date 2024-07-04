use chrono::prelude::*;
use futures::TryStreamExt;
use serde::Serialize;
use sqlx::{FromRow, PgPool, Row};
use uuid::Uuid;

use crate::{db::Filters, util::query::QueryParams};

use super::serializer::MealOfDayInput;

const ORDERING_FIELDS: &[&str] = &["name", "ordering", "created_at", "updated_at"];

#[derive(Debug, Serialize, FromRow)]
pub struct MealOfDay {
    pub id: Uuid,
    pub name: String,
    pub slug: String,
    pub ordering: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,
    pub created_by_id: Uuid,
    pub updated_by_id: Option<Uuid>,
}

impl MealOfDay {
    pub async fn count(pool: &PgPool, params: &QueryParams) -> Result<i64, sqlx::Error> {
        let mut q = sqlx::QueryBuilder::new(
            "
        SELECT
            COUNT(t1.*)
        FROM
            meal_of_day t1
        WHERE
            TRUE
        ",
        );
        q.filter_icontains("t1.name", &params.search);
        let count = q.build().fetch_one(pool).await?.get("count");
        Ok(count)
    }
    pub async fn all(pool: &PgPool) -> Result<Vec<Self>, sqlx::Error> {
        let mut stream = Vec::new();
        let mut rows = sqlx::query_as("SELECT * FROM meal_of_day ORDER BY ordering").fetch(pool);
        while let Some(row) = rows.try_next().await? {
            stream.push(row);
        }
        Ok(stream)
    }
    pub async fn query(pool: &PgPool, params: &QueryParams) -> Result<Vec<Self>, sqlx::Error> {
        let mut stream = Vec::new();
        let mut q = sqlx::QueryBuilder::new(
            "
            SELECT
                t1.*
            FROM
                meal_of_day t1
            WHERE
                TRUE
            ",
        );
        q.filter_icontains("t1.name", &params.search);
        q.ordering_filter(&params, ORDERING_FIELDS, "t1.ordering");
        q.paginate(params.page, params.size);
        let mut rows = q.build_query_as().fetch(pool);
        while let Some(row) = rows.try_next().await? {
            stream.push(row);
        }
        Ok(stream)
    }
    pub async fn create(
        pool: &PgPool,
        data: &MealOfDayInput,
        created_by_id: Uuid,
    ) -> Result<Self, sqlx::Error> {
        let trimmed_name = data.name.trim();
        let slug = slug::slugify(&trimmed_name);
        let query = sqlx::query_as(
            "
            INSERT INTO
            meal_of_day (name, slug, ordering, created_by_id)
            VALUES
                ($1, $2, $3, $4)
            RETURNING
                *
            ",
        )
        .bind(trimmed_name)
        .bind(slug)
        .bind(data.ordering)
        .bind(created_by_id)
        .fetch_one(pool)
        .await?;
        Ok(query)
    }
    pub async fn get(pool: &PgPool, id: &Uuid) -> Result<Self, sqlx::Error> {
        let query = sqlx::query_as("SELECT * FROM meal_of_day WHERE id = $1")
            .bind(id)
            .fetch_one(pool)
            .await?;
        Ok(query)
    }
    pub async fn update(
        pool: &PgPool,
        id: Uuid,
        data: &MealOfDayInput,
        updated_by_id: Uuid,
    ) -> Result<Self, sqlx::Error> {
        let updated_at = Utc::now().date_naive();
        let trimmed_name = data.name.trim();
        let slug = slug::slugify(&trimmed_name);
        let query = sqlx::query_as(
            "
            UPDATE meal_of_day
            SET
                name = $1,
                slug = $2,
                ordering = $3,
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
        .bind(data.ordering)
        .bind(updated_at)
        .bind(updated_by_id)
        .bind(id)
        .fetch_one(pool)
        .await?;
        Ok(query)
    }
    pub async fn delete(pool: &PgPool, id: &Uuid) -> Result<Self, sqlx::Error> {
        let query = sqlx::query_as("DELETE FROM meal_of_day WHERE id = $1 RETURNING *")
            .bind(id)
            .fetch_one(pool)
            .await?;
        Ok(query)
    }
    pub async fn get_from_slug(pool: &PgPool, slug: &str) -> Result<Option<Self>, sqlx::Error> {
        let query = sqlx::query_as("SELECT * FROM meal_of_day WHERE slug = $1")
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
            DELETE FROM meal_of_day
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
pub struct MealOfDaySelect {
    pub id: Uuid,
    pub name: String,
}

impl MealOfDaySelect {
    pub async fn all(pool: &PgPool) -> Result<Vec<Self>, sqlx::Error> {
        let query = sqlx::query_as(
            "
            SELECT
                id,
                name
            FROM
                meal_of_day
            ORDER BY
                ordering
        ",
        )
        .fetch_all(pool)
        .await?;
        Ok(query)
    }
}
