use axum::{extract::State, Extension, Json};
use serde::Deserialize;
use serde_json::{json, Value};
use sqlx::{postgres::PgPoolOptions, query::QueryAs, PgPool};
use std::borrow::Cow;
use std::sync::Arc;
use uuid::Uuid;

use crate::{
    error::AppError, extractor::JsonExtractor, extractor::LoginRequired, middleware::RequestUser,
    user::model::User, util::email::send_email, AppState,
};

use super::{
    jwt::{create_jwt, create_token, verify_jwt},
    serializer::{
        EmailChangeCompleteSerializer, EmailChangeSerializer, LoginSerializer,
        PasswordChangeSerializer, PasswordResetCompleteSerializer, PasswordResetSerializer,
        SignupCompleteSerializer, SignupResendSerializer, SignupSerializer,
    },
};

pub async fn login_view(
    State(state): State<Arc<AppState>>,
    JsonExtractor(data): JsonExtractor<LoginSerializer>,
) -> Result<Json<Value>, AppError> {
    let user = User::from_username_or_404(&state.pool, &data.username).await?;
    let validated_data = data.is_valid(&user).await?;
    let response_data = validated_data.save(&state.secret, &user).await?;

    let response = json!({ "user_id": user.id, "username": user.username, "token": response_data, "is_superuser": user.is_superuser, "is_staff": user.is_staff, "email_verified": user.email_verified });
    Ok(Json(response))
}

pub async fn signup_view(
    State(state): State<Arc<AppState>>,
    JsonExtractor(data): JsonExtractor<SignupSerializer>,
) -> Result<Json<Value>, AppError> {
    let validated_data = data.is_valid(&state.pool).await?;
    let response_data = validated_data.save(state).await?;

    let response =
        json!({ "message": format!("activation email sent to: {}", response_data.email) });
    Ok(Json(response))
}

pub async fn signup_resend_view(
    State(state): State<Arc<AppState>>,
    JsonExtractor(data): JsonExtractor<SignupResendSerializer>,
) -> Result<Json<Value>, AppError> {
    let user = User::from_email_or_404(&state.pool, &data.email).await?;
    let validated_data = data.is_valid(&user)?;
    let response_data = validated_data.save(&state.secret, &user).await?;

    let response =
        json!({ "message": format!("activation email resent to: {}", &response_data.email) });
    Ok(Json(response))
}

pub async fn signup_complete_view(
    State(state): State<Arc<AppState>>,
    JsonExtractor(data): JsonExtractor<SignupCompleteSerializer>,
) -> Result<Json<Value>, AppError> {
    let token = data.validate_token(&state.secret)?;
    let user = User::from_id_or_404(&state.pool, &token.uid).await?;
    let validated_data = data.is_valid(&user)?;
    let response_data = validated_data.save(&state.pool, user).await?;

    let response = json!({ "message": "account activation complete" });
    Ok(Json(response))
}

pub async fn email_change_view(
    State(state): State<Arc<AppState>>,
    LoginRequired(_user): LoginRequired,
    JsonExtractor(data): JsonExtractor<EmailChangeSerializer>,
) -> Result<Json<Value>, AppError> {
    let user = User::from_username_or_404(&state.pool, &data.username).await?;
    let validated_data = data.is_valid(&state.pool).await?;
    let response_data = validated_data.save(state, user).await?;

    let response =
        json!({ "message": format!("Confirmation email sent to: {}", response_data.email) });
    Ok(Json(response))
}

pub async fn email_change_complete_view(
    State(state): State<Arc<AppState>>,
    JsonExtractor(data): JsonExtractor<EmailChangeCompleteSerializer>,
) -> Result<Json<Value>, AppError> {
    let token = data.validate_token(&state.secret)?;
    let user = User::from_id_or_404(&state.pool, &token.uid).await?;
    let validated_data = data.is_valid(&state.pool, &user).await?;
    let response_data = validated_data.save(&state.pool, user).await?;

    let response = json!({ "message": "email change complete" });
    Ok(Json(response))
}

pub async fn password_reset_view(
    State(state): State<Arc<AppState>>,
    JsonExtractor(data): JsonExtractor<PasswordResetSerializer>,
) -> Result<Json<Value>, AppError> {
    let user = User::from_email_or_404(&state.pool, &data.email).await?;
    let validated_data = data.is_valid().await?;
    let response_data = validated_data
        .save(&state.pool, &state.secret, &user)
        .await?;

    let response = json!({ "message": format!("Password reset email sent: {}", user.email) });
    Ok(Json(response))
}

pub async fn password_reset_complete_view(
    State(state): State<Arc<AppState>>,
    JsonExtractor(data): JsonExtractor<PasswordResetCompleteSerializer>,
) -> Result<Json<Value>, AppError> {
    let token = data.validate_token(&state.secret)?;
    let user = User::from_id_or_404(&state.pool, &token.uid).await?;
    let validated_data = data.is_valid(&state.pool, &user).await?;
    let response_data = validated_data.save(&state.pool, &user).await?;

    let response = json!({ "message": "password reset complete" });
    Ok(Json(response))
}

pub async fn password_change_view(
    State(state): State<Arc<AppState>>,
    JsonExtractor(data): JsonExtractor<PasswordChangeSerializer>,
) -> Result<Json<Value>, AppError> {
    let user = User::from_username_or_404(&state.pool, &data.username).await?;
    let validated_data = data.is_valid(&state.pool, &user).await?;
    let response_data = validated_data.save(&state.pool, &user).await?;

    let response = json!({ "message": "password change complete" });
    Ok(Json(response))
}
