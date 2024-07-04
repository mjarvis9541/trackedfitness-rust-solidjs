use axum::{
    routing::{delete, get, post, put},
    Router,
};
use std::sync::Arc;

use crate::AppState;

use super::view::{
    admin_brand_delete_view, admin_brand_detail_view, admin_brand_update_view, brand_create_view,
    brand_delete_id_range_view, brand_delete_view, brand_detail_view, brand_filter_view,
    brand_list_view, brand_select_view, brand_update_view, new_brand_list_view,
};

pub fn brand_router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/", get(brand_list_view))
        .route("/", post(brand_create_view))
        .route("/:slug", get(brand_detail_view))
        .route("/:slug", put(brand_update_view))
        .route("/:slug", delete(brand_delete_view))
        .route("/admin/:id", get(admin_brand_detail_view))
        .route("/admin/:id", put(admin_brand_update_view))
        .route("/admin/:id", delete(admin_brand_delete_view))
        .route("/filter", get(brand_filter_view))
        .route("/select", get(brand_select_view))
        .route("/delete-id-range", delete(brand_delete_id_range_view))
        .route("/new", get(new_brand_list_view))
}
