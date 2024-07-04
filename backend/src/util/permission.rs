use sqlx::PgPool;

use crate::{
    error::AppError, follower::model::Follower, middleware::RequestUser, user::model::User,
};

const PRIVACY_LEVEL_UNKNOWN: i32 = 0;
const PRIVACY_LEVEL_PUBLIC: i32 = 1;
const PRIVACY_LEVEL_FOLLOWER_ONLY: i32 = 2;
const PRIVACY_LEVEL_PRIVATE: i32 = 3;

pub async fn user_privacy_check(
    pool: &PgPool,
    request_user: &RequestUser,
    viewed_user: &User,
) -> Result<bool, AppError> {
    if request_user.is_superuser {
        return Ok(true);
    }
    if viewed_user.privacy_level == PRIVACY_LEVEL_UNKNOWN {
        return Ok(true);
    }
    if viewed_user.privacy_level == PRIVACY_LEVEL_PUBLIC {
        return Ok(true);
    }
    if viewed_user.privacy_level == PRIVACY_LEVEL_PRIVATE {
        return Err(AppError::UnauthorizedMessage(String::from("private user")));
    }
    if viewed_user.privacy_level == PRIVACY_LEVEL_FOLLOWER_ONLY {
        let is_following = Follower::is_following(pool, &viewed_user.id, &request_user.id).await?;
        if !is_following {
            return Err(AppError::UnauthorizedMessage(String::from(
                "You need to follow this user to view their profile",
            )));
        }
    }
    Ok(true)
}
