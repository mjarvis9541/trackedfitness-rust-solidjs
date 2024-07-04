use chrono::prelude::*;
use futures::TryStreamExt;
use serde::Serialize;
use sqlx::{FromRow, PgPool, Row};
use uuid::Uuid;

use crate::util::query::QueryParams;

#[derive(Debug, Serialize, FromRow)]
pub struct Follower {
    pub id: Uuid,
    pub user_id: Uuid,
    pub follower_id: Uuid,
    pub status: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,
}

impl Follower {
    pub async fn create(
        pool: &PgPool,
        user_id: &Uuid,
        follower_id: &Uuid,
        status: i32,
    ) -> Result<Self, sqlx::Error> {
        let query = sqlx::query_as(
            "
            INSERT INTO
            user_follower (user_id, follower_id, status)
            VALUES
                ($1, $2, $3)
            RETURNING
                *
            ",
        )
        .bind(user_id)
        .bind(follower_id)
        .bind(status)
        .fetch_one(pool)
        .await?;
        Ok(query)
    }
    pub async fn get(pool: &PgPool, id: &Uuid) -> Result<Self, sqlx::Error> {
        let query = sqlx::query_as("SELECT * FROM user_follower WHERE id = $1")
            .bind(id)
            .fetch_one(pool)
            .await?;
        Ok(query)
    }
    pub async fn update(
        pool: &PgPool,
        id: &Uuid,
        user_id: &Uuid,
        follower_id: &Uuid,
        status: i32,
    ) -> Result<Self, sqlx::Error> {
        let updated_at = Utc::now();
        let query = sqlx::query_as(
            "
            UPDATE user_follower
            SET
                user_id = $1,
                follower_id = $2,
                status = $3,
                updated_at = $4
            WHERE
                id = $5
            RETURNING
                *
            ",
        )
        .bind(user_id)
        .bind(follower_id)
        .bind(status)
        .bind(updated_at)
        .bind(id)
        .fetch_one(pool)
        .await?;
        Ok(query)
    }
    pub async fn delete(pool: &PgPool, id: &Uuid) -> Result<Self, sqlx::Error> {
        let query = sqlx::query_as("DELETE FROM user_follower WHERE id = $1 RETURNING *")
            .bind(id)
            .fetch_one(pool)
            .await?;
        Ok(query)
    }
    pub async fn is_following(
        pool: &PgPool,
        user_id: &Uuid,
        follower_id: &Uuid,
    ) -> Result<bool, sqlx::Error> {
        let query: Option<Self> = sqlx::query_as(
            "
            SELECT
                *
            FROM
                user_follower
            WHERE
                user_id = $1
                AND follower_id = $2
            ",
        )
        .bind(user_id)
        .bind(follower_id)
        .fetch_optional(pool)
        .await?;

        if query.is_some() {
            return Ok(true);
        } else {
            return Ok(false);
        }
    }
    pub async fn delete_id_range(
        pool: &PgPool,
        id_range: Vec<Uuid>,
    ) -> Result<Vec<Self>, sqlx::Error> {
        let query = sqlx::query_as(
            "
            DELETE FROM user_follower
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
pub struct FollowerSerializer {
    pub id: Uuid,
    pub user_id: Uuid,
    pub follower_id: Uuid,
    pub status: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,
    pub user: String,
    pub follower: String,
}

impl FollowerSerializer {
    pub async fn count(pool: &PgPool, params: &QueryParams) -> Result<i64, sqlx::Error> {
        let mut q = sqlx::QueryBuilder::new(
            "
        SELECT
            COUNT(t1.*)
        FROM
        user_follower t1
        WHERE
            TRUE
        ",
        );
        if let Some(user) = params.user_id {
            q.push(" AND t1.id = ");
            q.push_bind(user);
        }
        if let Some(follower) = params.follower_id {
            q.push(" AND t1.follower_id = ");
            q.push_bind(follower);
        }
        let count = q.build().fetch_one(pool).await?.get("count");
        Ok(count)
    }
    pub async fn all(pool: &PgPool, params: &QueryParams) -> Result<Vec<Self>, sqlx::Error> {
        let mut stream = Vec::new();
        let mut q = sqlx::QueryBuilder::new(
            "
            SELECT
                t1.id,
                t1.user_id,
                t1.follower_id,
                t1.status,
                t1.created_at,
                t1.updated_at,
                t2.username AS user,
                t3.username AS follower
            FROM
                user_follower t1
                LEFT JOIN users_user t2 ON t2.id = t1.user_id
                LEFT JOIN users_user t3 ON t3.id = t1.follower_id
            WHERE
                TRUE
            ",
        );
        if let Some(user) = params.user_id {
            q.push(" AND t1.id = ");
            q.push_bind(user);
        }
        if let Some(follower) = params.follower_id {
            q.push(" AND t1.follower_id = ");
            q.push_bind(follower);
        }
        q.push(" ORDER BY t2.username");
        let mut rows = q.build_query_as().fetch(pool);
        while let Some(row) = rows.try_next().await? {
            stream.push(row);
        }
        Ok(stream)
    }
}
