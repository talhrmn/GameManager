import logging

from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm

from app.api.dependencies import get_user_service, get_auth_service, get_statistics_service
from app.core.exceptions import AuthenticationException
from app.core.security import verify_password
from app.schemas.auth import LoginResponse
from app.schemas.user import UserInput
from app.services.auth_service import AuthService
from app.services.statistics_service import StatisticsService
from app.services.user_service import UserService

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/signup", response_model=LoginResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
        user_data: UserInput,
        user_service: UserService = Depends(get_user_service),
        statistics_service: StatisticsService = Depends(get_statistics_service),
        auth_service: AuthService = Depends(get_auth_service)
) -> LoginResponse:
    """
    Register a new user and return authentication token.
    
    Args:
        user_data: User registration data
        user_service: Service for user operations
        auth_service: Service for authentication operations
        
    Returns:
        LoginResponse: Authentication token and type
    """
    user = await user_service.create_user(user_data=user_data)
    await statistics_service.create_user_stats(user.id)
    return auth_service.login_user(user.id)


@router.post("/login", response_model=LoginResponse)
async def login(
        form_data: OAuth2PasswordRequestForm = Depends(),
        user_service: UserService = Depends(get_user_service),
        auth_service: AuthService = Depends(get_auth_service)
) -> LoginResponse:
    """
    Authenticate user and return authentication token.
    
    Args:
        form_data: Login form data containing username and password
        user_service: Service for user operations
        auth_service: Service for authentication operations
        
    Returns:
        LoginResponse: Authentication token and type
    """
    # Get user by username
    user = await user_service.get_auth_user(form_data.username)

    # Verify credentials
    if not user or not verify_password(form_data.password, user.password_hash):
        raise AuthenticationException(
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # Return auth token
    return auth_service.login_user(user.id)
