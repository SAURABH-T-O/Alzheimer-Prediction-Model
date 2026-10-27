export const yesNo = [{ value: '0', label: 'No' }, { value: '1', label: 'Yes' }];

export const predictionSections = [
  { id: 'personal', label: 'Personal Information', description: 'Basic information used by the model. This model does not include occupation or marital status.', fields: [
    { name: 'Age', label: 'Age', help: 'Enter your age in years.', min: 60, max: 90, step: 1 },
    { name: 'Gender', label: 'Gender', help: 'Select the option recorded in your medical data.', options: [{ value: '0', label: 'Male' }, { value: '1', label: 'Female' }] },
    { name: 'Ethnicity', label: 'Ethnicity', help: 'Select the category used in the assessment dataset.', options: [{ value: '0', label: 'Caucasian' }, { value: '1', label: 'African American' }, { value: '2', label: 'Asian' }, { value: '3', label: 'Other' }] },
    { name: 'EducationLevel', label: 'Education level', help: 'Select your highest completed education level.', options: [{ value: '0', label: 'No formal education' }, { value: '1', label: 'High school' }, { value: '2', label: "Bachelor's degree" }, { value: '3', label: 'Higher education' }] },
    { name: 'BMI', label: 'Body mass index (BMI)', help: 'A number that relates height and weight. Ask a healthcare professional if unsure.', min: 15, max: 40, step: 0.01 }
  ]},
  { id: 'medical', label: 'Medical History', description: 'Please answer based on a diagnosis from a healthcare professional.', fields: [
    { name: 'FamilyHistoryAlzheimers', label: "Family history of Alzheimer's disease", help: 'Has a close family member been diagnosed with Alzheimer’s disease?', options: yesNo },
    { name: 'Diabetes', label: 'Diabetes', help: 'Has a healthcare professional diagnosed diabetes?', options: yesNo },
    { name: 'Hypertension', label: 'High blood pressure', help: 'Has a healthcare professional diagnosed high blood pressure?', options: yesNo },
    { name: 'CardiovascularDisease', label: 'Cardiovascular disease', help: 'Includes heart and blood-vessel disease diagnosed by a healthcare professional.', options: yesNo },
    { name: 'Depression', label: 'Depression', help: 'Has a healthcare professional diagnosed depression?', options: yesNo },
    { name: 'HeadInjury', label: 'History of head injury', help: 'Select yes if there has been a significant head injury.', options: yesNo },
    { name: 'SystolicBP', label: 'Systolic blood pressure', help: 'The top number in a blood-pressure reading.', min: 90, max: 180, step: 1 },
    { name: 'DiastolicBP', label: 'Diastolic blood pressure', help: 'The bottom number in a blood-pressure reading.', min: 60, max: 120, step: 1 },
    { name: 'CholesterolTotal', label: 'Total cholesterol', help: 'Use the value from a recent laboratory report.', min: 150, max: 300, step: 0.01 },
    { name: 'CholesterolLDL', label: 'LDL cholesterol', help: 'Use the value from a recent laboratory report.', min: 50, max: 200, step: 0.01 },
    { name: 'CholesterolHDL', label: 'HDL cholesterol', help: 'Use the value from a recent laboratory report.', min: 20, max: 100, step: 0.01 },
    { name: 'CholesterolTriglycerides', label: 'Triglycerides', help: 'Use the value from a recent laboratory report.', min: 50, max: 400, step: 0.01 }
  ]},
  { id: 'cognitive', label: 'Cognitive Health', description: 'Use information from a clinician or a recent cognitive assessment whenever possible.', fields: [
    { name: 'MMSE', label: 'Mini-Mental State Examination score', help: 'MMSE is a 30-point cognitive screening score. Enter the score from an assessment.', min: 0, max: 30, step: 0.01 },
    { name: 'FunctionalAssessment', label: 'Functional assessment score', help: 'Enter the score from the clinical assessment, from 0 to 10.', min: 0, max: 10, step: 0.01 },
    { name: 'ADL', label: 'Daily activity score', help: 'This measures ability to manage daily activities. Enter the assessment score from 0 to 10.', min: 0, max: 10, step: 0.01 },
    { name: 'MemoryComplaints', label: 'Memory concerns', help: 'Have memory concerns been reported?', options: yesNo },
    { name: 'BehavioralProblems', label: 'Behavioural concerns', help: 'Have behavioural concerns been reported?', options: yesNo },
    { name: 'Confusion', label: 'Confusion', help: 'Has confusion been reported?', options: yesNo },
    { name: 'Disorientation', label: 'Disorientation', help: 'Has difficulty knowing time, place, or situation been reported?', options: yesNo },
    { name: 'PersonalityChanges', label: 'Personality changes', help: 'Have notable personality changes been reported?', options: yesNo },
    { name: 'DifficultyCompletingTasks', label: 'Difficulty completing familiar tasks', help: 'Has difficulty completing familiar tasks been reported?', options: yesNo },
    { name: 'Forgetfulness', label: 'Frequent forgetfulness', help: 'Has frequent forgetfulness been reported?', options: yesNo }
  ]},
  { id: 'lifestyle', label: 'Lifestyle', description: 'Use the scale values from the person’s assessment record where possible.', fields: [
    { name: 'PhysicalActivity', label: 'Physical activity score', help: 'Enter the assessment score from 0 to 10.', min: 0, max: 10, step: 0.01 },
    { name: 'Smoking', label: 'Smoking', help: 'Select yes if the person smokes.', options: yesNo },
    { name: 'AlcoholConsumption', label: 'Alcohol consumption', help: 'Enter the assessment value from 0 to 20.', min: 0, max: 20, step: 0.01 },
    { name: 'SleepQuality', label: 'Sleep quality score', help: 'Enter the assessment score from 4 to 10.', min: 4, max: 10, step: 0.01 },
    { name: 'DietQuality', label: 'Diet quality score', help: 'Enter the assessment score from 0 to 10.', min: 0, max: 10, step: 0.01 }
  ]}
];

export const allPredictionFields = predictionSections.flatMap(section => section.fields);
