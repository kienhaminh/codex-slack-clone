from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
import datetime
from typing import Optional # For optional fields in response

# Pydantic model for request body validation
class WorkspaceCreateRequest(BaseModel):
    name: str
    owner_id: int

# Pydantic model for response
class WorkspaceResponse(BaseModel):
    id: int
    name: str
    owner_id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime

# Pydantic model for workspace member (for context, might be used in other endpoints)
class WorkspaceMemberResponse(BaseModel):
    id: int
    workspace_id: int
    user_id: int
    role: str


router = APIRouter()

# Simulated database (in-memory)
_workspaces_db = []
_workspace_members_db = []
_next_workspace_id = 1
_next_member_id = 1

def create_workspace_in_db(name: str, owner_id: int) -> dict:
    """Simulates creating a workspace in the database."""
    global _next_workspace_id
    now = datetime.datetime.utcnow()
    new_workspace = {
        "id": _next_workspace_id,
        "name": name,
        "owner_id": owner_id,
        "created_at": now,
        "updated_at": now,
    }
    _workspaces_db.append(new_workspace)
    _next_workspace_id += 1
    return new_workspace

def add_user_to_workspace_in_db(workspace_id: int, user_id: int, role: str) -> dict:
    """Simulates adding a user to a workspace in the database."""
    global _next_member_id
    # In a real DB, you'd check if user and workspace exist
    # and if the user is already a member.
    new_member = {
        "id": _next_member_id,
        "workspace_id": workspace_id,
        "user_id": user_id,
        "role": role,
    }
    _workspace_members_db.append(new_member)
    _next_member_id += 1
    return new_member

@router.post("/workspaces", response_model=WorkspaceResponse, status_code=status.HTTP_201_CREATED)
async def create_workspace(workspace_data: WorkspaceCreateRequest):
    """
    Creates a new workspace and adds the owner as an admin member.
    """
    # Simulate database interaction
    # In a real app, you'd also check if owner_id corresponds to an existing user.
    # For now, we assume owner_id is valid.

    created_workspace_data = create_workspace_in_db(
        name=workspace_data.name, owner_id=workspace_data.owner_id
    )

    # Add the owner as an admin member to the new workspace
    add_user_to_workspace_in_db(
        workspace_id=created_workspace_data["id"],
        user_id=workspace_data.owner_id,
        role="admin",  # Owner is admin by default
    )

    # Convert dict to WorkspaceResponse Pydantic model
    # This ensures the response matches the defined schema
    return WorkspaceResponse(**created_workspace_data)


# Pydantic models for user invitation
class InviteUserRequest(BaseModel):
    user_id: int
    role: str = "member"  # Default role if not specified

class InviteUserResponse(BaseModel):
    message: str
    invitation_id: Optional[int] = None # Optional: can include invitation id
    status: Optional[str] = None      # Optional: can include invitation status


# Pydantic models for listing user's workspaces
class WorkspaceMemberInfo(BaseModel):
    role: str
    # Can add other membership-specific details here, e.g., joined_at

class UserWorkspaceResponse(WorkspaceResponse): # Extends WorkspaceResponse
    membership: WorkspaceMemberInfo


# Simulated DB for invitations
_invitations_db = []
_next_invitation_id = 1

# Global state for user's active workspace
_user_active_workspaces = {} # Stores {user_id: workspace_id}

# Pydantic model for Switch Workspace Response
class SwitchWorkspaceResponse(BaseModel):
    message: str
    active_workspace_id: int

# Simulated helper functions for GET /my/workspaces
def get_user_workspace_ids_from_db(user_id: int) -> list[int]:
    """Simulates fetching workspace IDs a user is a member of."""
    return list(set( # Use set to avoid duplicate workspace_ids if a user has multiple roles (though not currently possible)
        member["workspace_id"]
        for member in _workspace_members_db
        if member["user_id"] == user_id
    ))

def get_workspace_details_from_db(workspace_id: int) -> Optional[dict]:
    """Simulates fetching workspace details by its ID."""
    for ws in _workspaces_db:
        if ws["id"] == workspace_id:
            return ws
    return None

