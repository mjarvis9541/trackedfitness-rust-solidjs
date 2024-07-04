use chrono::prelude::*;
use futures::TryStreamExt;
use rust_decimal::prelude::*;
use rust_decimal_macros::dec;
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, PgPool, Row};
use uuid::Uuid;

use crate::util::query::QueryParams;

use super::serializer::{ProfileInput, ProfileUpdateInput};

#[derive(Debug, Serialize, FromRow)]
pub struct Profile {
    pub id: Uuid,
    pub user_id: Uuid,
    pub sex: String,
    pub height: Decimal,
    pub date_of_birth: NaiveDate,
    pub fitness_goal: String,
    pub activity_level: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,
    pub created_by_id: Uuid,
    pub updated_by_id: Option<Uuid>,
}

#[derive(Debug, Serialize, FromRow)]
pub struct ProfileSerializer {
    pub id: Uuid,
    pub user_id: Uuid,
    pub username: String,
    pub sex: String,
    pub height: Decimal,
    pub date_of_birth: NaiveDate,
    pub fitness_goal: String,
    pub activity_level: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,
    pub created_by_id: Uuid,
    pub updated_by_id: Option<Uuid>,
    pub latest_weight: Option<Decimal>,
    pub latest_weight_date: Option<NaiveDate>,
    pub latest_weight_id: Option<Uuid>,
}

const M_SEX_MODIFIER: Decimal = dec!(88.362);
const M_WEIGHT_MODIFIER: Decimal = dec!(13.397);
const M_HEIGHT_MODIFIER: Decimal = dec!(4.799);
const M_AGE_MODIFIER: Decimal = dec!(5.677);

const F_SEX_MODIFIER: Decimal = dec!(447593);
const F_WEIGHT_MODIFIER: Decimal = dec!(9247);
const F_HEIGHT_MODIFIER: Decimal = dec!(3098);
const F_AGE_MODIFIER: Decimal = dec!(4330);

const SEDENTARY: Decimal = dec!(1.2);
const LIGHTLY_ACTIVE: Decimal = dec!(1.375);
const MODERATELY_ACTIVE: Decimal = dec!(1.55);
const VERY_ACTIVE: Decimal = dec!(1.725);
const EXTRA_ACTIVE: Decimal = dec!(1.9);

const LOSE_WEIGHT_MODIFIER: Decimal = dec!(0.8);
const MAINTAIN_WEIGHT_MODIFIER: Decimal = dec!(1);
const GAIN_WEIGHT_MODIFIER: Decimal = dec!(1.1);

enum SexEnum {
    Male(DataStruct),
    Female(DataStruct),
}

struct DataStruct {
    value: String,
    display: String,
    modifier: ModifierEnum,
}

enum ModifierEnum {
    Single(Decimal),
    Multi(Modifier),
}

enum Sex {
    Male,
    Female,
}

impl Sex {
    fn value(&self) -> String {
        match *self {
            Self::Male => String::from("M"),
            Self::Female => String::from("F"),
        }
    }
    fn display(&self) -> String {
        match *self {
            Self::Male => String::from("Male"),
            Self::Female => String::from("Female"),
        }
    }
    fn modifier(&self) -> Modifier {
        match *self {
            Self::Male => Modifier {
                sex: Decimal::new(88362, 3),
                weight: Decimal::new(13397, 3),
                height: Decimal::new(4799, 3),
                age: Decimal::new(5677, 3),
            },
            Self::Female => Modifier {
                sex: Decimal::new(447593, 3),
                weight: Decimal::new(9247, 3),
                height: Decimal::new(3098, 3),
                age: Decimal::new(4330, 3),
            },
        }
    }
}

enum ActivityLevel {
    VeryLow,
    Low,
    Medium,
    High,
    VeryHigh,
}

impl ActivityLevel {
    fn value(&self) -> String {
        match *self {
            Self::VeryLow => String::from("SD"),
            Self::Low => String::from("SD"),
            Self::Medium => String::from("SD"),
            Self::High => String::from("SD"),
            Self::VeryHigh => String::from("SD"),
        }
    }
    fn display(&self) -> String {
        match *self {
            Self::VeryLow => String::from("Sedentary"),
            Self::Low => String::from("Lightly Active"),
            Self::Medium => String::from("Moderately Active"),
            Self::High => String::from("Very Active"),
            Self::VeryHigh => String::from("Extremely Active"),
        }
    }
    fn modifier(&self) -> Decimal {
        match *self {
            Self::VeryLow => Decimal::new(1200, 3),
            Self::Low => Decimal::new(1375, 3),
            Self::Medium => Decimal::new(1550, 3),
            Self::High => Decimal::new(1725, 3),
            Self::VeryHigh => Decimal::new(1900, 3),
        }
    }
}

enum FitnessGoal {
    LoseWeight,
    MaintainWeight,
    GainWeight,
}

