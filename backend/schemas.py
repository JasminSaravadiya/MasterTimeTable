from pydantic import BaseModel
from typing import List, Optional
from datetime import time

class ConfigBase(BaseModel):
    name: str = "Master Configuration"
    start_time: time
    end_time: time
    slot_duration_minutes: int
    break_start_time: Optional[time] = None
    break_end_time: Optional[time] = None

class ConfigCreate(ConfigBase):
    pass

class ConfigOut(ConfigBase):
    id: int
    class Config:
        from_attributes = True

class BranchBase(BaseModel):
    name: str

class BranchCreate(BranchBase):
    pass

class BranchOut(BranchBase):
    id: int
    class Config:
        from_attributes = True

class SemesterBase(BaseModel):
    name: str
    branch_id: int

class SemesterCreate(SemesterBase):
    pass

class SemesterOut(SemesterBase):
    id: int
    class Config:
        from_attributes = True

class SubjectBase(BaseModel):
    name: str
    semester_id: int
    weekly_hours: float

class SubjectCreate(SubjectBase):
    pass

class SubjectOut(SubjectBase):
    id: int
    class Config:
        from_attributes = True

class FacultyBase(BaseModel):
    name: str

class FacultyCreate(FacultyBase):
    pass

class FacultyOut(FacultyBase):
    id: int
    class Config:
        from_attributes = True

class RoomBase(BaseModel):
    name: str
    capacity: int

class RoomCreate(RoomBase):
    pass

class RoomOut(RoomBase):
    id: int
    class Config:
        from_attributes = True

class AllocationBase(BaseModel):
    config_id: Optional[int] = None
    semester_id: int
    subject_id: int
    faculty_id: int
    room_id: int
    day_of_week: str
    start_time: time
    duration_minutes: int
    batch_name: Optional[str] = None

class AllocationCreate(AllocationBase):
    pass

class AllocationOut(AllocationBase):
    id: int
    class Config:
        from_attributes = True
