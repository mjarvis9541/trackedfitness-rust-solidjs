use chrono::prelude::*;
use futures::TryStreamExt;
use serde::Serialize;
use sqlx::{FromRow, PgPool, Row};
use uuid::Uuid;

use crate::{db::Filters, util::query::QueryParams};

const ORDERING_FIELDS: &[&str] = &["name", "created_at", "updated_at"];

use super::serializer::MuscleGroupInput;

#[derive(Debug, Serialize, FromRow)]
pub struct MuscleGroup {
    pub id: Uuid,
    pub name: String,
    pub slug: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,
    pub created_by_id: Uuid,
    pub updated_by_id: Option<Uuid>,
}

impl MuscleGroup {
    pub async fn create(
        pool: &PgPool,
        data: &MuscleGroupInput,
        created_by_id: &Uuid,
    ) -> Result<Self, sqlx::Error> {
        let trimmed_name = data.name.trim();
        let slug = slug::slugify(&trimmed_name);
        let query = sqlx::query_as(
            "
            INSERT INTO
                muscle_group (name, slug, created_by_id)
            VALUES
                ($1, $2, $3)
            RETURNING
                *
            ",
        )
        .bind(trimmed_name)
        .bind(slug)
        .bind(created_by_id)
        .fetch_one(pool)
        .await?;
        Ok(query)
    }
    pub async fn get(pool: &PgPool, id: &Uuid) -> Result<Self, sqlx::Error> {
        let query = sqlx::query_as("SELECT * FROM muscle_group WHERE id = $1")
            .bind(id)
            .fetch_one(pool)
            .await?;
        Ok(query)
    }
    pub async fn update(
        pool: &PgPool,
        id: &Uuid,
        data: &MuscleGroupInput,
        updated_by_id: &Uuid,
    ) -> Result<Self, sqlx::Error> {
        let updated_at = Utc::now();
        let trimmed_name = data.name.trim();
        let slug = slug::slugify(&trimmed_name);
        let query = sqlx::query_as(
            "
            UPDATE muscle_group
            SET
                name = $1,
                slug = $2,
                updated_at = $3,
                updated_by_id = $4
            WHERE
                id = $5
            RETURNING
                *
            ",
        )
        .bind(trimmed_name)
        .bind(slug)
        .bind(updated_at)
        .bind(updated_by_id)
        .bind(id)
        .fetch_one(pool)
        .await?;
        Ok(query)
    }
    pub async fn delete(pool: &PgPool, id: &Uuid) -> Result<Self, sqlx::Error> {
        let query = sqlx::query_as("DELETE FROM muscle_group WHERE id = $1 RETURNING *")
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
            DELETE FROM muscle_group
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
pub struct MuscleGroupSerializer {
    pub id: Uuid,
    pub name: String,
    pub slug: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,
    pub created_by_id: Uuid,
    pub updated_by_id: Option<Uuid>,
    //
    pub exercise_count: Option<i64>,
    pub created_by: String,
    pub updated_by: Option<String>,
}

impl MuscleGroupSerializer {
    pub async fn count(pool: &PgPool, params: &QueryParams) -> Result<i64, sqlx::Error> {
        let mut q = sqlx::QueryBuilder::new(
            "
        SELECT
            COUNT(t1.*)
        FROM
        muscle_group t1
        WHERE
            TRUE
        ",
        );
        q.filter_icontains("t1.name", &params.search);
        let count = q.build().fetch_one(pool).await?.get("count");
        Ok(count)
    }
    pub async fn all(pool: &PgPool, params: &QueryParams) -> Result<Vec<Self>, sqlx::Error> {
        let mut stream = Vec::new();
        let mut q = sqlx::QueryBuilder::new(
            "
        SELECT
            t1.*,
            t2.username as created_by,
            t3.username as updated_by,
            (
                SELECT
                    COUNT(t2.id)
                FROM
                    movement t2
                WHERE
                    t2.muscle_group_id = t1.id
            ) AS exercise_count
        FROM
            muscle_group t1
            LEFT JOIN users_user t2 ON t1.created_by_id = t2.id
            LEFT JOIN users_user t3 ON t1.updated_by_id = t3.id
        WHERE
            TRUE
            ",
        );
        q.filter_icontains("t1.name", &params.search);
        q.ordering_filter(&params, ORDERING_FIELDS, "t1.name");
        q.paginate(params.page, params.size);
        let mut rows = q.build_query_as().fetch(pool);
        while let Some(row) = rows.try_next().await? {
            stream.push(row);
        }
        Ok(stream)
    }
    pub async fn get(pool: &PgPool, id: &Uuid) -> Result<Option<Self>, sqlx::Error> {
        let query = sqlx::query_as(
            "
            SELECT
                t1.*,
                t2.username as created_by,
                t3.username as updated_by,
                (
                    SELECT
                        COUNT(t2.id)
                    FROM
                        movement t2
                    WHERE
                        t2.muscle_group_id = t1.id
                ) AS exercise_count
            FROM
                muscle_group t1
                LEFT JOIN users_user t2 ON t1.created_by_id = t2.id
                LEFT JOIN users_user t3 ON t1.updated_by_id = t3.id
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

#[derive(Debug, Serialize, FromRow)]
pub struct MuscleGroupFilter {
    pub slug: String,
    pub name: String,
}

impl MuscleGroupFilter {
    pub async fn all(pool: &PgPool) -> Result<Vec<Self>, sqlx::Error> {
        let mut stream = Vec::new();
        let mut rows = sqlx::query_as(
            "
            SELECT
                slug,
                name
            FROM
                muscle_group
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
pub struct MuscleGroupSelect {
    pub id: Uuid,
    pub name: String,
}

impl MuscleGroupSelect {
    pub async fn all(pool: &PgPool) -> Result<Vec<Self>, sqlx::Error> {
        let mut stream = Vec::new();
        let mut rows = sqlx::query_as(
            "
            SELECT
                id,
                name
            FROM
                muscle_group
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
