export interface Person {
  id: string;
  first_name: string;
  last_name: string;
}

export default interface Match {
  match_id?: string;
  tutor: Person;
  learner: Person;
}
