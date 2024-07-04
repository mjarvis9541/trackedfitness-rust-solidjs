use axum::{
    body::Body,
    extract::{Request, State},
    middleware::Next,
    response::Response,
};
use axum_extra::headers::{authorization::Bearer, Authorization, HeaderMapExt};
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, PgPool};
use std::sync::Arc;
use uuid::Uuid;

use crate::{auth::jwt::verify_jwt, error::AppError, AppState};

#[derive(Debug, Default, Deserialize, Serialize, Clone, FromRow)]
pub struct RequestUser {
    pub id: Uuid,
    pub username: String,
    pub email: String,
    pub is_active: bool,
    pub is_staff: bool,
    pub is_superuser: bool,
    pub is_authenticated: bool,
}

impl RequestUser {
    pub async fn get(pool: &PgPool, id: &Uuid) -> Result<Self, sqlx::Error> {
        let query =
            sqlx::query_as("SELECT *, true AS is_authenticated FROM users_user WHERE id = $1")
                .bind(id)
                .fetch_one(pool)
                .await?;
        Ok(query)
    }
    pub fn login_required(&self) -> Result<(), AppError> {
        if !self.is_authenticated {
            return Err(AppError::Unauthorized(String::from("Login required")));
        }
        Ok(())
    }
    pub fn superuser_required(&self) -> Result<(), AppError> {
        if !self.is_authenticated {
            return Err(AppError::Unauthorized(String::from("Superuser required")));
        }
        Ok(())
    }
    // pub async fn superuser_required(&self) -> Result<bool, AppError> {
    //     if !self.is_superuser {
    //         return Err(AppError::APIBadRequest(String::from("Superuser required")));
    //     } else {
    //         return Ok(true);
    //     }
    // }
    // pub async fn staff_required(&self) -> Result<bool, AppError> {
    //     if !self.is_staff {
    //         return Err(AppError::APIBadRequest(String::from("Staff required")));
    //     } else {
    //         return Ok(true);
    //     }
    // }
}

pub async fn authorization_middleware(
    State(state): State<Arc<AppState>>,
    mut req: Request<Body>,
    next: Next,
) -> Result<Response, AppError> {
    let auth_header = req.headers().typed_get::<Authorization<Bearer>>();

    if let Some(auth_header) = auth_header {
        let token = auth_header.token().to_owned();
        let payload = verify_jwt(&state.secret, &token)?;
        let uid = payload.claims.uid;
        let user = RequestUser::get(&state.pool, &uid).await?;
        req.extensions_mut().insert(user);
    } else {
        req.extensions_mut().insert(RequestUser::default());
        // } else {
        // return Err(AppError::UnauthorizedMessage(String::from("No token")));
    };

    Ok(next.run(req).await)
}

// pub async fn print_request_response(
//     req: Request,
//     next: Next,
// ) -> Result<impl IntoResponse, (StatusCode, String)> {
//     let (parts, body) = req.into_parts();
//     let bytes = buffer_and_print("request", body).await?;
//     let req = Request::from_parts(parts, Body::from(bytes));

//     let res = next.run(req).await;

//     let (parts, body) = res.into_parts();
//     let bytes = buffer_and_print("response", body).await?;
//     let res = Response::from_parts(parts, Body::from(bytes));

//     Ok(res)
// }

// async fn buffer_and_print<B>(direction: &str, body: B) -> Result<Bytes, (StatusCode, String)>
// where
//     B: axum::body::HttpBody<Data = Bytes>,
//     B::Error: std::fmt::Display,
// {
//     let bytes = match body.collect().await {
//         Ok(collected) => collected.to_bytes(),
//         Err(err) => {
//             return Err((
//                 StatusCode::BAD_REQUEST,
//                 format!("failed to read {direction} body: {err}"),
//             ));
//         }
//     };

//     if let Ok(body) = std::str::from_utf8(&bytes) {
//         tracing::info!("{direction} body = {}", format!("{:.*}", 200, body));
//     }

//     Ok(bytes)
// }
