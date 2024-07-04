use chrono::prelude::*;
use futures::TryStreamExt;
use rust_decimal::Decimal;
use serde::Serialize;
use sqlx::{FromRow, PgPool};
use uuid::Uuid;

use crate::{db::Filters, util::query::QueryParams};

const ORDERING_FIELDS: &[&str] = &[
    "date",
    "energy",
    "fat",
    "saturates",
    "carbohydrate",
    "sugars",
    "fibre",
    "protein",
    "salt",
    "created_at",
    "updated_at",
];

#[derive(Debug, Serialize, FromRow)]
pub struct DietDayTotal {
    pub user_id: Uuid,
    pub date: NaiveDate,
    pub energy: Decimal,
    pub fat: Decimal,
    pub saturates: Decimal,
    pub carbohydrate: Decimal,
    pub sugars: Decimal,
    pub fibre: Decimal,
    pub protein: Decimal,
    pub salt: Decimal,
    pub protein_pct: Decimal,
    pub carbohydrate_pct: Decimal,
    pub fat_pct: Decimal,
}

impl DietDayTotal {
    pub async fn all(pool: &PgPool, params: QueryParams) -> Result<Vec<Self>, sqlx::Error> {
        let mut stream = Vec::new();
        let mut q = sqlx::QueryBuilder::new(
            "
            SELECT
                t1.user_id,
                t1.date,
                SUM(t1.quantity * t2.energy) AS energy,
                SUM(t1.quantity * t2.protein) AS protein,
                SUM(t1.quantity * t2.carbohydrate) AS carbohydrate,
                SUM(t1.quantity * t2.fat) AS fat,
                SUM(t1.quantity * t2.saturates) AS saturates,
                SUM(t1.quantity * t2.sugars) AS sugars,
                SUM(t1.quantity * t2.fibre) AS fibre,
                SUM(t1.quantity * t2.salt) AS salt,
                SUM(t1.quantity * t2.protein * 4) / SUM(t1.quantity * t2.energy) * 100 AS protein_pct,
                SUM(t1.quantity * t2.carbohydrate * 4) / SUM(t1.quantity * t2.energy) * 100 AS carbohydrate_pct,
                SUM(t1.quantity * t2.fat * 9) / SUM(t1.quantity * t2.energy) * 100 AS fat_pct
            FROM
                food_log t1
                LEFT JOIN food t2 ON t2.id = t1.food_id
            WHERE
                TRUE
            ",
        );
        if let Some(user_id) = params.user_id {
            q.push(" AND t1.user_id = ");
            q.push_bind(user_id);
        }
        if let Some(date) = params.date_from {
            q.push(" AND t1.date >= ");
            q.push_bind(date);
        }
        if let Some(date) = params.date_to {
            q.push(" AND t1.date <= ");
            q.push_bind(date);
        }
        q.push(" GROUP BY t1.user_id, t1.date");

        q.ordering_filter(&params, ORDERING_FIELDS, "t1.date desc");

        q.paginate(params.page, params.size);

        let mut rows = q.build_query_as().fetch(pool);
        while let Some(row) = rows.try_next().await? {
            stream.push(row);
        }
        Ok(stream)
    }
}

#[derive(Debug, Serialize, FromRow)]
pub struct DietMealTotal {
    pub user_id: Uuid,
    pub date: NaiveDate,
    pub meal_of_day_id: Uuid,
    pub energy: Decimal,
    pub fat: Decimal,
    pub saturates: Decimal,
    pub carbohydrate: Decimal,
    pub sugars: Decimal,
    pub fibre: Decimal,
    pub protein: Decimal,
    pub salt: Decimal,
    pub protein_pct: Decimal,
    pub carbohydrate_pct: Decimal,
    pub fat_pct: Decimal,
}

impl DietMealTotal {
    pub async fn all(pool: &PgPool, params: QueryParams) -> Result<Vec<Self>, sqlx::Error> {
        let mut stream = Vec::new();
        let mut q = sqlx::QueryBuilder::new(
            "
            SELECT
                t1.user_id,
                t1.date,
                t1.meal_of_day_id,
                SUM(t1.quantity * t2.energy) AS energy,
                SUM(t1.quantity * t2.protein) AS protein,
                SUM(t1.quantity * t2.carbohydrate) AS carbohydrate,
                SUM(t1.quantity * t2.fat) AS fat,
                SUM(t1.quantity * t2.saturates) AS saturates,
                SUM(t1.quantity * t2.sugars) AS sugars,
                SUM(t1.quantity * t2.fibre) AS fibre,
                SUM(t1.quantity * t2.salt) AS salt,
                SUM(t1.quantity * t2.protein * 4) / SUM(t1.quantity * t2.energy) * 100 AS protein_pct,
                SUM(t1.quantity * t2.carbohydrate * 4) / SUM(t1.quantity * t2.energy) * 100 AS carbohydrate_pct,
                SUM(t1.quantity * t2.fat * 9) / SUM(t1.quantity * t2.energy) * 100 AS fat_pct
            FROM
                food_log t1
                LEFT JOIN food t2 ON t2.id = t1.food_id
            WHERE
                TRUE
            ",
        );
        // q.filter_uuid_exact("t1.user_id", &params.user_id);
        if let Some(user_id) = params.user_id {
            q.push(" AND t1.user_id = ");
            q.push_bind(user_id);
        }
        // q.filter_date("t1.date", ">=", &params.date_from);
        // q.filter_date("t1.date", "<=", &params.date_to);
        if let Some(date) = params.date_from {
            q.push(" AND t1.date >= ");
            q.push_bind(date);
        }
        if let Some(date) = params.date_to {
            q.push(" AND t1.date <= ");
            q.push_bind(date);
        }
        q.push(" GROUP BY t1.user_id, t1.date, t1.meal_of_day_id");

        q.ordering_filter(&params, ORDERING_FIELDS, "t1.date desc");

        q.paginate(params.page, params.size);

        let mut rows = q.build_query_as().fetch(pool);
        while let Some(row) = rows.try_next().await? {
            stream.push(row);
        }
        Ok(stream)
    }
}