def get_user_role_in_workspace_from_db(user_id: int, workspace_id: int) -> Optional[str]:
    """Simulates fetching a user's role in a specific workspace."""
    for member in _workspace_members_db:
        if member["user_id"] == user_id and member["workspace_id"] == workspace_id:
            return member["role"]
    return None

def remove_user_from_workspace_in_db(user_id_to_remove: int, workspace_id: int) -> bool:
    """Simulates removing a user from a workspace's member list in the database."""
    global _workspace_members_db
    initial_len = len(_workspace_members_db)
    # Filter out the member to be removed
    _workspace_members_db = [
        member for member in _workspace_members_db
        if not (member["user_id"] == user_id_to_remove and member["workspace_id"] == workspace_id)
    ]
    # Return True if a member was removed, False otherwise
    return len(_workspace_members_db) < initial_len

def delete_workspace_from_db(workspace_id_to_delete: int) -> bool:
    """
    Simulates deleting a workspace and all its associated data from the database.
    - Removes workspace from _workspaces_db.
    - Removes all members from _workspace_members_db.
    - Clears active workspace settings from _user_active_workspaces.
    - Clears pending invitations from _invitations_db.
    Returns True if the workspace was found and removed, False otherwise.
    """
    global _workspaces_db, _workspace_members_db, _user_active_workspaces, _invitations_db

    # Check if workspace exists
    workspace_exists = any(ws["id"] == workspace_id_to_delete for ws in _workspaces_db)
    if not workspace_exists:
        return False

    # Remove workspace from _workspaces_db
    _workspaces_db = [ws for ws in _workspaces_db if ws["id"] != workspace_id_to_delete]

    # Remove all members associated with this workspace_id from _workspace_members_db
    _workspace_members_db = [
        member for member in _workspace_members_db if member["workspace_id"] != workspace_id_to_delete
    ]

    # Remove any active workspace setting for this workspace from _user_active_workspaces
    users_to_update = [
        user_id for user_id, active_ws_id in _user_active_workspaces.items()
        if active_ws_id == workspace_id_to_delete
    ]
    for user_id in users_to_update:
        del _user_active_workspaces[user_id]
        print(f"Cleared active workspace setting for user {user_id} as workspace {workspace_id_to_delete} was deleted.")


    # Remove any pending invitations for this workspace from _invitations_db
    _invitations_db = [
        inv for inv in _invitations_db if inv["workspace_id"] != workspace_id_to_delete
    ]

    print(f"Workspace {workspace_id_to_delete} and all associated data deleted from simulated DB.")
    return True

# Simulated helper functions
def check_user_permission(user_id_making_request: int, workspace_id: int, permission: str) -> bool:
    """Simulates checking if a user has a specific permission in a workspace."""
    # In a real app, this would query the database (e.g., WorkspaceMember table)
    # and potentially check against a roles/permissions system.
    print(f"Simulating permission check for user {user_id_making_request} in workspace {workspace_id} for permission '{permission}'")
    # For now, always grant permission for simulation purposes
    if user_id_making_request == 1 and permission == "invite_member": # Example: user 1 can always invite
        return True
    # Placeholder: check if workspace exists
    if not any(ws['id'] == workspace_id for ws in _workspaces_db):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Workspace with id {workspace_id} not found.")
    return True # Default to True for simulation

def is_user_member(user_id: int, workspace_id: int) -> bool:
    """Simulates checking if a user is already a member of the workspace."""
    print(f"Simulating check: Is user {user_id} already a member of workspace {workspace_id}?")
    return any(
        member["user_id"] == user_id and member["workspace_id"] == workspace_id
        for member in _workspace_members_db
    )

def create_invitation_in_db(workspace_id: int, invited_user_id: int, inviting_user_id: int, role: str) -> dict:
    """Simulates creating an invitation record in the database."""
    global _next_invitation_id
    now = datetime.datetime.utcnow()
    new_invitation = {
        "invitation_id": _next_invitation_id,
        "workspace_id": workspace_id,
        "invited_user_id": invited_user_id,
        "inviting_user_id": inviting_user_id,
        "role": role,
        "status": "pending", # Initial status
        "created_at": now,
        "updated_at": now,
    }
    _invitations_db.append(new_invitation)
    _next_invitation_id += 1
    print(f"Simulating: Invitation record created: {new_invitation}")
    return new_invitation

