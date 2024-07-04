use chrono::prelude::*;
use futures::TryStreamExt;
use serde::Serialize;
use sqlx::{postgres::PgQueryResult, FromRow, PgPool, Row};
use uuid::Uuid;

use crate::{
    auth::serializer::SignupSerializer, db::Filters, error::AppError, util::query::QueryParams,
};

use super::serializer::{AdminUpdateInput, CreateUserSerializer};

const ORDERING_FIELDS: &[&str] = &[
    "username",
    "name",
    "follower_count",
    "following_count",
    "created_at",
    "updated_at",
];

#[derive(Debug, Serialize, FromRow)]
pub struct User {
    pub id: Uuid,
    pub name: String,
    pub username: String,
    pub password: String,
    pub email: String,
    pub email_verified: bool,
    pub email_change_to: Option<String>,
    pub is_active: bool,
    pub is_staff: bool,
    pub is_superuser: bool,
    pub privacy_level: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,
    pub last_login: Option<DateTime<Utc>>,
}

impl User {
    pub async fn from_id_or_404(pool: &PgPool, id: &Uuid) -> Result<Self, AppError> {
        let query = sqlx::query_as("SELECT * FROM users_user WHERE id = $1")
            .bind(id)
            .fetch_optional(pool)
            .await?
            .ok_or(AppError::APIBadRequest(String::from("User not found.")))?;
        Ok(query)
    }
    pub async fn from_username_or_404(pool: &PgPool, username: &str) -> Result<Self, AppError> {
        let query = sqlx::query_as("SELECT * FROM users_user WHERE username = $1")
            .bind(username)
            .fetch_optional(pool)
            .await?
            .ok_or(AppError::APIBadRequest(String::from("User not found.")))?;
        Ok(query)
    }
    pub async fn from_email_or_404(pool: &PgPool, email: &str) -> Result<Self, AppError> {
        let query = sqlx::query_as("SELECT * FROM users_user WHERE email = $1")
            .bind(email)
            .fetch_optional(pool)
            .await?
            .ok_or(AppError::APIBadRequest(String::from("User not found.")))?;
        Ok(query)
    }
    pub async fn create(pool: &PgPool, data: CreateUserSerializer) -> Result<Self, AppError> {
        let username = data.username.to_lowercase();
        let email = data.username.to_lowercase();
        let password = bcrypt::hash(&data.password, 8)?;
        let query = sqlx::query_as(
            "
            INSERT INTO
                users_user (
                    NAME,
                    username,
                    PASSWORD,
                    email,
                    email_verified,
                    is_active,
                    is_staff,
                    is_superuser,
                    privacy_level
                )
            VALUES
                ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING
                *
            ",
        )
        .bind(data.name)
        .bind(username)
        .bind(password)
        .bind(email)
        .bind(data.email_verified)
        .bind(data.is_active)
        .bind(data.is_staff)
        .bind(data.is_superuser)
        .bind(data.privacy_level)
        .fetch_one(pool)
        .await?;
        Ok(query)
    }

    pub async fn get(pool: &PgPool, id: &Uuid) -> Result<Self, sqlx::Error> {
        let query = sqlx::query_as("SELECT * FROM users_user WHERE id = $1")
            .bind(id)
            .fetch_one(pool)
            .await?;
        Ok(query)
    }
    pub async fn update(
        pool: &PgPool,
        data: AdminUpdateInput,
        id: Uuid,
    ) -> Result<Self, sqlx::Error> {
        let updated_at = Utc::now();
        let query = sqlx::query_as(
            "
            UPDATE users_user
            SET
                name = $1,
                username = $2,
                email = $3,
                email_verified = $4,
                email_change_to = $5,
                is_active = $6,
                is_staff = $7,
                is_superuser = $8,
                privacy_level = $9,
                updated_at = $10
            WHERE
                ID = $11
            RETURNING
                *
            ",
        )
        .bind(data.name)
        .bind(data.username)
        .bind(data.email)
        .bind(data.email_verified)
        .bind(data.email_change_to)
        .bind(data.is_active)
        .bind(data.is_staff)
        .bind(data.is_superuser)
        .bind(data.privacy_level)
        .bind(updated_at)
        .bind(id)
        .fetch_one(pool)
        .await?;
        Ok(query)
    }

