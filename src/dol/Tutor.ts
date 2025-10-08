export default interface Tutor {
  tutor_id: number;
  first_name: string;
  last_name: string;
  available: boolean;
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
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
}