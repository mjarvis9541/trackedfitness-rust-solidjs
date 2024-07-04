use chrono::prelude::*;
use futures::TryStreamExt;
use serde::Serialize;
use sqlx::{FromRow, PgPool, Row};
use uuid::Uuid;

use crate::{db::Filters, set::model::Set, util::query::QueryParams};

const ORDERING_FIELDS: &[&str] = &["created_at", "updated_at"];

use super::serializer::{ExerciseInput, ExerciseSetInput};

#[derive(Debug, Serialize, FromRow)]
pub struct Exercise {
    pub id: Uuid,
    pub workout_id: Uuid,
    pub movement_id: Uuid,
    pub order: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,
    pub created_by_id: Uuid,
    pub updated_by_id: Option<Uuid>,
}

impl Exercise {
    pub async fn create(
        pool: &PgPool,
        data: &ExerciseInput,
        created_by_id: &Uuid,
    ) -> Result<Self, sqlx::Error> {
        let query = sqlx::query_as(
            "
            INSERT INTO
                exercise (workout_id, movement_id, created_by_id)
            VALUES
                ($1, $2, $3)
            RETURNING
                *
            ",
        )
        .bind(&data.workout_id)
        .bind(&data.movement_id)
        .bind(created_by_id)
        .fetch_one(pool)
        .await?;
        Ok(query)
    }
    pub async fn get(pool: &PgPool, id: &Uuid) -> Result<Self, sqlx::Error> {
        let query = sqlx::query_as("SELECT * FROM exercise WHERE id = $1")
            .bind(id)
            .fetch_one(pool)
            .await?;
        Ok(query)
    }
    pub async fn update(
        pool: &PgPool,
        id: &Uuid,
        data: &ExerciseInput,
        updated_by_id: &Uuid,
    ) -> Result<Self, sqlx::Error> {
        let updated_at = Utc::now();
        let query = sqlx::query_as(
            "
            UPDATE exercise
            SET
                workout_id = $1,
                movement_id = $2,
                updated_at = $3,
                updated_by_id = $4
            WHERE
                id = $5
            RETURNING
                *
            ",
        )
        .bind(&data.workout_id)
        .bind(&data.movement_id)
        .bind(updated_at)
        .bind(updated_by_id)
        .bind(id)
        .fetch_one(pool)
        .await?;
        Ok(query)
    }
    pub async fn delete(pool: &PgPool, id: &Uuid) -> Result<Self, sqlx::Error> {
        let query = sqlx::query_as("DELETE FROM exercise WHERE id = $1 RETURNING *")
            .bind(id)
            .fetch_one(pool)
            .await?;
        Ok(query)
    }
    pub async fn create_exercise_and_sets(
        pool: &PgPool,
        data: ExerciseSetInput,
        created_by_id: Uuid,
    ) -> Result<Self, sqlx::Error> {
        let exercise: Exercise = sqlx::query_as(
            "
            INSERT INTO
                exercise (workout_id, movement_id, created_by_id)
            VALUES
                ($1, $2, $3)
            RETURNING
                *
            ",
        )
        .bind(data.workout_id)
        .bind(data.movement_id)
        .bind(&created_by_id)
        .fetch_one(pool)
        .await?;

        let mut exercise_id_list = Vec::new();
        let mut order_list = Vec::new();
        let mut weight_list = Vec::new();
        let mut reps_list = Vec::new();
        let mut rest_list = Vec::new();
        let mut created_by_id_list = Vec::new();

        for set in 1..=data.set_count {
            exercise_id_list.push(exercise.id);
            order_list.push(set);
            weight_list.push(data.weight);
            reps_list.push(data.reps);
            rest_list.push(data.rest);
            created_by_id_list.push(created_by_id);
        }

        let _query: Vec<Set> = sqlx::query_as(
            r#"
            INSERT INTO
            tracked_set (exercise_id, "order", weight, reps, rest, created_by_id)
            SELECT
                *
            FROM
                UNNEST(
                    $1::UUID[],
                    $2::INTEGER[],
                    $3::DECIMAL[],
                    $4::INTEGER[],
                    $5::INTEGER[],
                    $6::UUID[]
                )
            "#,
        )
        .bind(&exercise_id_list)
        .bind(&order_list)
        .bind(&weight_list)
        .bind(&reps_list)
        .bind(&rest_list)
        .bind(&created_by_id_list)
        .fetch_all(pool)
        .await?;
        Ok(exercise)
    }
    pub async fn delete_id_range(
        pool: &PgPool,
        id_range: Vec<Uuid>,
    ) -> Result<Vec<Self>, sqlx::Error> {
        let query = sqlx::query_as(
            "
            DELETE FROM exercise
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
pub struct ExerciseSerializer {
    pub id: Uuid,
    pub workout_id: Uuid,
    pub movement_id: Uuid,
    pub order: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,
    pub created_by_id: Uuid,
    pub updated_by_id: Option<Uuid>,
    //
    pub set_count: Option<i64>,
    pub rep_count: Option<i64>,
    pub created_by: String,
    pub updated_by: Option<String>,
}

impl ExerciseSerializer {
    pub async fn count(pool: &PgPool, params: &QueryParams) -> Result<i64, sqlx::Error> {
        let mut q = sqlx::QueryBuilder::new(
            "
        SELECT COUNT(t1.*) FROM exercise t1 WHERE TRUE
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
                (
                    SELECT
                        COUNT(t2.id)
                    FROM
                        tracked_set t2
                    WHERE
                        t2.exercise_id = t1.id
                ) AS set_count,
                (
                    SELECT
                        SUM(reps)
                    FROM
                        tracked_set
                    WHERE
                        exercise_id = t1.id
                ) AS rep_count
            FROM
                exercise t1
                LEFT JOIN users_user t2 ON t1.created_by_id = t2.id
                LEFT JOIN users_user t3 ON t1.updated_by_id = t3.id
            WHERE
                TRUE
            ",
        );
        q.ordering_filter(&params, ORDERING_FIELDS, "t1.order desc");
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
                        tracked_set t2
                    WHERE
                        t2.exercise_id = t1.id
                ) AS set_count,
                (
                    SELECT
                        SUM(reps)
                    FROM
                        tracked_set
                    WHERE
                        exercise_id = t1.id
                ) AS rep_count
            FROM
                exercise t1
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
pub struct ExerciseQuery {
    pub id: Uuid,
    pub workout_id: Uuid,
    pub movement_name: String,
    pub movement_slug: String,
    pub muscle_group_name: String,
    pub muscle_group_slug: String,
}

impl ExerciseQuery {
    pub async fn get_by_workout(
        pool: &PgPool,
        workout_id: &Uuid,
    ) -> Result<Vec<Self>, sqlx::Error> {
        let mut stream = Vec::new();
        let mut rows = sqlx::query_as(
            "
            SELECT
                t1.id,
                t1.workout_id,
                t2.name AS movement_name,
                t2.slug AS movement_slug,
                t3.name AS muscle_group_name,
                t3.slug AS muscle_group_slug
            FROM
                exercise t1
                LEFT JOIN movement t2 ON t1.movement_id = t2.id
                LEFT JOIN muscle_group t3 ON t2.muscle_group_id = t3.id
            WHERE
                workout_id = $1
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

#[derive(Debug, Serialize, FromRow)]
pub struct ExerciseSelect {
    pub id: Uuid,
    pub name: String,
}

impl ExerciseSelect {
    pub async fn all(pool: &PgPool) -> Result<Vec<Self>, sqlx::Error> {
        let mut stream = Vec::new();
        let mut rows = sqlx::query_as(
            "
            SELECT
                t1.id,
                CONCAT(t3.date, ': ', t2.name) AS name
            FROM
                exercise t1
                LEFT JOIN movement t2 ON t2.id = t1.movement_id
                LEFT JOIN workout t3 ON t3.id = t1.workout_id
            ORDER BY
                t2.name
            ",
        )
        .fetch(pool);
        while let Some(row) = rows.try_next().await? {
            stream.push(row);
        }
        Ok(stream)
    }
}
