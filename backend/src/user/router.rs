use axum::{
    routing::{delete, get, post, put},
    Router,
};
use std::sync::Arc;

use crate::AppState;

use super::view::{
    admin_user_delete_view, admin_user_detail_view, admin_user_update_view, user_create_view,
    user_delete_id_range_view, user_delete_view, user_detail_view, user_header_view,
    user_list_view, user_select_view, user_stats_detail_view, user_stats_list_view,
    user_update_view,
};

pub fn user_router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/", get(user_list_view))
        .route("/", post(user_create_view))
        .route("/:username", get(user_detail_view))
        .route("/:username", put(user_update_view))
        .route("/:username", delete(user_delete_view))
        .route("/admin/:id", get(admin_user_detail_view))
        .route("/admin/:id", put(admin_user_update_view))
        .route("/admin/:id", delete(admin_user_delete_view))
        .route("/:username/header", get(user_header_view))
        .route("/delete-id-range", delete(user_delete_id_range_view))
        .route("/select", get(user_select_view))
        .route("/admin/:id/stats", get(user_stats_detail_view))
        .route("/admin/stats", get(user_stats_list_view))
}
