export type DietDay = {
  meal: DietMeal[];
  energy: string;
  fat: string;
  saturates: string;
  carbohydrate: string;
  sugars: string;
  fibre: string;
  protein: string;
  salt: string;
  energy_per_kg: string;
  protein_per_kg: string;
  carbohydrate_per_kg: string;
  fat_per_kg: string;
  protein_pct: string;
  carbohydrate_pct: string;
  fat_pct: string;
};

export type DietMeal = {
  id: string;
  name: string;
  slug: string;
  ordering: number;
  food: DietFood[];
  energy: string;
  fat: string;
  saturates: string;
  carbohydrate: string;
  sugars: string;
  fibre: string;
  protein: string;
  salt: string;
};

export type DietFood = {
  id: string;
  date: string;
  username: string;
  name: string;
  brand_name: string;
  meal_slug: string;
  quantity: string;
  data_value: number;
  data_measurement: string;
  energy: string;
  fat: string;
  saturates: string;
  carbohydrate: string;
  sugars: string;
  fibre: string;
  protein: string;
  salt: string;
};
