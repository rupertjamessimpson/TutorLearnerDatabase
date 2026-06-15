import { Tutor } from "../../data/data_objects/Tutor";

function preferencesToString(tutor: Tutor): string {
  const prefs: string[] = [];

  if (tutor.preferences.esl_novice)
    prefs.push("ESL Novice");

  if (tutor.preferences.esl_beginner)
    prefs.push("ESL Beginner");

  if (tutor.preferences.esl_intermediate)
    prefs.push("ESL Intermediate");

  if (tutor.preferences.citizenship)
    prefs.push("Citizenship");

  if (tutor.preferences.sped_ela)
    prefs.push("Special Education ELA");

  if (tutor.preferences.basic_math)
    prefs.push("Basic Math");

  if (tutor.preferences.hiset_math)
    prefs.push("HiSET Math");

  if (tutor.preferences.basic_reading)
    prefs.push("Basic Reading");

  if (tutor.preferences.hiset_reading)
    prefs.push("HiSET Reading");

  if (tutor.preferences.basic_writing)
    prefs.push("Basic Writing");

  if (tutor.preferences.hiset_writing)
    prefs.push("HiSET Writing");

  return prefs.join(", ");
}

export default preferencesToString;