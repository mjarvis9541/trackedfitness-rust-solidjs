export const createdUpdatedSortOptions = [
  { value: "-created_at", label: "Created (desc)" },
  { value: "created_at", label: "Created (asc)" },
  { value: "-updated_at", label: "Updated (desc)" },
  { value: "updated_at", label: "Updated (asc)" },
];

// const PRIVACY_LEVEL_UNKNOWN: i32 = 0;
// const PRIVACY_LEVEL_PUBLIC: i32 = 1;
// const PRIVACY_LEVEL_FOLLOWER_ONLY: i32 = 2;
// const PRIVACY_LEVEL_PRIVATE: i32 = 3;

export const userPrivacyLevel = [
  { value: "1", label: "Public" },
  { value: "2", label: "Follower Only" },
  { value: "3", label: "Private" },
  { value: "0", label: "Unknown" },
];

export const servingOptions = [
  { value: "g", label: "100g" },
  { value: "ml", label: "100ml" },
  { value: "srv", label: "1 Serving" },
];

export const sexOptions = [
  { value: "M", label: "Male" },
  { value: "F", label: "Female" },
];

export const activityLevelOptions = [
  { value: "SD", label: "Sedentary - Little to no exercise/desk job" },
  {
    value: "LA",
    label: "Lightly Active - Light exercise/sports 1-3 days a week",
  },
  {
    value: "MA",
    label: "Moderately Active - Moderate exercise/sports 3-5 days a week",
  },
  {
    value: "VA",
    label: "Very Active - Heavy exercise/sports 6-7 days a week",
  },
  {
    value: "EA",
    label:
      "Extremely Active - Very heavy exercise/physical job/training twice a day",
  },
];

export const basicSortOptions = [
  { value: "-created_at", label: "Created (Newest)" },
  { value: "created_at", label: "Created (Oldest)" },
  { value: "-updated_at", label: "Updated (Newest)" },
  { value: "updated_at", label: "Updated (Oldest)" },
];

export const genericSortOptions = [
  { value: "name", label: "Name (A-z)" },
  { value: "-name", label: "Name (Z-a)" },
  { value: "-created_by", label: "Created By (A-z)" },
  { value: "created_by", label: "Created By (Z-a)" },
  { value: "-created_at", label: "Created (Newest)" },
  { value: "created_at", label: "Created (Oldest)" },
  { value: "-updated_at", label: "Updated (Newest)" },
  { value: "updated_at", label: "Updated (Oldest)" },
];

export const mealOfDaySortOptions = [
  { value: "ordering", label: "Order (Asc)" },
  { value: "-ordering", label: "Order (Desc)" },
  { value: "name", label: "Name (A-z)" },
  { value: "-name", label: "Name (Z-a)" },
  { value: "-created_by", label: "Created By (A-z)" },
  { value: "created_by", label: "Created By (Z-a)" },
  { value: "-created_at", label: "Created (Newest)" },
  { value: "created_at", label: "Created (Oldest)" },
  { value: "-updated_at", label: "Updated (Newest)" },
  { value: "updated_at", label: "Updated (Oldest)" },
];

export const userSortOptions = [
  { value: "username", label: "Username (A-z)" },
  { value: "-username", label: "Username (Z-a)" },
  { value: "last_login", label: "Last Login (Latest)" },
  { value: "-last_login", label: "Last Login (Oldest)" },
];

export const perPageOptions = [
  { value: "25", label: "25" },
  { value: "50", label: "50" },
  { value: "75", label: "75" },
  { value: "100", label: "100" },
];

export const goalOptions = [
  { value: "LW", label: "Lose Weight" },
  { value: "GW", label: "Build Muscle" },
  { value: "MW", label: "Maintain Weight" },
];

