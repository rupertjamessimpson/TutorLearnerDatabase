export interface Learner {
  id: string;
  first_name: string;
  last_name: string;
  gender: string;
  available: boolean;
  phone: string;
  email: string;
  level: string;
  class: string;
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