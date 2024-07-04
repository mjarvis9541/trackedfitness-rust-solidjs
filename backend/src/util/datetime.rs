use std::mem;

use chrono::{prelude::*, Duration};

pub trait NaiveDateExt {
    fn days_in_month(&self) -> u32;
    fn days_in_year(&self) -> u32;
    fn is_leap_year(&self) -> bool;
}

#[derive(Debug)]
pub struct DateHourRange(pub NaiveDateTime, pub NaiveDateTime);

impl Iterator for DateHourRange {
    type Item = NaiveDateTime;
    fn next(&mut self) -> Option<Self::Item> {
        if self.0 <= self.1 {
            let next = self.0 + Duration::hours(1);
            Some(mem::replace(&mut self.0, next))
        } else {
            None
        }
    }
}

#[derive(Debug)]
pub struct DateRange(pub NaiveDate, pub NaiveDate);

impl Iterator for DateRange {
    type Item = NaiveDate;
    fn next(&mut self) -> Option<Self::Item> {
        if self.0 <= self.1 {
            let next = self.0 + Duration::days(1);
            Some(mem::replace(&mut self.0, next))
        } else {
            None
        }
    }
}

impl NaiveDateExt for chrono::NaiveDate {
    fn days_in_month(&self) -> u32 {
        let month = self.month();
        match month {
            1 | 3 | 5 | 7 | 8 | 10 | 12 => 31,
            4 | 6 | 9 | 11 => 30,
            2 => {
                if self.is_leap_year() {
                    29
                } else {
                    28
                }
            }
            _ => panic!("Invalid month: {}", month),
        }
    }

    fn days_in_year(&self) -> u32 {
        if self.is_leap_year() {
            366
        } else {
            365
        }
    }

    fn is_leap_year(&self) -> bool {
        let year = self.year();
        year % 4 == 0 && (year % 100 != 0 || year % 400 == 0)
    }
}