@router.post("/{workspace_id}/invitations", response_model=InviteUserResponse, status_code=status.HTTP_201_CREATED)
async def invite_user_to_workspace(workspace_id: int, invitation_data: InviteUserRequest):
    """
    Invites a user to a workspace.
    """
    requesting_user_id = 1  # Placeholder for the user making the request

    # 1. Simulate Authorization Check
    # In a real app, get requesting_user_id from auth token
    if not check_user_permission(requesting_user_id, workspace_id, permission="invite_member"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to invite users to this workspace.",
        )

    # 2. Simulate checking if workspace exists (partially done in check_user_permission)
    # More robust check could be here if needed.
    if not any(ws['id'] == workspace_id for ws in _workspaces_db):
         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Workspace {workspace_id} not found.")

    # 3. Simulate checking if the user is already a member
    if is_user_member(user_id=invitation_data.user_id, workspace_id=workspace_id):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"User {invitation_data.user_id} is already a member of workspace {workspace_id}.",
        )

    # 4. Simulate checking if user to be invited exists (Optional, depends on system design)
    # For now, we assume user_id from request is valid.
    # if not get_user_from_db(invitation_data.user_id):
    #     raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User {invitation_data.user_id} to be invited not found.")


    # 5. Simulate Invitation Logic
    invitation_record = create_invitation_in_db(
        workspace_id=workspace_id,
        invited_user_id=invitation_data.user_id,
        inviting_user_id=requesting_user_id, # User who sent the invite
        role=invitation_data.role,
    )

    # Log the simulated sending of an invitation
    print(
        f"Simulating: Sending invitation to user {invitation_data.user_id} "
        f"for workspace {workspace_id} with role {invitation_data.role}."
    )

    return InviteUserResponse(
        message=f"Invitation successfully sent to user {invitation_data.user_id} for workspace {workspace_id}.",
        invitation_id=invitation_record["invitation_id"],
        status=invitation_record["status"]
    )

from fastapi import Query # Import Query for GET /my/workspaces
from typing import List # Import List for response model

@router.get("/my/workspaces", response_model=List[UserWorkspaceResponse])
async def get_my_workspaces(user_id: Optional[int] = Query(None)):
    """
    Retrieves a list of workspaces the current user is a member of,
    including their role in each workspace.
    """
    # Simulate identifying the current user. In a real app, this would come from an auth token.
    current_user_id = user_id if user_id is not None else 1 # Default to user_id 1 if not provided

    user_workspaces_data = []

    workspace_ids = get_user_workspace_ids_from_db(user_id=current_user_id)

    if not workspace_ids:
        return [] # Return empty list if user is not part of any workspaces

    for ws_id in workspace_ids:
        workspace_details = get_workspace_details_from_db(workspace_id=ws_id)
        user_role = get_user_role_in_workspace_from_db(user_id=current_user_id, workspace_id=ws_id)

        if workspace_details and user_role:
            # Construct WorkspaceMemberInfo
            member_info = WorkspaceMemberInfo(role=user_role)

            # Construct UserWorkspaceResponse by unpacking workspace_details and adding membership
            user_workspace_response_data = {
                **workspace_details, # Unpack all fields from workspace_details
                "membership": member_info,
            }
            user_workspaces_data.append(UserWorkspaceResponse(**user_workspace_response_data))
        else:
            # This case should ideally not happen if data is consistent
            # Log a warning or handle as an error if necessary
            print(f"Warning: Could not find details or role for workspace_id {ws_id} for user_id {current_user_id}")


    return user_workspaces_data

