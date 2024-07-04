use axum::{
    extract::rejection::{ExtensionRejection, FormRejection, JsonRejection},
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;
use std::collections::HashMap;
use validator::ValidationErrors;

// pub struct FieldErrors {
//     pub field: String,
//     pub errors: Vec<String>,
// }

// pub struct AppValidationError {}

#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error(transparent)]
    ValidationError(#[from] ValidationErrors),
    #[error(transparent)]
    AxumJsonRejection(#[from] JsonRejection),
    #[error(transparent)]
    AxumFormRejection(#[from] FormRejection),
    #[error(transparent)]
    AxumExtensionRejection(#[from] ExtensionRejection),
    #[error(transparent)]
    JsonWebTokenError(#[from] jsonwebtoken::errors::Error),
    #[error(transparent)]
    SqlxError(#[from] sqlx::Error),
    #[error(transparent)]
    BcryptError(#[from] bcrypt::BcryptError),
    #[error("")]
    NotFound,
    #[error("")]
    ValidationNotFound,
    #[error("")]
    BadRequest,
    #[error("{0}")]
    Unauthorized(String),
    #[error("{0}")]
    UnauthorizedMessage(String),
    #[error("{0}")]
    BadRequestMessage(String),
    #[error("{0}")]
    DBValidate(String),
    #[error("{0}")]
    APIBadRequest(String),
    #[error("")]
    InvalidToken,
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        if let Self::ValidationError(err) = self {
            return Self::validation_field_errors(err);
        }

        let (status, message) = match self {
            Self::AxumJsonRejection(err) => (err.status(), err.body_text()),
            Self::AxumFormRejection(err) => (err.status(), err.body_text()),
            Self::AxumExtensionRejection(err) => (err.status(), err.body_text()),
            Self::JsonWebTokenError(err) => (StatusCode::UNAUTHORIZED, err.to_string()),
            Self::SqlxError(err) => (StatusCode::INTERNAL_SERVER_ERROR, err.to_string()),
            Self::BcryptError(err) => (StatusCode::INTERNAL_SERVER_ERROR, err.to_string()),
            // app
            Self::Unauthorized(err) => (StatusCode::UNAUTHORIZED, err),
            Self::UnauthorizedMessage(err) => (StatusCode::UNAUTHORIZED, err),
            Self::DBValidate(err) => (StatusCode::BAD_REQUEST, err),
            Self::BadRequestMessage(err) => (StatusCode::BAD_REQUEST, err),
            Self::APIBadRequest(err) => (StatusCode::BAD_REQUEST, err),
            // app default
            Self::NotFound => (StatusCode::NOT_FOUND, String::from("Not found")),
            Self::BadRequest => (StatusCode::BAD_REQUEST, String::from("Bad request")),
            Self::InvalidToken => (StatusCode::BAD_REQUEST, String::from("Invalid token type")),

            _ => (
                StatusCode::INTERNAL_SERVER_ERROR,
                String::from("Internal server error"),
            ),
        };
        let body = Json(json!({ "detail": vec![message] }));

        (status, body).into_response()
    }
}

impl AppError {
    pub fn validation_field_errors(errors: ValidationErrors) -> Response {
        let mut field_errors = HashMap::new();
        for (field, error_list) in errors.field_errors() {
            let mut message_list = Vec::new();
            for error in error_list.to_owned() {
                if let Some(msg) = error.message {
                    message_list.push(msg.to_string());
                }
            }
            field_errors.insert(field, message_list);
        }
        (StatusCode::BAD_REQUEST, Json(field_errors)).into_response()
    }
}