export const brandSortOptions = [
  { value: "name", label: "Name (A-z)" },
  { value: "-name", label: "Name (Z-a)" },
  { value: "-food_count", label: "Food Count (High-Low)" },
  { value: "food_count", label: "Food Count (Low-High)" },
  { value: "-created_by", label: "Created By (A-z)" },
  { value: "created_by", label: "Created By (Z-a)" },
  { value: "-created_at", label: "Created (Newest)" },
  { value: "created_at", label: "Created (Oldest)" },
  { value: "-updated_at", label: "Updated (Newest)" },
  { value: "updated_at", label: "Updated (Oldest)" },
];

export const mealSortOptions = [
  { value: "name", label: "Name (A-z)" },
  { value: "-name", label: "Name (Z-a)" },
  { value: "-food_count", label: "Food Count (High-Low)" },
  { value: "food_count", label: "Food Count (Low-High)" },
  { value: "-energy", label: "Calories (High-Low)" },
  { value: "energy", label: "Calories (Low-High)" },
  { value: "-protein", label: "Protein (High-Low)" },
  { value: "protein", label: "Protein (Low-High)" },
  { value: "-carbohydrate", label: "Carbs (High-Low)" },
  { value: "carbohydrate", label: "Carbs (Low-High)" },
  { value: "-fat", label: "Fat (High-Low)" },
  { value: "fat", label: "Fat (Low-High)" },
  { value: "-saturates", label: "Saturates (High-Low)" },
  { value: "saturates", label: "Saturates (Low-High)" },
  { value: "-sugars", label: "Sugars (High-Low)" },
  { value: "sugars", label: "Sugars (Low-High)" },
  { value: "-fibre", label: "Fibre (High-Low)" },
  { value: "fibre", label: "Fibre (Low-High)" },
  { value: "-salt", label: "Salt (High-Low)" },
  { value: "salt", label: "Salt (Low-High)" },
  { value: "-created_at", label: "Created (Newest)" },
  { value: "created_at", label: "Created (Oldest)" },
  { value: "-updated_at", label: "Updated (Newest)" },
  { value: "updated_at", label: "Updated (Oldest)" },
];

export const foodSortOptions = [
  { value: "name", label: "Name (A-z)" },
  { value: "-name", label: "Name (Z-a)" },
  { value: "-last_added_date", label: "Last Added Date (Newest)" },
  { value: "last_added_date", label: "Last Added Date (Oldest)" },
  { value: "-created_at", label: "Created (Newest)" },
  { value: "created_at", label: "Created (Oldest)" },
  { value: "-updated_at", label: "Updated (Newest)" },
  { value: "updated_at", label: "Updated (Oldest)" },
  { value: "-energy", label: "Calories (High-Low)" },
  { value: "energy", label: "Calories (Low-High)" },
  { value: "-protein", label: "Protein (High-Low)" },
  { value: "protein", label: "Protein (Low-High)" },
  { value: "-carbohydrate", label: "Carbs (High-Low)" },
  { value: "carbohydrate", label: "Carbs (Low-High)" },
  { value: "-fat", label: "Fat (High-Low)" },
  { value: "fat", label: "Fat (Low-High)" },
  { value: "-saturates", label: "Saturates (High-Low)" },
  { value: "saturates", label: "Saturates (Low-High)" },
  { value: "-sugars", label: "Sugars (High-Low)" },
  { value: "sugars", label: "Sugars (Low-High)" },
  { value: "-fibre", label: "Fibre (High-Low)" },
  { value: "fibre", label: "Fibre (Low-High)" },
  { value: "-salt", label: "Salt (High-Low)" },
  { value: "salt", label: "Salt (Low-High)" },
];

export const brandSort = [
  { value: "name", label: "Name (A-z)" },
  { value: "-name", label: "Name (Z-a)" },
  { value: "-food_count", label: "Food Count (High-Low)" },
  { value: "food_count", label: "Food Count (Low-High)" },
  { value: "-created_by", label: "Created By (A-z)" },
  { value: "created_by", label: "Created By (Z-a)" },
  { value: "-created_at", label: "Created (Newest)" },
  { value: "created_at", label: "Created (Oldest)" },
  { value: "-updated_at", label: "Updated (Newest)" },
  { value: "updated_at", label: "Updated (Oldest)" },
];
