use serde::Deserialize;
use uuid::Uuid;
use validator::Validate;

#[derive(Debug, Deserialize, Validate)]
pub struct FollowerInput {
    pub user_id: Uuid,
    pub follower_id: Uuid,
    pub status: i32,
}
