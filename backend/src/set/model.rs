use chrono::prelude::*;
use futures::TryStreamExt;
use rust_decimal::Decimal;
use serde::Serialize;
use sqlx::{FromRow, PgPool, Row};
use uuid::Uuid;

use crate::{db::Filters, util::query::QueryParams};

use super::serializer::{SetInput, SetRangeInput};

const ORDERING_FIELDS: &[&str] = &[
    "order",
    "weight",
    "reps",
    "rest",
    "created_at",
    "updated_at",
];

#[derive(Debug, Serialize, FromRow)]
pub struct Set {
    pub id: Uuid,
    pub exercise_id: Uuid,
    pub order: i32,
    pub weight: Decimal,
    pub reps: i32,
    pub rest: Option<i32>,
    pub notes: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,
    pub created_by_id: Uuid,
    pub updated_by_id: Option<Uuid>,
}

impl Set {
    pub async fn create(
        pool: &PgPool,
        data: &SetInput,
        created_by_id: &Uuid,
    ) -> Result<Self, sqlx::Error> {
        let query = sqlx::query_as(
            "
            INSERT INTO
            tracked_set (exercise_id, weight, reps, rest, notes, created_by_id)
            VALUES
                ($1, $2, $3, $4, $5, $6)
            RETURNING
                *
            ",
        )
        .bind(&data.exercise_id)
        .bind(&data.weight)
        .bind(&data.reps)
        .bind(&data.rest)
        .bind(&data.notes)
        .bind(created_by_id)
        .fetch_one(pool)
        .await?;
        Ok(query)
    }
    pub async fn get(pool: &PgPool, id: &Uuid) -> Result<Self, sqlx::Error> {
        let query = sqlx::query_as("SELECT * FROM tracked_set WHERE id = $1")
            .bind(id)
            .fetch_one(pool)
            .await?;
        Ok(query)
    }
    pub async fn update(
        pool: &PgPool,
        id: &Uuid,
        data: &SetInput,
        updated_by_id: &Uuid,
    ) -> Result<Self, sqlx::Error> {
        let updated_at = Utc::now();
        let query = sqlx::query_as(
            r#"
            UPDATE tracked_set
            SET
                exercise_id = $1,
                "order" = $2,
                weight = $3,
                reps = $4,
                rest = $5,
                notes = $6,
                updated_at = $7,
                updated_by_id = $8
            WHERE
                id = $9
            RETURNING
                *
            "#,
        )
        .bind(&data.exercise_id)
        .bind(&data.order)
        .bind(&data.weight)
        .bind(&data.reps)
        .bind(&data.rest)
        .bind(&data.notes)
        .bind(updated_at)
        .bind(updated_by_id)
        .bind(id)
        .fetch_one(pool)
        .await?;
        Ok(query)
    }
    pub async fn delete(pool: &PgPool, id: &Uuid) -> Result<Self, sqlx::Error> {
        let query = sqlx::query_as("DELETE FROM tracked_set WHERE id = $1 RETURNING *")
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
            DELETE FROM tracked_set
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
    pub async fn get_last_added(
        pool: &PgPool,
        exercise_id: &Uuid,
    ) -> Result<Option<Self>, sqlx::Error> {
        let query = sqlx::query_as(
            "
            SELECT
                *
            FROM
                tracked_set t1
            WHERE
                t1.exercise_id = $1
            ORDER BY
                t1.created_at DESC
            LIMIT
                1
            ",
        )
        .bind(exercise_id)
        .fetch_optional(pool)
        .await?;
        Ok(query)
    }
    pub async fn create_range(
        pool: &PgPool,
        data: SetRangeInput,
        created_by_id: Uuid,
    ) -> Result<Vec<Self>, sqlx::Error> {
        let mut exercise_id_list = Vec::new();
        let mut order_list = Vec::new();
        let mut weight_list = Vec::new();
        let mut reps_list = Vec::new();
        let mut rest_list = Vec::new();
        let mut notes_list = Vec::new();
        let mut created_by_id_list = Vec::new();

        for set in 1..=data.set_count {
            exercise_id_list.push(data.exercise_id);
            order_list.push(set);
            weight_list.push(data.weight);
            reps_list.push(data.reps);
            rest_list.push(data.rest);
            notes_list.push(data.notes.clone());
            created_by_id_list.push(created_by_id);
        }

        let query = sqlx::query_as(
            r#"
            INSERT INTO
            tracked_set (exercise_id, "order", weight, reps, rest, notes, created_by_id)
            SELECT
                *
            FROM
                UNNEST(
                    $1::UUID[],
                    $2::INTEGER[],
                    $3::DECIMAL[],
                    $4::INTEGER[],
                    $5::INTEGER[],
                    $6::VARCHAR[],
                    $7::UUID[]
                )
            RETURNING
                *
            "#,
        )
        .bind(&exercise_id_list)
        .bind(&order_list)
        .bind(&weight_list)
        .bind(&reps_list)
        .bind(&rest_list)
        .bind(&notes_list)
        .bind(&created_by_id_list)
        .fetch_all(pool)
        .await?;
        Ok(query)
    }
}

#[derive(Debug, Serialize, FromRow)]
pub struct SetSerializer {
    pub id: Uuid,
    pub exercise_id: Uuid,
    pub workout_id: Uuid,
    pub order: i32,
    pub weight: Decimal,
    pub reps: i32,
    pub rest: Option<i32>,
    pub notes: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,
    pub created_by_id: Uuid,
    pub updated_by_id: Option<Uuid>,
    pub created_by: String,
    pub updated_by: Option<String>,
}

impl SetSerializer {
    pub async fn count(pool: &PgPool, params: &QueryParams) -> Result<i64, sqlx::Error> {
        let mut q = sqlx::QueryBuilder::new(
            "
        SELECT
            COUNT(t1.*)
        FROM
            tracked_set t1
        WHERE
            TRUE
        ",
        );
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
            t5.id as workout_id
        FROM
            tracked_set t1
            LEFT JOIN users_user t2 ON t2.id = t1.created_by_id
            LEFT JOIN users_user t3 ON t3.id = t1.updated_by_id
            LEFT JOIN exercise t4 ON t4.id = t1.exercise_id
            LEFT JOIN workout t5 ON t5.id = t4.workout_id
        WHERE
            TRUE
            ",
        );

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
                t5.id as workout_id
            FROM
                tracked_set t1
                LEFT JOIN users_user t2 ON t2.id = t1.created_by_id
                LEFT JOIN users_user t3 ON t3.id = t1.updated_by_id
                LEFT JOIN exercise t4 ON t4.id = t1.exercise_id
                LEFT JOIN workout t5 ON t5.id = t4.workout_id
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

#[derive(Debug, Serialize, Clone, FromRow)]
pub struct SetQuery {
    pub id: Uuid,
    pub exercise_id: Uuid,
    pub weight: Decimal,
    pub reps: i32,
}

impl SetQuery {
    pub async fn get_by_workout(
        pool: &PgPool,
        workout_id: &Uuid,
    ) -> Result<Vec<Self>, sqlx::Error> {
        let mut stream = Vec::new();
        let mut rows = sqlx::query_as(
            "
            SELECT
                t1.id,
                t1.exercise_id,
                t1.weight,
                t1.reps
            FROM
                tracked_set t1
                LEFT JOIN exercise t2 ON t2.id = t1.exercise_id
            WHERE
                t2.workout_id = $1
            ORDER BY
                t1.created_at
            ",
        )
        .bind(workout_id)
        .fetch(pool);
        while let Some(row) = rows.try_next().await? {
            stream.push(row);
        }
        Ok(stream)
    }
}
