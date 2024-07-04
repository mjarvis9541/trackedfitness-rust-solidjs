use chrono::prelude::*;
use futures::TryStreamExt;
use rust_decimal::Decimal;
use serde::Serialize;
use sqlx::{FromRow, PgPool, Row};
use uuid::Uuid;

use crate::{db::Filters, util::query::QueryParams};

use super::serializer::DietTargetCreateInput;

// const ORDERING_FIELDS: &[&str] = &[
//     "date",
//     "energy",
//     "fat",
//     "saturates",
//     "carbohydrate",
//     "sugars",
//     "fibre",
//     "protein",
//     "salt",
//     "created_at",
//     "updated_at",
// ];

#[derive(Debug, Serialize, FromRow)]
pub struct DietTarget {
    pub id: Uuid,
    pub user_id: Uuid,
    pub date: NaiveDate,
    pub weight: Decimal,
    pub energy: i32,
    pub fat: Decimal,
    pub saturates: Decimal,
    pub carbohydrate: Decimal,
    pub sugars: Decimal,
    pub fibre: Decimal,
    pub protein: Decimal,
    pub salt: Decimal,
    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,
    pub created_by_id: Uuid,
    pub updated_by_id: Option<Uuid>,
}

impl DietTarget {
    pub async fn count(pool: &PgPool, params: &QueryParams) -> Result<i64, sqlx::Error> {
        let mut q = sqlx::QueryBuilder::new("SELECT COUNT(t1.*) FROM diet_target t1 WHERE TRUE");
        if let Some(user_id) = params.user_id {
            q.push(" AND t1.user_id = ");
            q.push_bind(user_id);
        }
        let count = q.build().fetch_one(pool).await?.get("count");
        Ok(count)
    }
    pub async fn get_from_user_id_date(
        pool: &PgPool,
        user_id: &Uuid,
        date: &NaiveDate,
    ) -> Result<Option<Self>, sqlx::Error> {
        let query = sqlx::query_as("SELECT * FROM diet_target WHERE user_id = $1 AND date = $2")
            .bind(user_id)
            .bind(date)
            .fetch_optional(pool)
            .await?;
        Ok(query)
    }
    pub async fn admin_all(pool: &PgPool, params: &QueryParams) -> Result<Vec<Self>, sqlx::Error> {
        let mut stream = Vec::new();
        let mut q = sqlx::QueryBuilder::new(
            "
            SELECT * FROM diet_target 
            where true
            ",
        );
        if let Some(user_id) = params.user_id {
            q.push(" AND user_id = ");
            q.push_bind(user_id);
        }

        // q.ordering_filter(&params, ORDERING_FIELDS, "t1.date desc");

        q.paginate(params.page, params.size);

        let mut rows = q.build_query_as().fetch(pool);
        while let Some(row) = rows.try_next().await? {
            stream.push(row);
        }
        Ok(stream)
    }

    pub async fn admin_get(pool: &PgPool, id: &Uuid) -> Result<Self, sqlx::Error> {
        let query = sqlx::query_as("SELECT * FROM diet_target WHERE id = $1")
            .bind(id)
            .fetch_one(pool)
            .await?;
        Ok(query)
    }

    pub async fn all(pool: &PgPool, user_id: &Uuid) -> Result<Vec<Self>, sqlx::Error> {
        let mut stream = Vec::new();
        let mut rows = sqlx::query_as("SELECT * FROM diet_target WHERE user_id = $1")
            .bind(user_id)
            .fetch(pool);
        while let Some(row) = rows.try_next().await? {
            stream.push(row);
        }
        Ok(stream)
    }
    pub async fn get(
        pool: &PgPool,
        username: &str,
        date: &NaiveDate,
    ) -> Result<Option<Self>, sqlx::Error> {
        let query = sqlx::query_as(
            "
            SELECT
                t1.*
            FROM
                diet_target t1
                LEFT JOIN users_user t2 ON t2.id = t1.user_id
            WHERE
                t1.date = $1
                AND t2.username = $2
            ",
        )
        .bind(date)
        .bind(username)
        .fetch_optional(pool)
        .await?;
        Ok(query)
    }
    pub async fn create(
        pool: &PgPool,
        data: DietTargetCreateInput,
        created_by_id: &Uuid,
    ) -> Result<Self, sqlx::Error> {
        let protein = data.weight * data.protein_per_kg;
        let carbohydrate = data.weight * data.carbohydrate_per_kg;
        let fat = data.weight * data.fat_per_kg;
        let energy = protein * Decimal::new(4, 0)
            + carbohydrate * Decimal::new(4, 0)
            + fat * Decimal::new(9, 0);
        let saturates = fat * Decimal::new(35, 2);
        let sugars = energy * Decimal::new(3, 2);
        let fibre = Decimal::new(30, 0);
        let salt = Decimal::new(6, 0);
        let energy = energy.round().mantissa() as i32;
        let query = sqlx::query_as(
            "
            INSERT INTO
                diet_target (
                    user_id,
                    date,
                    weight,
                    energy,
                    fat,
                    saturates,
                    carbohydrate,
                    sugars,
                    fibre,
                    protein,
                    salt,
                    created_by_id
                )
            VALUES
                ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING
                *
            ",
        )
        .bind(data.user_id)
        .bind(data.date)
        .bind(data.weight)
        .bind(energy)
        .bind(fat)
        .bind(saturates)
        .bind(carbohydrate)
        .bind(sugars)
        .bind(fibre)
        .bind(protein)
        .bind(salt)
        .bind(created_by_id)
        .fetch_one(pool)
        .await?;
        Ok(query)
    }

