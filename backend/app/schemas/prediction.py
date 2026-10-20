from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, StrictInt

Binary = Annotated[StrictInt, Field(ge=0, le=1)]


class PredictionRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)

    Age: Annotated[StrictInt, Field(ge=60, le=90)]
    Gender: Binary
    Ethnicity: Annotated[StrictInt, Field(ge=0, le=3)]
    EducationLevel: Annotated[StrictInt, Field(ge=0, le=3)]
    BMI: Annotated[float, Field(ge=15.0, le=40.0)]
    Smoking: Binary
    AlcoholConsumption: Annotated[float, Field(ge=0.0, le=20.0)]
    PhysicalActivity: Annotated[float, Field(ge=0.0, le=10.0)]
    DietQuality: Annotated[float, Field(ge=0.0, le=10.0)]
    SleepQuality: Annotated[float, Field(ge=4.0, le=10.0)]
    FamilyHistoryAlzheimers: Binary
    CardiovascularDisease: Binary
    Diabetes: Binary
    Depression: Binary
    HeadInjury: Binary
    Hypertension: Binary
    SystolicBP: Annotated[StrictInt, Field(ge=90, le=180)]
    DiastolicBP: Annotated[StrictInt, Field(ge=60, le=120)]
    CholesterolTotal: Annotated[float, Field(ge=150.0, le=300.0)]
    CholesterolLDL: Annotated[float, Field(ge=50.0, le=200.0)]
    CholesterolHDL: Annotated[float, Field(ge=20.0, le=100.0)]
    CholesterolTriglycerides: Annotated[float, Field(ge=50.0, le=400.0)]
    MMSE: Annotated[float, Field(ge=0.0, le=30.0)]
    FunctionalAssessment: Annotated[float, Field(ge=0.0, le=10.0)]
    MemoryComplaints: Binary
    BehavioralProblems: Binary
    ADL: Annotated[float, Field(ge=0.0, le=10.0)]
    Confusion: Binary
    Disorientation: Binary
    PersonalityChanges: Binary
    DifficultyCompletingTasks: Binary
    Forgetfulness: Binary


class PredictionData(BaseModel):
    probability: Annotated[float, Field(ge=0, le=100)]
    prediction: int
    status: str = "success"


class PredictionResponse(BaseModel):
    success: bool = True
    data: PredictionData


class ErrorBody(BaseModel):
    code: str
    message: str


class ErrorResponse(BaseModel):
    success: bool = False
    error: ErrorBody
