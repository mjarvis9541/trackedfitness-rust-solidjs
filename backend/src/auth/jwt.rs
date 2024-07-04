use chrono::{prelude::*, Duration};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, TokenData, Validation};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::error::AppError;

#[derive(Debug, Deserialize, Serialize)]
pub struct Payload {
    pub iat: i64,
    pub exp: i64,
    pub sub: String,
    pub iss: String,
    pub uid: Uuid,
}

impl Payload {
    pub fn from_token(&self, secret: &str, token: &str) -> Result<TokenData<Self>, AppError> {
        let decoded = decode::<Payload>(
            token,
            &DecodingKey::from_secret(secret.as_bytes()),
            &Validation::default(),
        )?;
        Ok(decoded)
    }
}

pub fn create_jwt(secret: &str, uid: Uuid) -> Result<String, AppError> {
    let iat = Utc::now();
    let exp = iat + Duration::minutes(1440);
    let iat = iat.timestamp();
    let exp = exp.timestamp();
    let sub = String::from("");
    let iss = String::from("trackedfitness.com");
    let payload = Payload {
        iat,
        exp,
        sub,
        iss,
        uid,
    };
    let token = encode(
        &Header::default(),
        &payload,
        &EncodingKey::from_secret(secret.as_bytes()),
    )?;
    Ok(token)
}

pub fn verify_jwt(secret: &str, token: &str) -> Result<TokenData<Payload>, AppError> {
    let decoded = decode::<Payload>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &Validation::default(),
    )?;
    Ok(decoded)
}

pub fn create_token(
    secret: &str,
    uid: Uuid,
    duration: i64,
    subject: &str,
) -> Result<String, AppError> {
    let iat = Utc::now();
    let exp = iat + Duration::minutes(duration);
    let iat = iat.timestamp();
    let exp = exp.timestamp();
    let sub = String::from(subject);
    let iss = String::from("trackedfitness.com");
    let payload = Payload {
        iat,
        exp,
        sub,
        iss,
        uid,
    };
    let token = encode(
        &Header::default(),
        &payload,
        &EncodingKey::from_secret(secret.as_bytes()),
    )?;
    Ok(token)
}

pub fn validate_token(token: TokenData<Payload>) -> Result<TokenData<Payload>, AppError> {
    let now = Utc::now().timestamp();
    if token.claims.exp >= now {}
    todo!()
}
