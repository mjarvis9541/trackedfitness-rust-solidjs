use axum::{
    routing::{get, post},
    Router,
};
use std::sync::Arc;

use crate::AppState;

use super::view::{
    email_change_complete_view, email_change_view, login_view, password_change_view,
    password_reset_complete_view, password_reset_view, signup_complete_view, signup_resend_view,
    signup_view,
};

pub fn auth_router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/login", post(login_view))
        .route("/signup", post(signup_view))
        .route("/signup-resend", post(signup_resend_view))
        .route("/signup-complete", post(signup_complete_view))
        .route("/email-change", post(email_change_view))
        .route("/email-change-complete", post(email_change_complete_view))
        .route("/password-reset", post(password_reset_view))
        .route(
            "/password-reset-complete",
            post(password_reset_complete_view),
        )
        .route("/password-change", post(password_change_view))
}
