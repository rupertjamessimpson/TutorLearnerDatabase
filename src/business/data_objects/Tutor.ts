export interface Tutor {
  tutor_id?: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  available: boolean;
  preferences: Preferences;
  availability: Availability;
}

export interface Preferences {
  conversation: boolean;
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
}

export interface Availability {
  monday: DayAvailability;
  tuesday: DayAvailability;
  wednesday: DayAvailability;
  thursday: DayAvailability;
  friday: DayAvailability;
  saturday: DayAvailability;
}

export interface DayAvailability {
  start_time: string;
  end_time: string;
}
