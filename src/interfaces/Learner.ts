export default interface Learner {
  learner_id: number;
  first_name: string;
  last_name: string;
  available: boolean;
  level: string;
  conversation: number;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
}