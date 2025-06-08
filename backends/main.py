from fastapi import FastAPI
from backends.apis import workspace_api # Import the router

app = FastAPI(
    title="Workspace Management API",
    description="API for managing workspaces and their members.",
    version="0.1.0",
)

# Include the workspace API router
# All routes defined in workspace_api.router will be prefixed with /api/v1
app.include_router(workspace_api.router, prefix="/api/v1/workspaces", tags=["Workspaces"])

@app.get("/")
async def read_root():
    return {"message": "Welcome to the Workspace Management API"}

# To run this application (for example, using uvicorn):
# uvicorn backends.main:app --reload --port 8000

# For development, you might want to add more configurations,
# such as database connections, CORS settings, etc.
# For now, this sets up the basic FastAPI app with the workspace router.
