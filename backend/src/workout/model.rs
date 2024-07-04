use chrono::prelude::*;
use futures::TryStreamExt;
use serde::Serialize;
use sqlx::{FromRow, PgPool, Row};
use uuid::Uuid;

use crate::{db::Filters, util::query::QueryParams};

const ORDERING_FIELDS: &[&str] = &["date", "created_at", "updated_at"];

#[derive(Debug, Serialize, FromRow)]
pub struct Workout {
    pub id: Uuid,
    pub user_id: Uuid,
    pub date: NaiveDate,
    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,
    pub created_by_id: Uuid,
    pub updated_by_id: Option<Uuid>,
}

impl Workout {
    pub async fn create(
        pool: &PgPool,
        user_id: Uuid,
        date: NaiveDate,
        created_by_id: Uuid,
    ) -> Result<Self, sqlx::Error> {
        let query = sqlx::query_as(
            "
            INSERT INTO
                workout (user_id, date, created_by_id)
            VALUES
                ($1, $2, $3)
            RETURNING
                *
            ",
        )
        .bind(user_id)
        .bind(date)
        .bind(created_by_id)
        .fetch_one(pool)
        .await?;
        Ok(query)
    }
    pub async fn get(pool: &PgPool, id: &Uuid) -> Result<Option<Self>, sqlx::Error> {
        let query = sqlx::query_as(
            "
            SELECT
                *
            FROM
                workout
            WHERE
                id = $1
            ",
        )
        .bind(id)
        .fetch_optional(pool)
        .await?;
        Ok(query)
    }
    pub async fn update(
        pool: &PgPool,
        id: &Uuid,
        user_id: Uuid,
        date: NaiveDate,
        updated_by_id: Uuid,
    ) -> Result<Self, sqlx::Error> {
        let updated_at = Utc::now();
        let query = sqlx::query_as(
            "
            UPDATE workout
            SET
                user_id = $1,
                date = $2,
                updated_at = $3,
                updated_by_id = $4
            WHERE
                id = $5
            RETURNING
                *
            ",
        )
        .bind(user_id)
        .bind(date)
        .bind(updated_at)
        .bind(updated_by_id)
        .bind(id)
        .fetch_one(pool)
        .await?;
        Ok(query)
    }
    pub async fn delete(pool: &PgPool, id: &Uuid) -> Result<Self, sqlx::Error> {
        let query = sqlx::query_as(
            "
            DELETE FROM workout
            WHERE
                id = $1
            RETURNING
                *
            ",
        )
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
            DELETE FROM workout
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
pub struct WorkoutSerializer {
    pub id: Uuid,
    pub username: String,
    pub date: NaiveDate,
    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,
    pub created_by_id: Uuid,
    pub updated_by_id: Option<Uuid>,
    pub exercise_count: i64,
}

impl WorkoutSerializer {
    pub async fn count(pool: &PgPool, params: &QueryParams) -> Result<i64, sqlx::Error> {
        let mut q = sqlx::QueryBuilder::new(
            "
        SELECT
            COUNT(t1.*)
        FROM
            workout t1
            LEFT JOIN users_user t2 ON t2.id = t1.user_id
        WHERE
            TRUE
        ",
        );
        if let Some(search) = &params.username {
            q.push(" AND t2.username = ");
            q.push_bind(search.clone());
        }
        if let Some(date) = &params.date {
            q.push(" AND t1.date = ");
            q.push_bind(date.clone());
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
                t2.username,
                t1.date,
                t1.created_at,
                t1.updated_at,
                t1.created_by_id,
                t1.updated_by_id,
                (
                    SELECT
                        COUNT(*)
                    FROM
                        exercise
                    WHERE
                        workout_id = t1.id
                ) AS exercise_count
            FROM
                workout t1
                LEFT JOIN users_user t2 ON t2.id = t1.user_id
            WHERE
                TRUE
            ",
        );
        if let Some(search) = &params.username {
            q.push(" AND t2.username = ");
            q.push_bind(search.clone());
        }
        if let Some(date) = &params.date {
            q.push(" AND t1.date = ");
            q.push_bind(date.clone());
        }

        q.ordering_filter(&params, ORDERING_FIELDS, "t1.date desc");

        let mut rows = q.build_query_as().fetch(pool);
        while let Some(row) = rows.try_next().await? {
            stream.push(row);
        }
        Ok(stream)
    }
}

#[derive(Debug, Serialize, FromRow)]
pub struct WorkoutSelect {
    pub id: Uuid,
    pub name: String,
}

impl WorkoutSelect {
    pub async fn all(pool: &PgPool) -> Result<Vec<Self>, sqlx::Error> {
        let mut stream = Vec::new();
        let mut rows = sqlx::query_as(
            "
            SELECT
                t1.id,
                CONCAT(t1.date, ' - ', t2.username) AS name
            FROM
                workout t1
                LEFT JOIN users_user t2 ON t2.id = t1.user_id 
            ORDER BY
                t1.date
            ",
        )
        .fetch(pool);
        while let Some(row) = rows.try_next().await? {
            stream.push(row);
        }
        Ok(stream)
    }
}

#[derive(Debug, Default, Serialize, FromRow)]
pub struct WorkoutDateAggregator {
    pub user_id: Uuid,
    pub date: Option<NaiveDate>,
    pub set_count: Option<i64>,
    pub rep_count: Option<i64>,
    pub week_set_count: Option<i64>,
    pub week_rep_count: Option<i64>,
}

impl WorkoutDateAggregator {
    pub async fn get(
        pool: &PgPool,
        user_id: &Uuid,
        date: NaiveDate,
    ) -> Result<Option<Self>, sqlx::Error> {
        let query = sqlx::query_as(
            "
            WITH
            day_total AS (
                SELECT
                    t3.user_id,
                    t3.date,
                    COUNT(t1.*) AS set_count,
                    SUM(t1.reps) AS rep_count
                FROM
                    tracked_set t1
                    LEFT JOIN exercise t2 ON t2.id = t1.exercise_id
                    LEFT JOIN workout t3 ON t3.id = t2.workout_id
                WHERE
                    t3.user_id = $1
                    AND t3.date = $2
                GROUP BY
                    t3.user_id,
                    t3.date
            ),
            week_total AS (
                SELECT
                    t3.user_id,
                    COUNT(t1.*) AS week_set_count,
                    SUM(t1.reps) AS week_rep_count
                FROM
                    tracked_set t1
                    LEFT JOIN exercise t2 ON t2.id = t1.exercise_id
                    LEFT JOIN workout t3 ON t3.id = t2.workout_id
                WHERE
                    t3.user_id = $1
                    AND DATE_TRUNC('week', t3.date) = DATE_TRUNC('week', $2::date)
                GROUP BY
                    t3.user_id,
                    DATE_TRUNC('week', t3.date)
            )
        SELECT
            t1.id AS user_id,
            t2.date,
            t2.set_count,
            t2.rep_count,
            t3.week_set_count,
            t3.week_rep_count
        FROM
            users_user t1
            LEFT JOIN day_total t2 ON t2.user_id = t1.id
            LEFT JOIN week_total t3 ON t3.user_id = t1.id
        WHERE
            t1.id = $1
            ",
        )
        .bind(user_id)
        .bind(date)
        .fetch_optional(pool)
        .await?;
        Ok(query)
    }
}
