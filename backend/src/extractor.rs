use axum::{
    async_trait,
    body::Body,
    extract::{rejection::JsonRejection, Extension, FromRef, FromRequest, FromRequestParts},
    http::{request::Parts, Request},
    Json, RequestExt,
};
use hyper::StatusCode;
use sqlx::PgPool;
use std::sync::Arc;
use validator::Validate;

use crate::{
    brand::serializer::DatabaseValidation, error::AppError, middleware::RequestUser, AppState,
};

pub struct JsonExtractor<T>(pub T);

#[async_trait]
impl<S, T> FromRequest<S> for JsonExtractor<T>
where
    S: Send + Sync,

    Json<T>: FromRequest<(), Rejection = JsonRejection>,
    T: Validate,
    T: 'static,
{
    type Rejection = AppError;

    async fn from_request(req: Request<Body>, _state: &S) -> Result<Self, Self::Rejection> {
        let Json(data) = req.extract::<Json<T>, _>().await?;
        data.validate()?;
        Ok(Self(data))
    }
}

pub struct DBJsonExtractor<T>(pub T);

#[async_trait]
impl<S, T> FromRequest<S> for DBJsonExtractor<T>
where
    S: Send + Sync + std::fmt::Debug,
    Json<T>: FromRequest<(), Rejection = JsonRejection>,
    T: 'static,
    T: Validate,
    T: DatabaseValidation + Send + Sync,
{
    type Rejection = AppError;

    async fn from_request(mut req: Request<Body>, _state: &S) -> Result<Self, Self::Rejection> {
        let Extension(state) = req.extract_parts::<Extension<Arc<AppState>>>().await?;

        let Json(data) = req.extract::<Json<T>, _>().await?;
        data.validate()?;
        data.db_validate(&state.pool).await?;
        Ok(Self(data))
    }
}

struct DatabaseConnection(sqlx::pool::PoolConnection<sqlx::Postgres>);

#[async_trait]
impl<S> FromRequestParts<S> for DatabaseConnection
where
    PgPool: FromRef<S>,
    S: Send + Sync,
{
    type Rejection = (StatusCode, String);

    async fn from_request_parts(_parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let pool = PgPool::from_ref(state);
        let conn = pool.acquire().await.map_err(internal_error)?;
        Ok(Self(conn))
    }
}

pub fn internal_error<E>(err: E) -> (StatusCode, String)
where
    E: std::error::Error,
{
    (StatusCode::INTERNAL_SERVER_ERROR, err.to_string())
}

pub struct ExtractSuperuser(pub RequestUser);

#[async_trait]
impl<S> FromRequestParts<S> for ExtractSuperuser
where
    S: Send + Sync,
{
    type Rejection = AppError;

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        let user = parts
            .extensions
            .get::<RequestUser>()
            .expect("User to be in request extension - middleware");

        user.superuser_required()?;

        Ok(Self(user.clone()))
    }
}

pub struct LoginRequired(pub RequestUser);

#[async_trait]
impl<S> FromRequestParts<S> for LoginRequired
where
    S: Send + Sync,
{
    type Rejection = AppError;

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        let user = parts
            .extensions
            .get::<RequestUser>()
            .expect("User to be in request extension - middleware");

        user.login_required()?;

        Ok(Self(user.clone()))
    }
}

// next up path extractor that checks request user vs path user and priavacy level
// defo validate db after struct and request user check
// check how django does it

// struct JsonOrForm<T>(T);

// #[async_trait]
// impl<S, T> FromRequest<S> for JsonOrForm<T>
// where
//     S: Send + Sync,

//     Json<T>: FromRequest<()>,
//     Form<T>: FromRequest<()>,
//     T: 'static,
// {
//     type Rejection = Response;

//     async fn from_request(req: Request, _state: &S) -> Result<Self, Self::Rejection> {
//         let content_type_header = req.headers().get(CONTENT_TYPE);
//         let content_type = content_type_header.and_then(|value| value.to_str().ok());

//         if let Some(content_type) = content_type {
//             if content_type.starts_with("application/json") {
//                 let Json(payload) = req.extract().await.map_err(IntoResponse::into_response)?;
//                 return Ok(Self(payload));
//             }

//             if content_type.starts_with("application/x-www-form-urlencoded") {
//                 let Form(payload) = req.extract().await.map_err(IntoResponse::into_response)?;
//                 return Ok(Self(payload));
//             }
//         }

//         Err(StatusCode::UNSUPPORTED_MEDIA_TYPE.into_response())
//     }
// }

// struct FormOrJson<T>(T);

// #[async_trait]
// impl<S, B, T> FromRequest<S, B> for FormOrJson<T>
// where
//     S: Send + Sync,
//     B: Send + 'static,
//     Json<T>: FromRequest<(), B>,
//     Form<T>: FromRequest<(), B>,
//     T: 'static,
// {
//     type Rejection = Response;

//     async fn from_request(req: Request<B>, _state: &S) -> Result<Self, Self::Rejection> {
//         let content_type = req
//             .headers()
//             .get(CONTENT_TYPE)
//             .and_then(|value| value.to_str().ok())
//             .ok_or_else(|| StatusCode::BAD_REQUEST.into_response())?;

//         if content_type.starts_with("application/json") {
//             let Json(payload) = req
//                 .extract::<Json<T>, _>()
//                 .await
//                 .map_err(|err| err.into_response())?;

//             Ok(Self(payload))
//         } else if content_type.starts_with("application/x-www-form-urlencoded") {
//             let Form(payload) = req
//                 .extract::<Form<T>, _>()
//                 .await
//                 .map_err(|err| err.into_response())?;

//             Ok(Self(payload))
//         } else {
//             Err(StatusCode::BAD_REQUEST.into_response())
//         }
//     }
// }