@router.post("/my/workspaces/{workspace_id}/switch", response_model=SwitchWorkspaceResponse)
async def switch_active_workspace(workspace_id: int, user_id: Optional[int] = Query(None)):
    """
    Allows a user to switch their active workspace.
    """
    # Simulate identifying the current user. In a real app, this would come from an auth token.
    current_user_id = user_id if user_id is not None else 1 # Default to user_id 1

    # 1. Check if the target workspace exists
    target_workspace = get_workspace_details_from_db(workspace_id=workspace_id)
    if not target_workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workspace with id {workspace_id} not found.",
        )

    # 2. Authorization: Check if the user is a member of the target workspace
    if not is_user_member(user_id=current_user_id, workspace_id=workspace_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"User {current_user_id} is not a member of workspace {workspace_id}. Access denied.",
        )

    # 3. Simulate Switch Logic: Update the user's active workspace
    _user_active_workspaces[current_user_id] = workspace_id
    print(f"User {current_user_id} switched active workspace to {workspace_id}")

    return SwitchWorkspaceResponse(
        message=f"Successfully switched active workspace to {workspace_id}.",
        active_workspace_id=workspace_id,
    )

from fastapi import Response # Required for 204 No Content response

@router.delete("/workspaces/{workspace_id}/members/{user_id_to_remove}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_workspace_member(
    workspace_id: int,
    user_id_to_remove: int,
    requesting_user_id: Optional[int] = Query(1) # Default to user 1 for simulation
):
    """
    Removes a user from a workspace.
    Admins can remove any non-owner member. Users can remove themselves.
    Owners cannot be removed via this endpoint.
    """
    # 1. Fetch workspace details
    workspace_details = get_workspace_details_from_db(workspace_id)
    if not workspace_details:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Workspace {workspace_id} not found.")

    # 2. Check if the user to remove is the owner
    if user_id_to_remove == workspace_details["owner_id"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Owner cannot be removed. Please delete the workspace or transfer ownership first.",
        )

    # 3. Authorization Logic
    requesting_user_role = get_user_role_in_workspace_from_db(requesting_user_id, workspace_id)

    can_remove = False
    if requesting_user_role == "admin":
        can_remove = True
    elif requesting_user_id == user_id_to_remove:
        can_remove = True # User removing themselves

    if not can_remove:
        # Before raising 403, ensure the requesting user is at least a member or has some role.
        # If requesting_user_role is None, it means they are not part of the workspace.
        if requesting_user_role is None:
             raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Requesting user {requesting_user_id} is not a member of workspace {workspace_id}.")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"User {requesting_user_id} with role '{requesting_user_role}' does not have permission to remove user {user_id_to_remove}.",
        )

    # 4. Check if the user_id_to_remove is actually a member
    if not is_user_member(user_id_to_remove, workspace_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {user_id_to_remove} is not a member of workspace {workspace_id}.",
        )

    # 5. Simulate Database Interaction (Membership Removal)
    if remove_user_from_workspace_in_db(user_id_to_remove, workspace_id):
        print(f"User {user_id_to_remove} successfully removed from workspace {workspace_id} by user {requesting_user_id}.")
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    else:
        # This case should ideally be caught by the is_user_member check earlier,
        # but as a safeguard for the remove_user_from_workspace_in_db logic:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, # Or 404 if we consider it "not found for removal"
            detail=f"Failed to remove user {user_id_to_remove} from workspace {workspace_id}. Member not found in DB for removal process.",
        )

@router.delete("/workspaces/{workspace_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workspace(
    workspace_id: int,
    requesting_user_id: Optional[int] = Query(1) # Default to user 1 for simulation
):
    """
    Deletes a workspace. Only the workspace owner can perform this action.
    This will also remove all associated members, invitations, and active workspace settings.
    """
    # 1. Fetch workspace details
    workspace_details = get_workspace_details_from_db(workspace_id)
    if not workspace_details:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Workspace {workspace_id} not found.")

    # 2. Authorization Logic: Only the owner can delete the workspace
    if requesting_user_id != workspace_details["owner_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"User {requesting_user_id} is not the owner of workspace {workspace_id}. Permission denied.",
        )

    # 3. Simulate Database Interaction (Deletion)
    if delete_workspace_from_db(workspace_id):
        print(f"Workspace {workspace_id} successfully deleted by owner {requesting_user_id}.")
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    else:
        # This case should ideally be caught by the get_workspace_details_from_db check earlier,
        # but as a safeguard for the delete_workspace_from_db logic:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete workspace {workspace_id}. Workspace might have been removed by another process.",
        )
