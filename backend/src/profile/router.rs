use axum::{
    routing::{delete, get, post, put},
    Router,
};
use std::sync::Arc;

use crate::AppState;

use super::view::{
    admin_profile_delete_view, admin_profile_detail_view, admin_profile_update_view,
    profile_create_view, profile_date_detail_view, profile_delete_id_range_view,
    profile_delete_view, profile_detail_view, profile_list_view, profile_update_view,
};

pub fn profile_router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/", get(profile_list_view))
        .route("/", post(profile_create_view))
        .route("/:username", get(profile_detail_view))
        .route("/:username/:date", get(profile_date_detail_view))
        .route("/:username", put(profile_update_view))
        .route("/:username", delete(profile_delete_view))
        .route("/delete-id-range", delete(profile_delete_id_range_view))
        .route("/admin/:id", get(admin_profile_detail_view))
        .route("/admin/:id", put(admin_profile_update_view))
        .route("/admin/:id", delete(admin_profile_delete_view))
}
