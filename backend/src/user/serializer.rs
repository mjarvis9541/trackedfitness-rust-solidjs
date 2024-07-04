use serde::Deserialize;
use validator::Validate;

#[derive(Debug, Deserialize, Validate)]
pub struct CreateUserSerializer {
    #[validate(
        length(min = 3, message = "Minimum of 3 characters"),
        length(max = 15, message = "Maximum of 15 characters")
    )]
    pub name: String,
    #[validate(
        length(min = 3, message = "Minimum of 3 characters"),
        length(max = 50, message = "Maximum of 50 characters")
    )]
    pub username: String,
    #[validate(
        length(min = 8, message = "Minimum of 8 characters"),
        length(max = 50, message = "Maximum of 50 characters")
    )]
    pub password: String,
    #[validate(email(message = "Invalid email address"))]
    pub email: String,
    pub email_verified: bool,
    pub is_active: bool,
    pub is_staff: bool,
    pub is_superuser: bool,
    pub privacy_level: i32,
}

#[derive(Debug, Deserialize, Validate)]
pub struct UserUpdateInput {
    pub name: String,
    pub username: String,
    #[validate(email(message = "Invalid email address"))]
    pub email: String,
    pub is_active: bool,
    pub is_staff: bool,
    pub is_superuser: bool,
    pub privacy_level: i32,
}

#[derive(Debug, Deserialize, Validate)]
pub struct AdminUpdateInput {
    pub name: String,
    pub username: String,
    #[validate(email(message = "Invalid email address"))]
    pub email: String,
    pub email_verified: bool,
    pub email_change_to: String,
    pub is_active: bool,
    pub is_staff: bool,
    pub is_superuser: bool,
    pub privacy_level: i32,
}