impl FitnessGoal {
    fn value(&self) -> String {
        match *self {
            Self::LoseWeight => String::from("LW"),
            Self::MaintainWeight => String::from("MW"),
            Self::GainWeight => String::from("GW"),
        }
    }
    fn display(&self) -> String {
        match *self {
            Self::LoseWeight => String::from("Lose Weight"),
            Self::MaintainWeight => String::from("Maintain Weight"),
            Self::GainWeight => String::from("Gain Weight"),
        }
    }
    fn modifier(&self) -> Decimal {
        match *self {
            Self::LoseWeight => Decimal::new(08, 1),
            Self::MaintainWeight => Decimal::new(10, 1),
            Self::GainWeight => Decimal::new(10, 1),
        }
    }
}

pub struct Modifier {
    pub sex: Decimal,
    pub weight: Decimal,
    pub height: Decimal,
    pub age: Decimal,
}

impl Profile {
    pub async fn count(pool: &PgPool, params: &QueryParams) -> Result<i64, sqlx::Error> {
        let mut q = sqlx::QueryBuilder::new("SELECT COUNT(t1.*) FROM user_profile t1 WHERE TRUE");
        let count = q.build().fetch_one(pool).await?.get("count");
        Ok(count)
    }
    pub async fn all(pool: &PgPool, params: &QueryParams) -> Result<Vec<Self>, sqlx::Error> {
        let mut stream = Vec::new();
        let mut rows = sqlx::query_as("SELECT t1.* FROM user_profile t1").fetch(pool);
        while let Some(row) = rows.try_next().await? {
            stream.push(row);
        }
        Ok(stream)
    }
    pub async fn create(
        pool: &PgPool,
        user_id: Uuid,
        data: ProfileInput,
        created_by_id: Uuid,
    ) -> Result<Self, sqlx::Error> {
        let query = sqlx::query_as(
            "
            INSERT INTO
                user_profile (
                    user_id,
                    sex,
                    height,
                    date_of_birth,
                    activity_level,
                    fitness_goal,
                    created_by_id
                )
            VALUES
                ($1, $2, $3, $4, $5, $6, $7)
            RETURNING
                *
            ",
        )
        .bind(user_id)
        .bind(data.sex)
        .bind(data.height)
        .bind(data.date_of_birth)
        .bind(data.activity_level)
        .bind(data.fitness_goal)
        .bind(created_by_id)
        .fetch_one(pool)
        .await?;
        Ok(query)
    }
    pub async fn get(pool: &PgPool, id: Uuid) -> Result<Self, sqlx::Error> {
        let query = sqlx::query_as("SELECT * FROM user_profile WHERE id = $1")
            .bind(id)
            .fetch_one(pool)
            .await?;
        Ok(query)
    }
    pub async fn update(
        pool: &PgPool,
        id: Uuid,
        data: ProfileUpdateInput,
        updated_by_id: Uuid,
    ) -> Result<Self, sqlx::Error> {
        let now = Utc::now().date_naive();
        let query = sqlx::query_as(
            "
            UPDATE user_profile
            SET
                sex = $1,
                height = $2,
                date_of_birth = $3,
                activity_level = $4,
                fitness_goal = $5,
                updated_at = $6,
                updated_by_id = $7
            WHERE
                id = $8
            RETURNING
                *
            ",
        )
        .bind(data.sex)
        .bind(data.height)
        .bind(data.date_of_birth)
        .bind(data.activity_level)
        .bind(data.fitness_goal)
        .bind(now)
        .bind(updated_by_id)
        .bind(id)
        .fetch_one(pool)
        .await?;
        Ok(query)
    }
    pub async fn delete(pool: &PgPool, id: Uuid) -> Result<Self, sqlx::Error> {
        let query = sqlx::query_as("DELETE FROM user_profile WHERE id = $1 RETURNING *")
            .bind(id)
            .fetch_one(pool)
            .await?;
        Ok(query)
    }
    pub async fn delete_id_range(
        pool: &PgPool,
        id_range: Vec<Uuid>,
    ) -> Result<Vec<Self>, sqlx::Error> {
        let query = sqlx::query_as(
            "
            DELETE FROM user_profile
            WHERE
                id = ANY ($1)
            RETURNING
                *
            ",
        )
        .bind(id_range)
        .fetch_all(pool)
        .await?;
        Ok(query)
    }
}

#[derive(Debug, Deserialize, Serialize)]
pub struct ProfileMetric {
    pub id: Uuid,
    pub user_id: Uuid,
    pub username: String,
    pub sex: String,
    pub height: Decimal,
    pub date_of_birth: NaiveDate,
    pub age: u32,
    pub bmi: Decimal,
    pub bmr: Decimal,
    pub tdee: Decimal,
    pub target_calories: Decimal,
    pub activity_level: String,
    pub fitness_goal: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,
    pub latest_weight_id: Option<Uuid>,
    pub latest_weight_date: Option<NaiveDate>,
    pub latest_weight: Option<Decimal>,
}

