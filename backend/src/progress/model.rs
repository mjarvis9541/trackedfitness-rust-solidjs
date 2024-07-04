use chrono::prelude::*;
use futures::TryStreamExt;
use rust_decimal::prelude::*;
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, PgPool, Row};
use uuid::Uuid;

use crate::util::query::QueryParams;

#[derive(Debug, Deserialize, Serialize, FromRow)]
pub struct Progress {
    pub id: Uuid,
    pub user_id: Uuid,
    pub date: NaiveDate,
    pub weight_kg: Option<Decimal>,
    pub energy_burnt: Option<i32>,
    pub notes: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,
    pub created_by_id: Uuid,
    pub updated_by_id: Option<Uuid>,
}

impl Progress {
    pub async fn count(pool: &PgPool, params: &QueryParams) -> Result<i64, sqlx::Error> {
        let mut q = sqlx::QueryBuilder::new("SELECT COUNT(t1.*) FROM progress t1 WHERE TRUE");
        if let Some(user_id) = params.user_id {
            q.push(" AND t1.user_id = ");
            q.push_bind(user_id);
        }
        let count = q.build().fetch_one(pool).await?.get("count");
        Ok(count)
    }
    pub async fn all(pool: &PgPool, params: &QueryParams) -> Result<Vec<Self>, sqlx::Error> {
        let mut stream = Vec::new();
        let mut q = sqlx::QueryBuilder::new("SELECT t1.* FROM progress t1 WHERE TRUE");
        if let Some(user_id) = params.user_id {
            q.push(" AND user_id = ");
            q.push_bind(user_id);
        }

        let mut rows = q.build_query_as().fetch(pool);
        while let Some(row) = rows.try_next().await? {
            stream.push(row);
        }
        Ok(stream)
    }
    pub async fn create(
        pool: &PgPool,
        user_id: Uuid,
        date: NaiveDate,
        weight: Option<Decimal>,
        energy_burnt: Option<i32>,
        notes: Option<String>,
        created_by_id: Uuid,
    ) -> Result<Self, sqlx::Error> {
        let query = sqlx::query_as(
            "
            INSERT INTO
                progress (
                    user_id,
                    date,
                    weight_kg,
                    energy_burnt,
                    notes,
                    created_by_id
                )
            VALUES
                ($1, $2, $3, $4, $5, $6)
            RETURNING
                *
            ",
        )
        .bind(user_id)
        .bind(date)
        .bind(weight)
        .bind(energy_burnt)
        .bind(notes)
        .bind(created_by_id)
        .fetch_one(pool)
        .await?;
        Ok(query)
    }
    pub async fn get(pool: &PgPool, id: &Uuid) -> Result<Option<Self>, sqlx::Error> {
        let query = sqlx::query_as(
            "
            SELECT
                t1.*,
                t2.username
            FROM
                progress t1
                LEFT JOIN users_user t2 ON t2.id = t1.user_id
            WHERE
                t1.id = $1
            ",
        )
        .bind(id)
        .fetch_optional(pool)
        .await?;
        Ok(query)
    }
    pub async fn get_by_username_date(
        pool: &PgPool,
        username: String,
        date: &NaiveDate,
    ) -> Result<Option<Self>, sqlx::Error> {
        let query = sqlx::query_as(
            "
            SELECT
                t1.*,
                t2.username
            FROM
                progress t1
                LEFT JOIN users_user t2 ON t2.id = t1.user_id
            WHERE
                t2.username = $1
                AND t1.date = $2
            ORDER BY
                t1.date DESC
            ",
        )
        .bind(username)
        .bind(date)
        .fetch_optional(pool)
        .await?;
        Ok(query)
    }
    pub async fn update(
        pool: &PgPool,
        id: Uuid,
        date: NaiveDate,
        weight: Option<Decimal>,
        energy_burnt: Option<i32>,
        notes: Option<String>,
        updated_by_id: Uuid,
    ) -> Result<Self, sqlx::Error> {
        let query = sqlx::query_as(
            "
            UPDATE progress
            SET
                date = $1,
                weight_kg = $2,
                energy_burnt = $3,
                notes = $4,
                updated_at = $5,
                updated_by_id = $6
            WHERE
                id = $7
            RETURNING
                *
            ",
        )
        .bind(date)
        .bind(weight)
        .bind(energy_burnt)
        .bind(notes)
        .bind(Utc::now())
        .bind(updated_by_id)
        .bind(id)
        .fetch_one(pool)
        .await?;
        Ok(query)
    }
    pub async fn delete(pool: &PgPool, id: &Uuid) -> Result<Self, sqlx::Error> {
        let query = sqlx::query_as("DELETE FROM progress WHERE id = $1 RETURNING *")
            .bind(id)
            .fetch_one(pool)
            .await?;
        Ok(query)
    }
    pub async fn stream(pool: &PgPool, username: &str) -> Result<Vec<Self>, sqlx::Error> {
        let mut stream = Vec::new();
        let mut rows = sqlx::query_as("SELECT * FROM progress WHERE username = $1")
            .bind(username)
            .fetch(pool);
        while let Some(row) = rows.try_next().await? {
            stream.push(row);
        }
        Ok(stream)
    }
    pub async fn get_latest(
        pool: &PgPool,
        username: &str,
        date: &NaiveDate,
    ) -> Result<Option<Self>, sqlx::Error> {
        let query = sqlx::query_as(
            "
            SELECT
                t1.*,
                t2.username
            FROM
                progress t1
                LEFT JOIN users_user t2 ON t2.id = t1.user_id
            WHERE
                t2.username = $1
                AND t1.date <= $2
            ORDER BY
                t1.date DESC
            ",
        )
        .bind(username)
        .bind(date)
        .fetch_optional(pool)
        .await?;
        Ok(query)
    }
    pub async fn get_latest_weight(
        pool: &PgPool,
        username: &String,
    ) -> Result<Option<Self>, sqlx::Error> {
        let query = sqlx::query_as(
            "
            SELECT
                t1.*,
                t2.username
            FROM
                progress t1
                LEFT JOIN users_user t2 ON t2.id = t1.user_id
            WHERE
                t2.username = $1
                AND t1.weight_kg IS NOT NULL
            ORDER BY
                t1.date DESC
            ",
        )
        .bind(username)
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
            DELETE FROM progress
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
            DELETE FROM progress
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
}

#[derive(Debug, Serialize, FromRow)]
pub struct ProgressAggregation {
    pub user_id: Option<Uuid>,
    pub date: Option<NaiveDate>,
    pub progress_id: Option<Uuid>,
    pub weight: Option<Decimal>,
    pub week_avg_weight: Option<Decimal>,
    pub month_avg_weight: Option<Decimal>,
    pub energy_burnt: Option<Decimal>,
    pub week_avg_energy_burnt: Option<Decimal>,
    pub month_avg_energy_burnt: Option<Decimal>,
    pub latest_weight_id: Option<Uuid>,
    pub latest_weight_date: Option<NaiveDate>,
    pub latest_weight: Option<Decimal>,
}

impl ProgressAggregation {
    pub async fn get(pool: &PgPool, user_id: Uuid, date: NaiveDate) -> Result<Self, sqlx::Error> {
        let query = sqlx::query_as(
            "
            WITH
            week_avg AS (
                SELECT
                    t1.user_id,
                    AVG(t1.weight_kg) AS week_avg_weight,
                    AVG(t1.energy_burnt) AS week_avg_energy_burnt,
                    SUM(t1.energy_burnt) AS week_total_energy_burnt
                FROM
                    progress t1
                WHERE
                    t1.user_id = $1
                    AND DATE_TRUNC('week', t1.date) = DATE_TRUNC('week', $2::date)
                GROUP BY
                    t1.user_id,
                    DATE_TRUNC('week', t1.date)
            ),
            month_avg AS (
                SELECT
                    t1.user_id,
                    AVG(t1.weight_kg) AS month_avg_weight,
                    AVG(t1.energy_burnt) AS month_avg_energy_burnt,
                    SUM(t1.energy_burnt) AS month_total_energy_burnt
                FROM
                    progress t1
                WHERE
                    t1.user_id = $1
                    AND DATE_TRUNC('month', t1.date) = DATE_TRUNC('month', $2::date)
                GROUP BY
                    t1.user_id,
                    DATE_TRUNC('month', t1.date)
            ),
            latest AS (
                SELECT
                    t1.id,
                    t1.date,
                    t1.user_id,
                    t1.weight_kg
                FROM
                    progress t1
                WHERE
                    t1.user_id = $1
                    AND t1.date <= $2
                    AND t1.weight_kg IS NOT NULL
                ORDER BY
                    t1.date DESC
                LIMIT
                    1
            )
        SELECT
            t1.id as user_id,
            t1.username,
            t5.date as date,
            t5.id as progress_id,
            t5.weight_kg as weight,
            t5.energy_burnt::decimal,
            t2.week_avg_weight,
            t2.week_avg_energy_burnt,
            t3.month_avg_weight,
            t3.month_avg_energy_burnt,
            t4.id AS latest_weight_id,
            t4.date AS latest_weight_date,
            t4.weight_kg AS latest_weight
        FROM
            users_user t1
            LEFT JOIN week_avg t2 ON t2.user_id = t1.id
            LEFT JOIN month_avg t3 ON t3.user_id = t1.id
            LEFT JOIN latest t4 ON t4.user_id = t1.id
            LEFT JOIN progress t5 ON t5.user_id = t1.id AND t5.date = $2
        WHERE
            t1.id = $1

            ",
        )
        .bind(user_id)
        .bind(date)
        .fetch_one(pool)
        .await?;
        Ok(query)
    }
}