    pub async fn update_email_change_to(
        pool: &PgPool,
        id: &Uuid,
        email_to: &str,
    ) -> Result<u64, sqlx::Error> {
        let query = sqlx::query("UPDATE users_user SET email_change_to = $1 WHERE id = $2")
            .bind(email_to)
            .bind(id)
            .execute(pool)
            .await?
            .rows_affected();
        Ok(query)
    }
    pub async fn complete_email_change_to(
        pool: &PgPool,
        id: &Uuid,
        email: &str,
    ) -> Result<u64, sqlx::Error> {
        let query = sqlx::query(
            "
            UPDATE users_user 
            SET email_change_to = $1, email_change_to = null
            WHERE id = $2
            ",
        )
        .bind(id)
        .bind(email)
        .execute(pool)
        .await?
        .rows_affected();
        Ok(query)
    }

    pub async fn update_password(
        pool: &PgPool,
        id: &Uuid,
        password: &str,
    ) -> Result<Self, sqlx::Error> {
        let query = sqlx::query_as("UPDATE users_user SET password = $1 WHERE id = $2 RETURNING *")
            .bind(password)
            .bind(id)
            .fetch_one(pool)
            .await?;
        Ok(query)
    }

    pub async fn delete(pool: &PgPool, id: &Uuid) -> Result<Self, sqlx::Error> {
        let query = sqlx::query_as("DELETE FROM users_user WHERE id = $1 RETURNING *")
            .bind(id)
            .fetch_one(pool)
            .await?;
        Ok(query)
    }

    pub async fn signup(pool: &PgPool, data: &SignupSerializer) -> Result<Self, AppError> {
        let username = data.username.to_lowercase();
        let email = data.username.to_lowercase();
        let password = bcrypt::hash(&data.password, 8)?;
        let query = sqlx::query_as(
            "
            INSERT INTO
                users_user (
                    NAME,
                    username,
                    PASSWORD,
                    email,
                    email_verified,
                    is_active,
                    is_staff,
                    is_superuser,
                    privacy_level
                )
            VALUES
                ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING
                *
            ",
        )
        .bind(&data.name)
        .bind(&username)
        .bind(&password)
        .bind(&email)
        .bind(false)
        .bind(false)
        .bind(false)
        .bind(false)
        .bind(0)
        .fetch_one(pool)
        .await?;
        Ok(query)
    }

    pub async fn activate(pool: &PgPool, id: &Uuid) -> Result<Self, sqlx::Error> {
        let updated_at = Utc::now();
        let query = sqlx::query_as(
            "
            UPDATE users_user
            SET
                is_active = $1,
                email_verified = $2,
                last_login = $3,
                updated_at = $3
            WHERE
                id = $4
            RETURNING
                *
            ",
        )
        .bind(true)
        .bind(true)
        .bind(updated_at)
        .bind(id)
        .fetch_one(pool)
        .await?;
        Ok(query)
    }
    // @todo: The below should be combined into one function:
    pub async fn get_from_username(
        pool: &PgPool,
        username: &str,
    ) -> Result<Option<Self>, sqlx::Error> {
        let query = sqlx::query_as("SELECT * FROM users_user WHERE username = $1")
            .bind(username)
            .fetch_optional(pool)
            .await?;
        Ok(query)
    }
    pub async fn get_from_email(pool: &PgPool, email: &str) -> Result<Option<Self>, sqlx::Error> {
        let query = sqlx::query_as("SELECT * FROM users_user WHERE email = $1")
            .bind(email)
            .fetch_optional(pool)
            .await?;
        Ok(query)
    }
    pub async fn get_from_username_or_email(
        pool: &PgPool,
        username: &str,
        email: &str,
    ) -> Result<Option<Self>, sqlx::Error> {
        let query = sqlx::query_as("SELECT * FROM users_user WHERE username = $1 OR email = $2")
            .bind(username)
            .bind(email)
            .fetch_optional(pool)
            .await?;
        Ok(query)
    }

    pub async fn delete_id_range(
        pool: &PgPool,
        id_range: Vec<Uuid>,
    ) -> Result<Vec<Self>, sqlx::Error> {
        let query = sqlx::query_as("DELETE FROM users_user WHERE id = ANY ($1) RETURNING *")
            .bind(id_range)
            .fetch_all(pool)
            .await?;
        Ok(query)
    }

    pub async fn update_last_login(pool: &PgPool, id: &Uuid) -> Result<Self, sqlx::Error> {
        let last_login = Utc::now();
        let query =
            sqlx::query_as("UPDATE users_user SET last_login = $1 WHERE id = $2 RETURNING *")
                .bind(last_login)
                .bind(id)
                .fetch_one(pool)
                .await?;
        Ok(query)
    }
    pub async fn self_update_last_login(&self, pool: &PgPool) -> Result<u64, sqlx::Error> {
        let last_login = Utc::now();
        let query = sqlx::query("UPDATE users_user SET last_login = $1 WHERE id = $2")
            .bind(last_login)
            .bind(&self.id)
            .execute(pool)
            .await?
            .rows_affected();
        Ok(query)
    }
    pub fn self_validate_password(&self, password: &str) -> Result<(), AppError> {
        let checker = bcrypt::verify(password, &self.password)?;
        if !checker {
            return Err(AppError::BadRequestMessage(String::from(
                "Invalid password",
            )));
        }
        Ok(())
    }
}

