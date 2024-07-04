use serde::Serialize;
use sqlx::{FromRow, PgPool};
use uuid::Uuid;

#[derive(Debug, Serialize, FromRow)]
pub struct UserStats {
    pub id: Uuid,
    pub username: String,
    pub profile_id: Option<Uuid>,
    // socials
    pub follower_count: i64,
    pub following_count: i64,
    // diet logs
    pub diet_count: i64,
    pub diet_day_log_count: i64,
    pub diet_target_count: i64,
    pub progress_count: i64,
    // workout logs
    pub workout_count: i64,
    pub workout_day_log_count: i64,
    pub exercise_count: Option<i64>,
    pub set_count: Option<i64>,
    pub rep_count: Option<i64>,
    // global additions
    pub food_created_count: i64,
    pub brand_created_count: i64,
    pub meal_created_count: i64,
    pub meal_food_created_count: Option<i64>,
    pub meal_of_day_created_count: i64,
    pub movement_created_count: i64,
    pub muscle_group_created_count: i64,
}

impl UserStats {
    pub async fn get(pool: &PgPool, id: &Uuid) -> Result<Self, sqlx::Error> {
        let query = sqlx::query_as(
            "
            SELECT
                t1.id,
                t1.username,
                t2.id as profile_id,
                (SELECT COUNT(*) FROM food WHERE created_by_id = t1.id) as food_created_count,
                (SELECT COUNT(*) FROM food_brand WHERE created_by_id = t1.id) as brand_created_count,
                (SELECT COUNT(*) FROM food_log WHERE user_id = t1.id) as diet_count,
                (SELECT COUNT(DISTINCT(date)) FROM food_log WHERE user_id = t1.id) as diet_day_log_count,
                (SELECT COUNT(*) FROM diet_target WHERE user_id = t1.id) as diet_target_count,
                (SELECT COUNT(*) FROM progress WHERE user_id = t1.id) as progress_count,
                (SELECT COUNT(*) FROM meal WHERE user_id = t1.id) as meal_created_count,
                (SELECT COUNT(*) FROM user_follower WHERE user_id = t1.id) as follower_count,
                (SELECT COUNT(*) FROM user_follower WHERE follower_id = t1.id) as following_count,
                (SELECT COUNT(*) FROM workout WHERE user_id = t1.id) as workout_count,
                (SELECT COUNT(DISTINCT(date)) FROM workout WHERE user_id = t1.id) as workout_day_log_count,
                (SELECT COUNT(*) FROM movement WHERE created_by_id = t1.id) as movement_created_count,
                (SELECT COUNT(*) FROM muscle_group WHERE created_by_id = t1.id) as muscle_group_created_count,
                (SELECT COUNT(*) FROM meal_of_day WHERE created_by_id = t1.id) as meal_of_day_created_count,
                (
                    SELECT
                        COUNT(f1.id)
                    FROM
                        meal_food f1
                        LEFT JOIN meal f2 ON f2.id = f1.meal_id
                    WHERE
                        f2.user_id = t1.id
                ) AS meal_food_created_count,
                (
                    SELECT
                        COUNT(e1.id)
                    FROM
                        exercise e1
                    LEFT JOIN workout e2 ON e2.id = e1.workout_id
                    WHERE
                        e2.user_id = t1.id
                ) AS exercise_count,
                (
                    SELECT
                        COUNT(s1.id)
                    FROM
                        tracked_set s1
                        LEFT JOIN exercise s2 ON s2.id = s1.exercise_id
                        LEFT JOIN workout s3 ON s3.id = s2.workout_id
                    WHERE
                        s3.user_id = t1.id
                ) AS set_count,
                (
                    SELECT
                        SUM(r1.reps)
                    FROM
                        tracked_set r1
                        LEFT JOIN exercise r2 ON r2.id = r1.exercise_id
                        LEFT JOIN workout r3 ON r3.id = r2.workout_id
                    WHERE
                        r3.user_id = t1.id
                ) AS rep_count
            FROM
                users_user t1
                LEFT JOIN user_profile t2 ON t2.user_id = t1.id
            WHERE
                t1.id = $1
            ",
        )
        .bind(id)
        .fetch_one(pool)
        .await?;
        Ok(query)
    }
    pub async fn all(pool: &PgPool) -> Result<Vec<Self>, sqlx::Error> {
        let query = sqlx::query_as(
            "
            SELECT
                t1.id,
                t1.username,
                t2.id as profile_id,
                (SELECT COUNT(*) FROM food WHERE created_by_id = t1.id) as food_created_count,
                (SELECT COUNT(*) FROM food_brand WHERE created_by_id = t1.id) as brand_created_count,
                (SELECT COUNT(*) FROM food_log WHERE user_id = t1.id) as diet_count,
                (SELECT COUNT(DISTINCT(date)) FROM food_log WHERE user_id = t1.id) as diet_day_log_count,
                (SELECT COUNT(*) FROM diet_target WHERE user_id = t1.id) as diet_target_count,
                (SELECT COUNT(*) FROM progress WHERE user_id = t1.id) as progress_count,
                (SELECT COUNT(*) FROM meal WHERE user_id = t1.id) as meal_created_count,
                (SELECT COUNT(*) FROM user_follower WHERE user_id = t1.id) as follower_count,
                (SELECT COUNT(*) FROM user_follower WHERE follower_id = t1.id) as following_count,
                (SELECT COUNT(*) FROM workout WHERE user_id = t1.id) as workout_count,
                (SELECT COUNT(DISTINCT(date)) FROM workout WHERE user_id = t1.id) as workout_day_log_count,
                (SELECT COUNT(*) FROM movement WHERE created_by_id = t1.id) as movement_created_count,
                (SELECT COUNT(*) FROM muscle_group WHERE created_by_id = t1.id) as muscle_group_created_count,
                (SELECT COUNT(*) FROM meal_of_day WHERE created_by_id = t1.id) as meal_of_day_created_count,
                (
                    SELECT
                        COUNT(f1.id)
                    FROM
                        meal_food f1
                        LEFT JOIN meal f2 ON f2.id = f1.meal_id
                    WHERE
                        f2.user_id = t1.id
                ) AS meal_food_created_count,
                (
                    SELECT
                        COUNT(e1.id)
                    FROM
                        exercise e1
                    LEFT JOIN workout e2 ON e2.id = e1.workout_id
                    WHERE
                        e2.user_id = t1.id
                ) AS exercise_count,
                (
                    SELECT
                        COUNT(s1.id)
                    FROM
                        tracked_set s1
                        LEFT JOIN exercise s2 ON s2.id = s1.exercise_id
                        LEFT JOIN workout s3 ON s3.id = s2.workout_id
                    WHERE
                        s3.user_id = t1.id
                ) AS set_count,
                (
                    SELECT
                        SUM(r1.reps)
                    FROM
                        tracked_set r1
                        LEFT JOIN exercise r2 ON r2.id = r1.exercise_id
                        LEFT JOIN workout r3 ON r3.id = r2.workout_id
                    WHERE
                        r3.user_id = t1.id
                ) AS rep_count
            FROM
                users_user t1
                LEFT JOIN user_profile t2 ON t2.user_id = t1.id
            ",
        )
        .fetch_all(pool)
        .await?;
        Ok(query)
    }
}
