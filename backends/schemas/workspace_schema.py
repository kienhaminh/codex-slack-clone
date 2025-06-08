from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import datetime

# Placeholder for Base - In a real application, this would likely be in a shared database.py
Base = declarative_base()

class Workspace(Base):
    __tablename__ = "workspaces"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))  # Assuming a 'users' table exists
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships (optional, but good practice)
    # owner = relationship("User", back_populates="owned_workspaces") # Assuming User model has 'owned_workspaces'
    # members = relationship("WorkspaceMember", back_populates="workspace")

class WorkspaceMember(Base):
    __tablename__ = "workspace_members"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id"))
    user_id = Column(Integer, ForeignKey("users.id")) # Assuming a 'users' table exists
    role = Column(String, default="member")  # e.g., 'admin', 'editor', 'viewer'

    # Relationships (optional, but good practice)
    # workspace = relationship("Workspace", back_populates="members")
    # user = relationship("User", back_populates="workspace_memberships") # Assuming User model has 'workspace_memberships'

# Example of how User table might look (for context, not to be created here)
# class User(Base):
#     __tablename__ = "users"
#     id = Column(Integer, primary_key=True)
#     # ... other user fields
#     owned_workspaces = relationship("Workspace", back_populates="owner")
#     workspace_memberships = relationship("WorkspaceMember", back_populates="user")