impl ProfileSerializer {
    pub async fn get(
        pool: &PgPool,
        user_id: &Uuid,
        date: Option<NaiveDate>,
    ) -> Result<Option<Self>, sqlx::Error> {
        let current_date = if let Some(date) = date {
            date
        } else {
            Utc::now().date_naive()
        };
        let query = sqlx::query_as(
            "
            SELECT
            t1.*,
            t2.username,
            t3.weight_kg as latest_weight,
            t3.date as latest_weight_date,
            t3.id as latest_weight_id
        FROM
            user_profile t1
            LEFT JOIN users_user t2 ON t2.id = t1.user_id
            LEFT JOIN progress t3 ON t3.user_id = t1.user_id
            AND t3.date = (
                SELECT
                    MAX(date)
                FROM
                    progress
                WHERE
                    user_id = $1
                    AND date <= $2
                    AND weight_kg IS NOT NULL
            )
        WHERE
            t1.user_id = $1
        ",
        )
        .bind(user_id)
        .bind(current_date)
        .fetch_optional(pool)
        .await?;
        Ok(query)
    }

    pub fn get_sex_display(&self) -> String {
        let result = match self.sex.as_str() {
            "M" => "Male",
            "F" => "Female",
            _ => "",
        };
        result.to_string()
    }

    pub fn get_activity_level_display(&self) -> String {
        let result = match self.activity_level.as_str() {
            "SD" => "Sedentary",
            "LA" => "Lightly Active",
            "MA" => "Moderately Active",
            "VA" => "Very Active",
            "EA" => "Extremely Active",
            _ => "",
        };
        result.to_string()
    }

    pub fn get_fitness_goal_display(&self) -> String {
        let result = match self.fitness_goal.as_str() {
            "LW" => "Lose Weight",
            "GW" => "Gain Weight",
            "MW" => "Maintain Weight",
            _ => "",
        };
        result.to_string()
    }

    pub fn get_bmr_modifier(&self) -> Modifier {
        match self.sex.as_str() {
            "M" => Modifier {
                sex: M_SEX_MODIFIER,
                weight: M_WEIGHT_MODIFIER,
                height: M_HEIGHT_MODIFIER,
                age: M_AGE_MODIFIER,
            },
            "S" => Modifier {
                sex: F_SEX_MODIFIER,
                weight: F_WEIGHT_MODIFIER,
                height: F_HEIGHT_MODIFIER,
                age: F_AGE_MODIFIER,
            },
            _ => Modifier {
                sex: M_SEX_MODIFIER,
                weight: M_WEIGHT_MODIFIER,
                height: M_HEIGHT_MODIFIER,
                age: M_AGE_MODIFIER,
            },
        }
    }

    pub fn get_activity_level(&self) -> Decimal {
        match self.activity_level.as_str() {
            "SD" => SEDENTARY,
            "LA" => LIGHTLY_ACTIVE,
            "MA" => MODERATELY_ACTIVE,
            "VA" => VERY_ACTIVE,
            "EA" => EXTRA_ACTIVE,
            _ => SEDENTARY,
        }
    }

    pub fn get_fitness_goal(&self) -> Decimal {
        match self.fitness_goal.as_str() {
            "LW" => LOSE_WEIGHT_MODIFIER,
            "GW" => GAIN_WEIGHT_MODIFIER,
            "MW" => MAINTAIN_WEIGHT_MODIFIER,
            _ => MAINTAIN_WEIGHT_MODIFIER,
        }
    }

    pub fn get_age(&self) -> u32 {
        let now = Utc::now().date_naive();
        now.years_since(self.date_of_birth).unwrap_or_default()
    }

    pub fn get_bmi(&self, weight: Decimal) -> Decimal {
        let height = self.height * dec!(0.01);
        let height_squared = height * height;
        weight / height_squared
    }

    pub fn get_bmr(&self, weight: Decimal) -> Decimal {
        let age = self.get_age();
        let age = Decimal::from_u32(age).unwrap_or_default();
        let modifier = self.get_bmr_modifier();
        let weight_mod = modifier.weight * weight;
        let height_mod = modifier.height * self.height;
        let age_mod = modifier.age * age;
        let sex_mod = modifier.sex;
        sex_mod + weight_mod + height_mod - age_mod
    }

    pub fn get_tdee(&self, weight: Decimal) -> Decimal {
        let bmr = self.get_bmr(weight);
        let activity_level = self.get_activity_level();
        bmr * activity_level
    }

    pub fn get_target_calories(&self, weight: Decimal) -> Decimal {
        let fitness_goal = self.get_fitness_goal();
        let tdee = self.get_tdee(weight);
        fitness_goal * tdee
    }

    pub fn into_metric(&self) -> ProfileMetric {
        let weight = self.latest_weight.unwrap_or(dec!(75));
        ProfileMetric {
            id: self.id,
            user_id: self.user_id,
            username: self.username.clone(),
            sex: self.get_sex_display(),
            height: self.height,
            age: self.get_age(),
            date_of_birth: self.date_of_birth,
            bmi: self.get_bmi(weight),
            bmr: self.get_bmr(weight),
            tdee: self.get_tdee(weight),
            target_calories: self.get_target_calories(weight),
            activity_level: self.get_activity_level_display(),
            fitness_goal: self.get_fitness_goal_display(),
            created_at: self.created_at,
            updated_at: self.updated_at,
            latest_weight_id: self.latest_weight_id,
            latest_weight_date: self.latest_weight_date,
            latest_weight: self.latest_weight,
        }
    }
}
