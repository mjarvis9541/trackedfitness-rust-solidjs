use axum::{
    extract::State,
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use chrono::Utc;
use jsonwebtoken::TokenData;
use serde::Deserialize;
use serde_json::json;
use sqlx::PgPool;
use std::sync::Arc;
use validator::Validate;

use crate::{
    error::AppError,
    middleware::RequestUser,
    user::model::User,
    util::{email::send_email, validator::validate_not_empty_string},
    AppState,
};

use super::jwt::{create_jwt, create_token, verify_jwt, Payload};

pub enum AuthError {
    Inactive,
}

impl IntoResponse for AuthError {
    fn into_response(self) -> Response {
        let (status, message) = match self {
            Self::Inactive => (StatusCode::BAD_REQUEST, "User inactive"),
            Self::Inactive => (StatusCode::BAD_REQUEST, "User inactive"),
            _ => (StatusCode::INTERNAL_SERVER_ERROR, "Internal server error"),
        };
        let body = Json(json!({ "message": vec![message] }));
        (status, body).into_response()
    }
}

#[derive(Debug, Deserialize, Validate)]
pub struct LoginSerializer {
    #[validate(
        length(min = 3, message = "Minimum of 3 characters"),
        length(max = 15, message = "Maximum of 15 characters"),
        custom(function = "validate_not_empty_string", message = "Required")
    )]
    pub username: String,
    #[validate(
        length(min = 3, message = "Minimum of 8 characters"),
        length(max = 50, message = "Maximum of 50 characters")
    )]
    pub password: String,
}

impl LoginSerializer {
    pub async fn is_valid(self, user: &User) -> Result<Self, AppError> {
        user.self_validate_password(&self.password)?;
        if !user.is_active {
            return Err(AppError::APIBadRequest(String::from("Inactive")));
        }
        Ok(self)
    }
    pub async fn save(self, secret: &str, user: &User) -> Result<String, AppError> {
        let token = create_jwt(secret, user.id)?;
        Ok(token)
    }
}

#[derive(Debug, Deserialize, Validate)]
pub struct SignupSerializer {
    #[validate(
        length(min = 3, message = "Minimum of 3 characters"),
        length(max = 50, message = "Maximum of 50 characters"),
        custom(function = "validate_not_empty_string", message = "Required")
    )]
    pub name: String,
    #[validate(
        length(min = 3, message = "Minimum of 3 characters"),
        length(max = 15, message = "Maximum of 15 characters"),
        custom(function = "validate_not_empty_string", message = "Required")
    )]
    pub username: String,
    #[validate(
        length(min = 8, message = "Minimum of 8 characters"),
        length(max = 50, message = "Maximum of 50 characters"),
        custom(function = "validate_not_empty_string", message = "Required")
    )]
    pub password: String,
    #[validate(email(message = "Invalid email address"))]
    pub email: String,
}

impl SignupSerializer {
    pub async fn is_valid(self, pool: &PgPool) -> Result<Self, AppError> {
        let query = User::get_from_username_or_email(&pool, &self.username, &self.email).await?;
        if let Some(user) = query {
            return Err(AppError::APIBadRequest(String::from(
                "User with username already exists",
            )));
        }
        Ok(self)
    }
    pub async fn save(self, state: Arc<AppState>) -> Result<Self, AppError> {
        let user = User::signup(&state.pool, &self).await?;
        let token = create_token(&state.secret, user.id, 10080, "activate")?;
        let subject = "Activate account";
        let email = "mjarvis9541@gmail.com";
        let body = format!("Activation token: {token}");
        send_email(&user.name, email, subject, &body);
        Ok(self)
    }
}

#[derive(Debug, Deserialize, Validate)]
pub struct SignupResendSerializer {
    #[validate(email(message = "Invalid email address"))]
    pub email: String,
}

impl SignupResendSerializer {
    pub fn is_valid(self, user: &User) -> Result<Self, AppError> {
        if user.last_login.is_some() {
            return Err(AppError::BadRequestMessage(String::from(
                "User previously logged in",
            )));
        }
        if user.is_active {
            return Err(AppError::BadRequestMessage(String::from(
                "User already active",
            )));
        }
        if user.email_verified {
            return Err(AppError::BadRequestMessage(String::from(
                "User already verified via email",
            )));
        }
        Ok(self)
    }
    pub async fn save(self, secret: &str, user: &User) -> Result<Self, AppError> {
        let token = create_token(secret, user.id, 10080, "activate")?;
        let subject = "Activate account";
        let email = "mjarvis9541@gmail.com";
        let body = format!("Activation token: {token}");
        send_email(&user.name, email, subject, &body);
        Ok(self)
    }
}

#[derive(Debug, Deserialize, Validate)]
pub struct SignupCompleteSerializer {
    pub token: String,
}

impl SignupCompleteSerializer {
    pub fn validate_token(&self, secret: &str) -> Result<Payload, AppError> {
        let token = verify_jwt(secret, &self.token)?;
        let subject = String::from("activate");
        if token.claims.sub != subject {
            return Err(AppError::InvalidToken);
        }

        Ok(token.claims)
    }

    pub fn is_valid(self, user: &User) -> Result<Self, AppError> {
        if user.last_login.is_some() {
            return Err(AppError::BadRequestMessage(String::from(
                "User previously logged in",
            )));
        }
        if user.is_active {
            return Err(AppError::BadRequestMessage(String::from(
                "User already active",
            )));
        }
        if user.email_verified {
            return Err(AppError::BadRequestMessage(String::from(
                "User already verified via email",
            )));
        }
        Ok(self)
    }
    pub async fn save(self, pool: &PgPool, user: User) -> Result<User, AppError> {
        let user = User::activate(pool, &user.id).await?;
        Ok(user)
    }
}

