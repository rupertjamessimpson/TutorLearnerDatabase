export interface DayAvailability {
  start_time: string;
  end_time: string;
}

export interface Availability {
  monday: DayAvailability;
  tuesday: DayAvailability;
  wednesday: DayAvailability;
  thursday: DayAvailability;
  friday: DayAvailability;
  saturday: DayAvailability;
}

export interface LearnerFormErrors {
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  level?: string;
  availability?: string;
}

export interface LearnerForm {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  level: string;
  availability: Availability;
}