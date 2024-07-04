use chrono::prelude::*;
use futures::TryStreamExt;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, PgPool};
use uuid::Uuid;

use crate::util::query::QueryParams;

#[derive(Debug, Deserialize, Serialize, FromRow)]
pub struct SetJSON {
    // pub exercise_id: Uuid,
    pub set_id: Uuid,
    pub set_order: i32,
    pub weight: Decimal,
    pub reps: i32,
    pub rest: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Deserialize, Serialize, FromRow)]
pub struct ExerciseJSON {
    // pub workout_id: Uuid,
    pub exercise_id: Uuid,
    pub exercise_order: i32,
    pub name: String,
    pub set_count: i64,
    pub rep_count: i64,
    pub created_at: DateTime<Utc>,
    pub sets: sqlx::types::Json<Vec<Option<SetJSON>>>,
}

#[derive(Debug, Deserialize, Serialize, FromRow)]
pub struct WorkoutJSON {
    pub workout_id: Uuid,
    pub user_id: Uuid,
    pub username: String,
    pub date: NaiveDate,
    pub set_count: Option<Decimal>,
    pub rep_count: Option<Decimal>,
    pub exercise_count: Option<i64>,
    pub exercises: sqlx::types::Json<Vec<Option<ExerciseJSON>>>,
}

impl WorkoutJSON {
    pub async fn all(pool: &PgPool, params: QueryParams) -> Result<Vec<Self>, sqlx::Error> {
        let mut stream = Vec::new();
        let mut q = sqlx::QueryBuilder::new(
            "
            WITH
            cte_sets AS (
                SELECT
                    t0.id AS set_id,
                    t0.exercise_id,
                    t0.weight,
                    t0.order as set_order,
                    t0.reps,
                    t0.rest,
                    t0.created_at,
                    t0.updated_at
                FROM
                    tracked_set t0
            ),
            cte_exercises AS (
                SELECT
                    t1.id AS exercise_id,
                    t1.workout_id AS workout_id,
                    t1.order as exercise_order,
                    t1.created_at,
                    t2.name,
                    COUNT(t3.*) AS set_count,
                    SUM(COALESCE(t3.reps, 0)) AS rep_count,
                    JSON_AGG(t3 ORDER BY t3.set_order) AS SETS
                FROM
                    exercise t1
                    LEFT JOIN movement t2 ON t2.id = t1.movement_id
                    LEFT JOIN cte_sets t3 ON t3.exercise_id = t1.id
                GROUP BY
                    t1.id,
                    t2.id
                ORDER BY
                    t1.created_at
            )
        SELECT
            t1.id AS workout_id,
            t1.user_id,
            t1.date,
            t3.username,
            SUM(COALESCE(t2.set_count, 0)) AS set_count,
            SUM(COALESCE(t2.rep_count, 0)) AS rep_count,
            (
                SELECT
                    COUNT(*)
                FROM
                    exercise
                WHERE
                    workout_id = t1.id
            ) AS exercise_count,
            JSON_AGG(t2 ORDER BY t2.created_at, t2.exercise_order) AS exercises
        FROM
            workout t1
            LEFT JOIN cte_exercises t2 ON t2.workout_id = t1.id
            LEFT JOIN users_user t3 ON t3.id = t1.user_id
        WHERE
            true
        GROUP BY
            t1.id,
            t3.id
            ",
        );
        // if let Some(username) = params.username {
        //     q.push(" AND t3.username ILIKE ");
        //     q.push_bind(format!("%{}%", username));
        // }
        // if let Some(date) = params.date {
        //     q.push(" AND t1.date = ");
        //     q.push_bind(date);
        // }
        // q.push(
        //     "
        // GROUP BY
        //     t1.id,
        //     t3.id
        // ",
        // );
        // if let Some(order) = params.order {
        //     q.push(" ORDER BY ");
        //     let mut order = order;
        //     if !order.contains('-') {
        //         q.push(format!("{} ASC NULLS LAST", order));
        //     } else {
        //         order.remove(0);
        //         q.push(format!("{} DESC NULLS LAST", order));
        //     }
        // } else {
        //     q.push(" ORDER BY t1.date");
        // }
        let mut rows = q.build_query_as().fetch(pool);
        while let Some(row) = rows.try_next().await? {
            stream.push(row);
        }
        Ok(stream)
    }
}
