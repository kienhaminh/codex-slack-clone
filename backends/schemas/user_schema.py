from pydantic import BaseModel
import datetime

# This is a Pydantic model, not an SQLAlchemy model.
# It's used for request/response validation and serialization.
class UserBase(BaseModel):
    email: str # Example field
    # Add other fields that are common for user creation and reading

class UserCreate(UserBase):
    password: str # Example field

class User(UserBase):
    id: int
    is_active: bool = True # Example field
    created_at: datetime.datetime = datetime.datetime.utcnow() # Example field

    class Config:
        orm_mode = True # For compatibility with SQLAlchemy models if needed later

# Placeholder for an SQLAlchemy User model for context, mirroring workspace_schema.py
# from sqlalchemy import Column, Integer, String, Boolean, DateTime
# from sqlalchemy.ext.declarative import declarative_base
# Base = declarative_base()
# class DBUser(Base):
# __tablename__ = "users"
# id = Column(Integer, primary_key=True, index=True)
# email = Column(String, unique=True, index=True)
# hashed_password = Column(String)
# is_active = Column(Boolean, default=True)
# created_at = Column(DateTime, default=datetime.datetime.utcnow)
