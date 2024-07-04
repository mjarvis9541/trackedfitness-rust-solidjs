use chrono::prelude::*;
use futures::TryStreamExt;
use serde::Serialize;
use sqlx::{FromRow, PgPool, Row};
use uuid::Uuid;

use crate::{db::Filters, util::query::QueryParams};

use super::serializer::MovementInput;

const ORDERING_FIELDS: &[&str] = &["name", "created_at", "updated_at"];

#[derive(Debug, Serialize, FromRow)]
pub struct Movement {
    pub id: Uuid,
    pub muscle_group_id: Uuid,
    pub name: String,
    pub slug: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,
    pub created_by_id: Uuid,
    pub updated_by_id: Option<Uuid>,
}

impl Movement {
    pub async fn create(
        pool: &PgPool,
        data: &MovementInput,
        created_by_id: &Uuid,
    ) -> Result<Self, sqlx::Error> {
        let trimmed_name = data.name.trim();
        let slug = slug::slugify(&trimmed_name);
        let query = sqlx::query_as(
            "
            INSERT INTO
            movement (name, slug, muscle_group_id, created_by_id)
            VALUES
                ($1, $2, $3, $4)
            RETURNING
                *
            ",
        )
        .bind(trimmed_name)
        .bind(slug)
        .bind(data.muscle_group_id)
        .bind(created_by_id)
        .fetch_one(pool)
        .await?;
        Ok(query)
    }
    pub async fn get(pool: &PgPool, id: &Uuid) -> Result<Self, sqlx::Error> {
        let query = sqlx::query_as("SELECT * FROM movement WHERE id = $1")
            .bind(id)
            .fetch_one(pool)
            .await?;
        Ok(query)
    }
    pub async fn update(
        pool: &PgPool,
        id: &Uuid,
        data: &MovementInput,
        updated_by_id: &Uuid,
    ) -> Result<Self, sqlx::Error> {
        let updated_at = Utc::now();
        let trimmed_name = data.name.trim();
        let slug = slug::slugify(&trimmed_name);
        let query = sqlx::query_as(
            "
            UPDATE movement
            SET
                name = $1,
                slug = $2,
                muscle_group_id = $3,
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
        .bind(data.muscle_group_id)
        .bind(updated_at)
        .bind(updated_by_id)
        .bind(id)
        .fetch_one(pool)
        .await?;
        Ok(query)
    }
    pub async fn delete(pool: &PgPool, id: &Uuid) -> Result<Self, sqlx::Error> {
        let query = sqlx::query_as("DELETE FROM movement WHERE id = $1 RETURNING *")
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
            DELETE FROM movement
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
pub struct MovementSerializer {
    pub id: Uuid,
    pub muscle_group_id: Uuid,
    pub name: String,
    pub slug: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,
    pub created_by_id: Uuid,
    pub updated_by_id: Option<Uuid>,
    //
    pub muscle_group_name: String,
    pub muscle_group_slug: String,
    pub created_by: String,
    pub updated_by: Option<String>,
}

impl MovementSerializer {
    pub async fn count(pool: &PgPool, params: &QueryParams) -> Result<i64, sqlx::Error> {
        let mut q = sqlx::QueryBuilder::new(
            "
        SELECT
            COUNT(t1.*)
        FROM
        movement t1
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
            t1.muscle_group_id,
            -- muscle group
            t4.name as muscle_group_name,
            t4.slug as muscle_group_slug,
            t2.username as created_by,
            t3.username as updated_by
        FROM
            movement t1
            LEFT JOIN users_user t2 ON t1.created_by_id = t2.id
            LEFT JOIN users_user t3 ON t1.updated_by_id = t3.id
            LEFT JOIN muscle_group t4 ON t1.muscle_group_id = t4.id
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
            t1.muscle_group_id,
            -- muscle group
            t4.name as muscle_group_name,
            t4.slug as muscle_group_slug,
            t2.username as created_by,
            t3.username as updated_by
        FROM
            movement t1
            LEFT JOIN users_user t2 ON t1.created_by_id = t2.id
            LEFT JOIN users_user t3 ON t1.updated_by_id = t3.id
            LEFT JOIN muscle_group t4 ON t1.muscle_group_id = t4.id
        WHERE
            t1.id = $1
            ",
        )
        .bind(id)
        .fetch_optional(pool)
        .await?;
        Ok(query)
    }
    pub async fn get_by_id(pool: &PgPool, id: &Uuid) -> Result<Option<Self>, sqlx::Error> {
        let query = sqlx::query_as(
            "
            SELECT
            t1.*,
            t1.muscle_group_id,
            -- muscle group
            t4.name as muscle_group_name,
            t4.slug as muscle_group_slug,
            t2.username as created_by,
            t3.username as updated_by
        FROM
            movement t1
            LEFT JOIN users_user t2 ON t1.created_by_id = t2.id
            LEFT JOIN users_user t3 ON t1.updated_by_id = t3.id
            LEFT JOIN muscle_group t4 ON t1.muscle_group_id = t4.id
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
pub struct MovementFilter {
    pub slug: String,
    pub name: String,
}

impl MovementFilter {
    pub async fn all(pool: &PgPool) -> Result<Vec<Self>, sqlx::Error> {
        let mut stream = Vec::new();
        let mut rows = sqlx::query_as(
            "
            SELECT
                slug,
                name
            FROM
                movement
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
pub struct MovementSelect {
    pub id: Uuid,
    pub name: String,
}

impl MovementSelect {
    pub async fn all(pool: &PgPool) -> Result<Vec<Self>, sqlx::Error> {
        let mut stream = Vec::new();
        let mut rows = sqlx::query_as(
            "
            SELECT
                id,
                name
            FROM
                movement
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
