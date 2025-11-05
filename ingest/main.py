from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import os

from sqlalchemy import create_engine, Column, String, Integer, DateTime, Float, JSON
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@postgres:5432/postgres")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    edge_node = Column(String)
    client_ip = Column(String)
    api_key = Column(String)
    path = Column(String)
    method = Column(String)
    status = Column(Integer)
    decision = Column(String)
    reason = Column(String)
    score = Column(Float)
    fingerprint = Column(JSON)

Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "OK"}

class Fingerprint(BaseModel):
    ua: Optional[str] = None
    header_entropy: Optional[float] = None

class EventCreate(BaseModel):
    timestamp: Optional[datetime] = None
    edge_node: str
    client_ip: str
    api_key: Optional[str] = None
    path: str
    method: str
    status: int
    decision: str
    reason: Optional[str] = None
    score: Optional[float] = None
    fingerprint: Optional[Fingerprint] = None

@app.post("/v1/events")
def create_events(events: List[EventCreate]):
    db = SessionLocal()
    try:
        db_events = []
        for event in events:
            db_event = Event(**event.model_dump())
            db_events.append(db_event)
        db.add_all(db_events)
        db.commit()
        return {"message": f"Successfully ingested {len(db_events)} events"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.get("/v1/events")
def get_events(from_time: Optional[datetime] = None, limit: int = 100):
    db = SessionLocal()
    try:
        query = db.query(Event)
        if from_time:
            query = query.filter(Event.timestamp >= from_time)
        events = query.order_by(Event.timestamp.desc()).limit(limit).all()
        return events
    finally:
        db.close()

