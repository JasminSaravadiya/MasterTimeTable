from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from datetime import datetime, timedelta, date, time

import models
import schemas
from database import get_db, engine, Base

app = FastAPI(title="Master Timetable Generator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(models.Base.metadata.create_all)

@app.get("/")
def read_root():
    return {"message": "Welcome to Master Timetable API"}

# --- Config ---
@app.post("/api/config", response_model=schemas.ConfigOut)
async def create_config(config: schemas.ConfigCreate, db: AsyncSession = Depends(get_db)):
    db_config = models.TimetableConfig(**config.model_dump())
    db.add(db_config)
    await db.commit()
    await db.refresh(db_config)
    return db_config

@app.get("/api/config", response_model=List[schemas.ConfigOut])
async def read_configs(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.TimetableConfig))
    return result.scalars().all()

# --- Branch ---
@app.post("/api/branches", response_model=schemas.BranchOut)
async def create_branch(branch: schemas.BranchCreate, db: AsyncSession = Depends(get_db)):
    db_branch = models.Branch(**branch.model_dump())
    db.add(db_branch)
    await db.commit()
    await db.refresh(db_branch)
    return db_branch

@app.get("/api/branches", response_model=List[schemas.BranchOut])
async def read_branches(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Branch))
    return result.scalars().all()

# --- Semester ---
@app.post("/api/semesters", response_model=schemas.SemesterOut)
async def create_semester(semester: schemas.SemesterCreate, db: AsyncSession = Depends(get_db)):
    db_semester = models.Semester(**semester.model_dump())
    db.add(db_semester)
    await db.commit()
    await db.refresh(db_semester)
    return db_semester

@app.get("/api/semesters", response_model=List[schemas.SemesterOut])
async def read_semesters(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Semester))
    return result.scalars().all()

# --- Subject ---
@app.post("/api/subjects", response_model=schemas.SubjectOut)
async def create_subject(subject: schemas.SubjectCreate, db: AsyncSession = Depends(get_db)):
    db_subject = models.Subject(**subject.model_dump())
    db.add(db_subject)
    await db.commit()
    await db.refresh(db_subject)
    return db_subject

@app.get("/api/subjects", response_model=List[schemas.SubjectOut])
async def read_subjects(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Subject))
    return result.scalars().all()

# --- Faculty ---
@app.post("/api/faculties", response_model=schemas.FacultyOut)
async def create_faculty(faculty: schemas.FacultyCreate, db: AsyncSession = Depends(get_db)):
    db_faculty = models.Faculty(**faculty.model_dump())
    db.add(db_faculty)
    await db.commit()
    await db.refresh(db_faculty)
    return db_faculty

@app.get("/api/faculties", response_model=List[schemas.FacultyOut])
async def read_faculties(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Faculty))
    return result.scalars().all()

# --- Room ---
@app.post("/api/rooms", response_model=schemas.RoomOut)
async def create_room(room: schemas.RoomCreate, db: AsyncSession = Depends(get_db)):
    db_room = models.Room(**room.model_dump())
    db.add(db_room)
    await db.commit()
    await db.refresh(db_room)
    return db_room

@app.get("/api/rooms", response_model=List[schemas.RoomOut])
async def read_rooms(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Room))
    return result.scalars().all()

# --- Mappings (Screen 2) ---
from pydantic import BaseModel

class FacultyMapping(BaseModel):
    semester_id: int
    faculty_id: int

@app.post("/api/mappings/faculty")
async def map_faculty(mapping: FacultyMapping, db: AsyncSession = Depends(get_db)):
    db_map = models.SemesterFacultyMap(semester_id=mapping.semester_id, faculty_id=mapping.faculty_id)
    db.add(db_map)
    await db.commit()
    return {"status": "success"}

@app.get("/api/mappings/faculty/{semester_id}")
async def get_mapped_faculties(semester_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.Faculty).join(models.SemesterFacultyMap).filter(models.SemesterFacultyMap.semester_id == semester_id)
    )
    return result.scalars().all()

class RoomMapping(BaseModel):
    semester_id: int
    room_id: int

@app.post("/api/mappings/room")
async def map_room(mapping: RoomMapping, db: AsyncSession = Depends(get_db)):
    db_map = models.SemesterRoomMap(semester_id=mapping.semester_id, room_id=mapping.room_id)
    db.add(db_map)
    await db.commit()
    return {"status": "success"}

@app.get("/api/mappings/room/{semester_id}")
async def get_mapped_rooms(semester_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.Room).join(models.SemesterRoomMap).filter(models.SemesterRoomMap.semester_id == semester_id)
    )
    return result.scalars().all()

# --- Allocations & Collision Logic (Screen 3) ---
def add_minutes(t: time, mins: int) -> time:
    dt = datetime.combine(date.today(), t) + timedelta(minutes=mins)
    return dt.time()

def check_overlap(start1: time, end1: time, start2: time, end2: time) -> bool:
    return max(start1, start2) < min(end1, end2)

@app.post("/api/allocations", response_model=schemas.AllocationOut)
async def create_allocation(allocation: schemas.AllocationCreate, db: AsyncSession = Depends(get_db)):
    new_start = allocation.start_time
    new_end = add_minutes(new_start, allocation.duration_minutes)
    
    # Fetch all allocations for the same day
    result = await db.execute(select(models.Allocation).filter(models.Allocation.day_of_week == allocation.day_of_week))
    existing_allocations = result.scalars().all()
    
    for ext in existing_allocations:
        ext_start = ext.start_time
        ext_end = add_minutes(ext_start, ext.duration_minutes)
        
        if check_overlap(new_start, new_end, ext_start, ext_end):
            # Same faculty?
            if ext.faculty_id == allocation.faculty_id:
                raise HTTPException(status_code=400, detail="Faculty collision detected!")
            # Same room?
            if ext.room_id == allocation.room_id:
                raise HTTPException(status_code=400, detail="Room collision detected!")
            # Same semester (batch)? Wait, different batches can share a sem but not same batch
            if ext.semester_id == allocation.semester_id:
                if ext.batch_name == allocation.batch_name or not allocation.batch_name or not ext.batch_name:
                    raise HTTPException(status_code=400, detail="Semester/Batch collision detected!")

    db_allocation = models.Allocation(**allocation.model_dump())
    db.add(db_allocation)
    await db.commit()
    await db.refresh(db_allocation)
    return db_allocation

@app.get("/api/allocations", response_model=List[schemas.AllocationOut])
async def read_allocations(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Allocation))
    return result.scalars().all()

# --- Export Endpoint (Screen 4) ---
# For now, it returns all allocations with joined data
@app.get("/api/export")
async def get_export_data(db: AsyncSession = Depends(get_db)):
    # Simple nested fetch or flat fetch
    allocations = (await db.execute(select(models.Allocation))).scalars().all()
    # Pydantic will serialize relationships if set up, or we can just return IDs for now
    # Since we need names, we would fetch related or do a join request.
    return allocations
