export type Profile = {
  id: string;
  username: string;
  goal: string;
  get_goal_display: string;
  activity_level: string;
  get_activity_level_display: string;
  sex: "M" | "F";
  get_sex_display: string;
  weight: string;
  height: string;
  date_of_birth: string;
  is_private: boolean;
  bmi: number;
  bmr: number;
  tdee: number;
  created_at: string;
  updated_at: string;
  image: string;
};
