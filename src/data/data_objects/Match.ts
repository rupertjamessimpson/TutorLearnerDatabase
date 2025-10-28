export interface Person {
  id: string;
  first_name: string;
  last_name: string;
}

export default interface Match {
  id: string;
  tutor: Person;
  learner: Person;
}
