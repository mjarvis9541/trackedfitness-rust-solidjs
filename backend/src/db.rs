use chrono::NaiveDate;
use sqlx::{Postgres, QueryBuilder};
use uuid::Uuid;

use crate::util::query::QueryParams;

pub trait Filters {
    fn filter_date(
        &mut self,
        column: &'static str,
        expr: &'static str,
        query: &Option<NaiveDate>,
    ) -> &mut Self;

    fn filter_uuid_exact(&mut self, column: &'static str, query: &Option<Uuid>) -> &mut Self;

    fn filter_icontains(&mut self, column: &'static str, query: &Option<String>) -> &mut Self;

    fn filter_exact(&mut self, column: &'static str, query: &Option<String>) -> &mut Self;

    fn search_filter(&mut self, column: &'static str, query: &QueryParams) -> &mut Self;

    fn ordering_filter(
        &mut self,
        query: &QueryParams,
        ordering_fields: &'static [&'static str],
        default: &str,
    ) -> &mut Self;

    fn paginate(&mut self, page: Option<i32>, page_size: Option<i32>) -> &mut Self;
}

impl Filters for QueryBuilder<'static, Postgres> {
    fn filter_date(
        &mut self,
        column: &'static str,
        expr: &'static str,
        query: &Option<NaiveDate>,
    ) -> &mut Self {
        if let Some(query) = query {
            self.push(" AND ");
            self.push(column);
            self.push(expr);
            self.push_bind(query.clone());
        }
        self
    }
    fn filter_uuid_exact(&mut self, column: &'static str, query: &Option<Uuid>) -> &mut Self {
        if let Some(query) = query {
            self.push(" AND ");
            self.push(column);
            self.push(" = ");
            self.push_bind(query.clone());
        }
        self
    }
    fn filter_icontains(&mut self, column: &'static str, query: &Option<String>) -> &mut Self {
        if let Some(query) = query {
            self.push(" AND ");
            self.push(column);
            self.push(" ILIKE ");
            self.push_bind(format!("%{}%", query));
        }
        self
    }
    fn filter_exact(&mut self, column: &'static str, query: &Option<String>) -> &mut Self {
        if let Some(query) = query {
            self.push(" AND ");
            self.push(column);
            self.push(" = ");
            self.push_bind(query.clone());
        }
        self
    }
    fn search_filter(&mut self, column: &'static str, query: &QueryParams) -> &mut Self {
        if let Some(query) = &query.search {
            self.push(" AND ");
            self.push(column);
            self.push(" ILIKE ");
            self.push_bind(format!("%{}%", query));
        }
        self
    }

    fn ordering_filter(
        &mut self,
        query: &QueryParams,
        ordering_fields: &'static [&'static str],
        default: &str,
    ) -> &mut Self {
        if let Some(order) = &query.order {
            let mut order = order.clone();
            let direction: &str;
            if !order.contains('-') {
                direction = " ASC NULLS LAST";
            } else {
                order.remove(0);
                direction = " DESC NULLS LAST";
            }
            if ordering_fields.contains(&order.as_str()) {
                self.push(" ORDER BY ");
                self.push(order);
                self.push(direction);
            }
        } else {
            self.push(" ORDER BY ");
            self.push(default);
        }
        self
    }

    fn paginate(&mut self, page: Option<i32>, page_size: Option<i32>) -> &mut Self {
        let limit = page_size.unwrap_or(25);
        if let Some(page) = page {
            if page > 1 {
                self.push(" OFFSET ");
                self.push_bind(page * limit);
            }
        }
        self.push(" LIMIT ");
        self.push_bind(limit);
        self
    }
}