#[derive(Debug, Deserialize, Validate)]
pub struct EmailChangeSerializer {
    #[validate(
        length(min = 3, message = "Minimum of 3 characters"),
        length(max = 15, message = "Maximum of 15 characters"),
        custom(function = "validate_not_empty_string", message = "Required")
    )]
    pub username: String,
    #[validate(email(message = "Enter a valid email address"))]
    pub email: String,
}

impl EmailChangeSerializer {
    pub async fn validate_email_available(&self, pool: &PgPool) -> Result<(), AppError> {
        let query = User::get_from_email(pool, &self.email).await?;
        if let Some(user) = query {
            if user.username == self.username {
                return Err(AppError::APIBadRequest(format!(
                    "{} is your current email address",
                    self.email
                )));
            }
        } else {
            return Err(AppError::APIBadRequest(format!(
                "The email address {} is already registered",
                self.email
            )));
        }
        Ok(())
    }
    pub async fn is_valid(self, pool: &PgPool) -> Result<Self, AppError> {
        self.validate_email_available(pool).await?;
        Ok(self)
    }
    pub async fn save(self, state: Arc<AppState>, user: User) -> Result<User, AppError> {
        User::update_email_change_to(&state.pool, &user.id, &user.email).await?;
        let activation_token = create_token(&state.secret, user.id, 10080, "change-email")?;
        let subject = "Verify New Email";
        let email = "mjarvis9541@gmail.com";
        let body = format!("Verification token: {activation_token}");
        send_email(&user.name, email, subject, &body);
        Ok(user)
    }
}

#[derive(Debug, Deserialize, Validate)]
pub struct EmailChangeCompleteSerializer {
    pub token: String,
}

impl EmailChangeCompleteSerializer {
    pub fn validate_token(&self, secret: &str) -> Result<Payload, AppError> {
        let token = verify_jwt(secret, &self.token)?;
        let subject = String::from("email-change");
        if token.claims.sub != subject {
            return Err(AppError::InvalidToken);
        }
        Ok(token.claims)
    }
    pub fn validate_pending_email_change(&self, user: &User) -> Result<(), AppError> {
        user.email_change_to.is_none().then(|| {
            AppError::APIBadRequest(String::from(
                "You do not have a pending email change request",
            ))
        });
        Ok(())
    }
    pub async fn is_valid(self, pool: &PgPool, user: &User) -> Result<Self, AppError> {
        self.validate_pending_email_change(&user);
        Ok(self)
    }
    pub async fn save(self, pool: &PgPool, user: User) -> Result<u64, AppError> {
        let user = User::complete_email_change_to(pool, &user.id, &user.email).await?;
        Ok(user)
    }
}

#[derive(Debug, Deserialize, Validate)]
pub struct PasswordResetSerializer {
    #[validate(email(message = "Enter a valid email address"))]
    pub email: String,
}

impl PasswordResetSerializer {
    pub async fn is_valid(self) -> Result<Self, AppError> {
        Ok(self)
    }
    pub async fn save(self, pool: &PgPool, secret: &str, user: &User) -> Result<Self, AppError> {
        let token = create_token(secret, user.id, 10080, "password-reset")?;
        let subject = "Password Reset";
        let email = "mjarvis9541@gmail.com";
        let body = format!("Password reset token: {token}");
        send_email(&user.name, email, subject, &body);
        Ok(self)
    }
}

#[derive(Debug, Deserialize, Validate)]
pub struct PasswordResetCompleteSerializer {
    pub password: String,
    pub token: String,
}

impl PasswordResetCompleteSerializer {
    pub fn validate_token(&self, secret: &str) -> Result<Payload, AppError> {
        let token = verify_jwt(secret, &self.token)?;
        let subject = String::from("password-reset");
        if token.claims.sub != subject {
            return Err(AppError::InvalidToken);
        }
        Ok(token.claims)
    }

    pub async fn is_valid(self, pool: &PgPool, user: &User) -> Result<Self, AppError> {
        Ok(self)
    }
    pub async fn save(self, pool: &PgPool, user: &User) -> Result<Self, AppError> {
        let user = User::update_password(pool, &user.id, &self.password).await?;
        Ok(self)
    }
}

#[derive(Debug, Deserialize, Validate)]
pub struct PasswordChangeSerializer {
    #[validate(
        length(min = 3, message = "Minimum of 3 characters"),
        length(max = 15, message = "Maximum of 15 characters"),
        custom(function = "validate_not_empty_string", message = "Required")
    )]
    pub username: String,
    #[validate(
        length(min = 8, message = "Minimum of 8 characters"),
        length(max = 50, message = "Maximum of 50 characters"),
        custom(function = "validate_not_empty_string", message = "Required")
    )]
    pub old_password: String,
    #[validate(
        length(min = 8, message = "Minimum of 8 characters"),
        length(max = 50, message = "Maximum of 50 characters"),
        custom(function = "validate_not_empty_string", message = "Required")
    )]
    pub new_password: String,
}

impl PasswordChangeSerializer {
    pub async fn is_valid(self, pool: &PgPool, user: &User) -> Result<Self, AppError> {
        Ok(self)
    }

    pub async fn save(self, pool: &PgPool, user: &User) -> Result<Self, AppError> {
        let user = User::update_password(pool, &user.id, &self.new_password).await?;
        Ok(self)
    }
}
