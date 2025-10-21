export interface Learner {
  learner_id?: string;
  first_name: string;
  last_name: string;
  available: boolean;
  phone: string;
  email: string;
  level: string;
  conversation: string;
  availability: Availability;
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