    pub async fn update(
        pool: &PgPool,
        id: &Uuid,
        data: &DietTargetCreateInput,
        updated_by_id: &Uuid,
    ) -> Result<Self, sqlx::Error> {
        let updated_at = Utc::now();
        let protein = data.weight * data.protein_per_kg;
        let carbohydrate = data.weight * data.carbohydrate_per_kg;
        let fat = data.weight * data.fat_per_kg;
        let energy = protein * Decimal::new(4, 0)
            + carbohydrate * Decimal::new(4, 0)
            + fat * Decimal::new(9, 0);
        let saturates = fat * Decimal::new(35, 2);
        let sugars = energy * Decimal::new(3, 2);
        let fibre = Decimal::new(30, 0);
        let salt = Decimal::new(6, 0);
        let energy = energy.round().mantissa() as i32;
        let query = sqlx::query_as(
            "
            UPDATE diet_target
            SET
                user_id = $1,
                date = $2,
                energy = $3,
                protein = $4,
                carbohydrate = $5,
                fat = $6,
                saturates = $7,
                sugars = $8,
                fibre = $9,
                salt = $10,
                updated_at = $11,
                updated_by_id = $12
            WHERE
                id = $13
            RETURNING
                *
            ",
        )
        .bind(data.user_id)
        .bind(data.date)
        .bind(energy)
        .bind(protein)
        .bind(carbohydrate)
        .bind(fat)
        .bind(saturates)
        .bind(sugars)
        .bind(fibre)
        .bind(salt)
        .bind(updated_at)
        .bind(updated_by_id)
        .bind(id)
        .fetch_one(pool)
        .await?;
        Ok(query)
    }
    pub async fn delete(pool: &PgPool, id: &Uuid) -> Result<Self, sqlx::Error> {
        let query = sqlx::query_as("DELETE FROM diet_target WHERE id = $1 RETURNING *")
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
            DELETE FROM diet_target
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
            DELETE FROM diet_target
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

#[derive(Debug, Default, Serialize, FromRow)]
pub struct DietTargetSerializer {
    pub id: Uuid,
    pub user_id: Uuid,
    pub date: NaiveDate,
    pub latest_weight: Decimal,
    pub energy: Decimal,
    pub fat: Decimal,
    pub saturates: Decimal,
    pub carbohydrate: Decimal,
    pub sugars: Decimal,
    pub fibre: Decimal,
    pub protein: Decimal,
    pub salt: Decimal,
    // pub created_at: Option<DateTime<Utc>>,
    // pub updated_at: Option<DateTime<Utc>>,
    // pub created_by_id: Option<Uuid>,
    // pub updated_by_id: Option<Uuid>,
    //
    pub username: String,
    pub protein_pct: Decimal,
    pub carbohydrate_pct: Decimal,
    pub fat_pct: Decimal,
    pub energy_per_kg: Decimal,
    pub protein_per_kg: Decimal,
    pub carbohydrate_per_kg: Decimal,
    pub fat_per_kg: Decimal,
}

impl DietTargetSerializer {
    pub async fn admin_get(pool: &PgPool, id: &Uuid) -> Result<Self, sqlx::Error> {
        let query = sqlx::query_as(
            "
                SELECT
                    t1.id,
                    t1.user_id,
                    t1.date,
                    t1.weight AS latest_weight,
                    t1.energy::DECIMAL,
                    t1.fat,
                    t1.saturates,
                    t1.carbohydrate,
                    t1.sugars,
                    t1.fibre,
                    t1.protein,
                    t1.salt,
                    t1.created_at,
                    t1.updated_at,
                    t1.created_by_id,
                    t1.updated_by_id,
                    t2.username AS username,
                    (t1.protein * 4) / t1.energy * 100 AS protein_pct,
                    (t1.carbohydrate * 4) / t1.energy * 100 AS carbohydrate_pct,
                    (t1.fat * 9) / t1.energy * 100 AS fat_pct,
                    t1.energy / t1.weight AS energy_per_kg,
                    t1.protein / t1.weight AS protein_per_kg,
                    t1.carbohydrate / t1.weight AS carbohydrate_per_kg,
                    t1.fat / t1.weight AS fat_per_kg
                FROM
                    diet_target t1
                    LEFT JOIN users_user t2 ON t2.id = t1.user_id
                    WHERE t1.id = $1
                    ",
        )
        .bind(id)
        .fetch_one(pool)
        .await?;
        Ok(query)
    }

    pub async fn week(
        pool: &PgPool,
        username: &String,
        date: &NaiveDate,
    ) -> Result<Vec<Self>, sqlx::Error> {
        let start =
            NaiveDate::from_isoywd_opt(date.year(), date.iso_week().week(), Weekday::Mon).unwrap();
        let end =
            NaiveDate::from_isoywd_opt(date.year(), date.iso_week().week(), Weekday::Sun).unwrap();
        let mut stream = Vec::new();
        let mut rows = sqlx::query_as(
            "
                SELECT
                    t1.id,
                    t1.user_id,
                    t1.date,
                    t1.weight AS latest_weight,
                    t1.energy::DECIMAL,
                    t1.fat,
                    t1.saturates,
                    t1.carbohydrate,
                    t1.sugars,
                    t1.fibre,
                    t1.protein,
                    t1.salt,
                    t1.created_at,
                    t1.updated_at,
                    t1.created_by_id,
                    t1.updated_by_id,
                    t2.username AS username,
                    (t1.protein * 4) / t1.energy * 100 AS protein_pct,
                    (t1.carbohydrate * 4) / t1.energy * 100 AS carbohydrate_pct,
                    (t1.fat * 9) / t1.energy * 100 AS fat_pct,
                    t1.energy / t1.weight AS energy_per_kg,
                    t1.protein / t1.weight AS protein_per_kg,
                    t1.carbohydrate / t1.weight AS carbohydrate_per_kg,
                    t1.fat / t1.weight AS fat_per_kg
                FROM
                    diet_target t1
                    LEFT JOIN users_user t2 ON t2.id = t1.user_id
                WHERE
                    t2.username = $1
                    AND t1.date >= $2
                    AND t1.date <= $3
                ORDER BY
                    t1.date
                ",
        )
        .bind(username)
        .bind(start)
        .bind(end)
        .fetch(pool);
        while let Some(row) = rows.try_next().await? {
            stream.push(row);
        }
        Ok(stream)
    }

    pub async fn week_total(
        pool: &PgPool,
        username: &String,
        date: &NaiveDate,
    ) -> Result<Self, sqlx::Error> {
        let start =
            NaiveDate::from_isoywd_opt(date.year(), date.iso_week().week(), Weekday::Mon).unwrap();
        let query = sqlx::query_as(
            "
            SELECT
                '00000000-0000-0000-0000-000000000000'::uuid as id,
                t1.user_id,
                t2.username,
                DATE_TRUNC('week', t1.date)::date as date,
                SUM(t1.energy)::DECIMAL AS energy,
                SUM(t1.protein) AS protein,
                SUM(t1.carbohydrate) AS carbohydrate,
                SUM(t1.fat) AS fat,
                SUM(t1.saturates) AS saturates,
                SUM(t1.sugars) AS sugars,
                SUM(t1.fibre) AS fibre,
                SUM(t1.salt) AS salt,
                SUM(t1.protein * 4) / SUM(t1.energy) * 100 AS protein_pct,
                SUM(t1.carbohydrate * 4) / SUM(t1.energy) * 100 AS carbohydrate_pct,
                SUM(t1.fat * 9) / SUM(t1.energy) * 100 AS fat_pct,
                AVG(t1.weight) AS latest_weight,
                SUM(t1.energy) / AVG(t1.weight) AS energy_per_kg,
                SUM(t1.protein) / AVG(t1.weight) AS protein_per_kg,
                SUM(t1.carbohydrate) / AVG(t1.weight) AS carbohydrate_per_kg,
                SUM(t1.fat) / AVG(t1.weight) AS fat_per_kg
            FROM
                diet_target t1
                LEFT JOIN users_user t2 ON t1.user_id = t2.id
            WHERE
                t2.username = $1
                AND DATE_TRUNC('week', t1.date) = $2
            GROUP BY
                t1.user_id,
                t2.username,
                DATE_TRUNC('week', t1.date)::date
            ",
        )
        .bind(username)
        .bind(start)
        .fetch_optional(pool)
        .await?
        .unwrap_or_default();
        Ok(query)
    }

    pub async fn week_average(
        pool: &PgPool,
        username: &String,
        date: &NaiveDate,
    ) -> Result<Self, sqlx::Error> {
        let start =
            NaiveDate::from_isoywd_opt(date.year(), date.iso_week().week(), Weekday::Mon).unwrap();
        let query = sqlx::query_as(
            "
            SELECT
                '00000000-0000-0000-0000-000000000000'::UUID AS id,
                t1.user_id,
                t2.username,
                DATE_TRUNC('week', t1.date)::date AS date,
                AVG(t1.energy)::DECIMAL AS energy,
                AVG(t1.protein) AS protein,
                AVG(t1.carbohydrate) AS carbohydrate,
                AVG(t1.fat) AS fat,
                AVG(t1.saturates) AS saturates,
                AVG(t1.sugars) AS sugars,
                AVG(t1.fibre) AS fibre,
                AVG(t1.salt) AS salt,
                AVG(t1.protein * 4) / AVG(t1.energy) * 100 AS protein_pct,
                AVG(t1.carbohydrate * 4) / AVG(t1.energy) * 100 AS carbohydrate_pct,
                AVG(t1.fat * 9) / AVG(t1.energy) * 100 AS fat_pct,
                AVG(t1.weight) AS latest_weight,
                AVG(t1.energy) / AVG(t1.weight) AS energy_per_kg,
                AVG(t1.protein) / AVG(t1.weight) AS protein_per_kg,
                AVG(t1.carbohydrate) / AVG(t1.weight) AS carbohydrate_per_kg,
                AVG(t1.fat) / AVG(t1.weight) AS fat_per_kg
            FROM
                diet_target t1
                LEFT JOIN users_user t2 ON t2.id = t1.user_id
            WHERE
                t2.username = $1
                AND DATE_TRUNC('week', t1.date) = $2
            GROUP BY
                t1.user_id,
                t2.username,
                DATE_TRUNC('week', t1.date)
            ",
        )
        .bind(username)
        .bind(start)
        .fetch_optional(pool)
        .await?
        .unwrap_or_default();
        Ok(query)
    }

    pub async fn get(
        pool: &PgPool,
        username: &String,
        date: &NaiveDate,
    ) -> Result<Option<Self>, sqlx::Error> {
        let query = sqlx::query_as(
            "
            SELECT
                t1.id,
                t1.user_id,
                t1.date,
                t1.weight AS latest_weight,
                t1.energy::DECIMAL,
                t1.fat,
                t1.saturates,
                t1.carbohydrate,
                t1.sugars,
                t1.fibre,
                t1.protein,
                t1.salt,
                t1.created_at,
                t1.updated_at,
                t1.created_by_id,
                t1.updated_by_id,
                t2.username AS username,
                (t1.protein * 4) / t1.energy * 100 AS protein_pct,
                (t1.carbohydrate * 4) / t1.energy * 100 AS carbohydrate_pct,
                (t1.fat * 9) / t1.energy * 100 AS fat_pct,
                t1.energy / t1.weight AS energy_per_kg,
                t1.protein / t1.weight AS protein_per_kg,
                t1.carbohydrate / t1.weight AS carbohydrate_per_kg,
                t1.fat / t1.weight AS fat_per_kg
            FROM
                diet_target t1
                LEFT JOIN users_user t2 ON t1.user_id = t2.id
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
    pub async fn get_latest(
        pool: &PgPool,
        username: &String,
        date: &NaiveDate,
    ) -> Result<Option<Self>, sqlx::Error> {
        let query = sqlx::query_as(
            "
            SELECT
                t1.id,
                t1.user_id,
                t1.date,
                t1.weight AS latest_weight,
                t1.energy::DECIMAL,
                t1.fat,
                t1.saturates,
                t1.carbohydrate,
                t1.sugars,
                t1.fibre,
                t1.protein,
                t1.salt,
                t1.created_at,
                t1.updated_at,
                t1.created_by_id,
                t1.updated_by_id,
                t2.username AS username,
                (t1.protein * 4) / t1.energy * 100 AS protein_pct,
                (t1.carbohydrate * 4) / t1.energy * 100 AS carbohydrate_pct,
                (t1.fat * 9) / t1.energy * 100 AS fat_pct,
                t1.energy / t1.weight AS energy_per_kg,
                t1.protein / t1.weight AS protein_per_kg,
                t1.carbohydrate / t1.weight AS carbohydrate_per_kg,
                t1.fat / t1.weight AS fat_per_kg
            FROM
                diet_target t1
                LEFT JOIN users_user t2 ON t1.user_id = t2.id
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
}