#[derive(Debug, Serialize, FromRow)]
pub struct UserSerializer {
    pub id: Uuid,
    pub name: String,
    pub username: String,
    pub email: String,
    pub email_verified: bool,
    pub email_change_to: Option<String>,
    pub is_active: bool,
    pub is_staff: bool,
    pub is_superuser: bool,
    pub privacy_level: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,
    pub last_login: Option<DateTime<Utc>>,
    pub follower_count: i64,
    pub following_count: i64,
}

impl UserSerializer {
    pub async fn count(pool: &PgPool, params: &QueryParams) -> Result<i64, sqlx::Error> {
        let mut q = sqlx::QueryBuilder::new(
            "
        SELECT
            COUNT(t1.*)
        FROM
            users_user t1
        WHERE
            TRUE
        ",
        );
        q.filter_icontains("t1.username", &params.search);
        let count = q.build().fetch_one(pool).await?.get("count");
        Ok(count)
    }
    pub async fn all(pool: &PgPool, params: &QueryParams) -> Result<Vec<Self>, sqlx::Error> {
        let mut stream = Vec::new();
        let mut q = sqlx::QueryBuilder::new(
            "
        SELECT
            t1.*,
            (
                SELECT
                    COUNT(*)
                FROM
                    user_follower
                WHERE
                    user_id = t1.id
            ) AS follower_count,
            (
                SELECT
                    COUNT(*)
                FROM
                    user_follower
                WHERE
                    follower_id = t1.id
            ) AS following_count
        FROM
            users_user t1
        WHERE
            TRUE
            ",
        );
        q.filter_icontains("t1.username", &params.search);
        q.ordering_filter(&params, ORDERING_FIELDS, "t1.created_at");
        q.paginate(params.page, params.size);
        let mut rows = q.build_query_as().fetch(pool);
        while let Some(row) = rows.try_next().await? {
            stream.push(row);
        }
        Ok(stream)
    }
}

#[derive(Debug, Serialize, FromRow)]
pub struct UserSelect {
    pub id: Uuid,
    pub name: String,
}

impl UserSelect {
    pub async fn all(pool: &PgPool) -> Result<Vec<Self>, sqlx::Error> {
        let mut stream = Vec::new();
        let mut rows = sqlx::query_as(
            "
            SELECT
                id,
                username as name
            FROM
                users_user
            ORDER BY
                username
            ",
        )
        .fetch(pool);
        while let Some(row) = rows.try_next().await? {
            stream.push(row);
        }
        Ok(stream)
    }
}

#[derive(Debug, Serialize, FromRow)]
pub struct UserHeaderQuery {
    pub username: String,
    pub name: String,
    pub email: String,
    pub privacy_level: i32,
    pub follower_count: i64,
    pub following_count: i64,
    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,
    pub last_login: Option<DateTime<Utc>>,
    pub is_following: i64,
}

impl UserHeaderQuery {
    pub async fn follower_summary(
        pool: &PgPool,
        username: &str,
        user_id: &Uuid,
        request_user_id: &Uuid,
    ) -> Result<Option<Self>, sqlx::Error> {
        let query = sqlx::query_as(
            "
            SELECT
                t1.username,
                t1.name,
                t1.email,
                t1.privacy_level,
                t1.created_at,
                t1.updated_at,
                t1.last_login,
                (
                    SELECT
                        COUNT(*)
                    FROM
                        user_follower t2
                    WHERE
                        t2.user_id = t1.id
                ) AS follower_count,
                (
                    SELECT
                        COUNT(*)
                    FROM
                        user_follower t3
                    WHERE
                        t3.follower_id = t1.id
                ) AS following_count,
                (
                    SELECT
                        COUNT(*)
                    FROM
                        user_follower t4
                    WHERE
                        t4.user_id = $2 AND t4.follower_id = $3
                ) AS is_following
            FROM
                users_user t1
            WHERE
                username = $1
            ",
        )
        .bind(&username)
        .bind(&user_id)
        .bind(&request_user_id)
        .fetch_optional(pool)
        .await?;
        Ok(query)
    }
}
