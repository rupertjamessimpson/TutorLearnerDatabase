export interface Filters {
  available: boolean;
  esl_novice: boolean;
  esl_beginner: boolean;
  esl_intermediate: boolean;
  citizenship: boolean;
  sped_ela: boolean;
  basic_math: boolean;
  hiset_math: boolean;
  basic_reading: boolean;
  hiset_reading: boolean;
  basic_writing: boolean;
  hiset_writing: boolean;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
}

export interface TutorFilters extends Filters {
  conversation: boolean;
}

export interface LearnerFilters extends Filters {
  not_in_class: boolean;
}

export const preferenceKeys = [
  "conversation",
  "esl_novice",
  "esl_beginner",
  "esl_intermediate",
  "citizenship",
  "sped_ela",
  "basic_math",
  "hiset_math",
  "basic_reading",
  "hiset_reading",
  "basic_writing",
  "hiset_writing",
] as const;

export type PreferenceKey = typeof preferenceKeys[number];

export const levelKeys: (keyof LearnerFilters)[] = [
  "esl_novice",
  "esl_beginner",
  "esl_intermediate",
  "citizenship",
  "sped_ela",
  "basic_math",
  "hiset_math",
  "basic_reading",
  "hiset_reading",
  "basic_writing",
  "hiset_writing",
];

export const dayKeys = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

export type DayKey = typeof dayKeys[number];