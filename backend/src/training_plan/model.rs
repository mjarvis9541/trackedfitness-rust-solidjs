use chrono::prelude::*;
use futures::TryStreamExt;
use serde::Serialize;
use sqlx::{FromRow, PgPool, Row};
use uuid::Uuid;

use crate::{error::AppError, util::query::QueryParams};

#[derive(Debug, Serialize, FromRow)]
pub struct TrainingPlan {
    pub id: Uuid,
    pub user_id: Uuid,
    pub name: String,
    pub slug: String,
    pub duration: i32,
    pub description: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,
    pub created_by_id: Uuid,
    pub updated_by_id: Option<Uuid>,
}

// impl TrainingPlan {
//     fn validate_name(&self)
// }

// impl TrainingPlan {
//     pub async fn count(pool: &PgPool, params: &QueryParams) -> Result<i64, sqlx::Error> {
//         let mut q = sqlx::QueryBuilder::new("SELECT COUNT(t1.*) FROM training_plan t1 WHERE TRUE");
//         let count = q.build().fetch_one(pool).await?.get("count");
//         Ok(count)
//     }
//     pub async fn all(pool: &PgPool, params: &QueryParams) -> Result<Vec<Self>, sqlx::Error> {
//         let mut stream = Vec::new();
//         let mut q = sqlx::QueryBuilder::new("SELECT t1.* FROM training_plan t1 WHERE TRUE");
//         let mut rows = q.build_query_as().fetch(pool);
//         while let Some(row) = rows.try_next().await? {
//             stream.push(row);
//         }
//         Ok(stream)
//     }
//     pub async fn create(pool: &PgPool) -> Result<Self, sqlx::Error> {
//         let query = sqlx::query_as("SELECT * FROM training_plan")
//             .fetch_one(pool)
//             .await?;
//         Ok(query)
//     }
//     pub async fn get(pool: &PgPool, id: &Uuid) -> Result<Self, sqlx::Error> {
//         let query = sqlx::query_as("SELECT t1.* FROM training_plan t1 WHERE t1.id = $1")
//             .bind(id)
//             .fetch_one(pool)
//             .await?;
//         Ok(query)
//     }
//     pub async fn get_opt(pool: &PgPool, id: &Uuid) -> Result<Option<Self>, sqlx::Error> {
//         let query = sqlx::query_as("SELECT t1.* FROM training_plan t1 WHERE t1.id = $1")
//             .bind(id)
//             .fetch_optional(pool)
//             .await?;
//         Ok(query)
//     }
//     pub async fn update(pool: &PgPool, id: &Uuid) -> Result<Self, sqlx::Error> {
//         let query = sqlx::query_as("SELECT * FROM training_plan WHERE id = $1")
//             .bind(id)
//             .fetch_one(pool)
//             .await?;
//         Ok(query)
//     }
//     pub async fn delete(pool: &PgPool, id: &Uuid) -> Result<Self, sqlx::Error> {
//         let query = sqlx::query_as("DELETE FROM training_plan t1 WHERE t1.id = $1 RETURNING *")
//             .bind(id)
//             .fetch_one(pool)
//             .await?;
//         Ok(query)
//     }
//     pub async fn delete_id_range(
//         pool: &PgPool,
//         range: Vec<Uuid>,
//     ) -> Result<Vec<Self>, sqlx::Error> {
//         let query =
//             sqlx::query_as("DELETE FROM training_plan t1 WHERE t1.id = ANY ($1) RETURNING *")
//                 .bind(range)
//                 .fetch_all(pool)
//                 .await?;
//         Ok(query)
//     }
// }
