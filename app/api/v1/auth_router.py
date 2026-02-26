from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app import crud, database, models, schemas
from app.service.auth_service import AuthServiceFactory

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")
auth_service = AuthServiceFactory.create()


@router.post(
    "/register",
    response_model=schemas.User,
    status_code=status.HTTP_201_CREATED,
)
def register_user(
    user_in: schemas.UserCreate, db: Session = Depends(database.get_db)
):
    if crud.get_user_by_username(db, user_in.username):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already registered.",
        )
    if crud.get_user_by_email(db, user_in.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered.",
        )

    password_hash = auth_service.get_password_hash(user_in.password)
    user = crud.create_user(db, user_in, password_hash)
    return user


@router.post("/login", response_model=schemas.LoginResponse)
def login_for_access_token(
    payload: schemas.LoginRequest,
    db: Session = Depends(database.get_db),
):
    user = auth_service.authenticate_user(
        db, payload.username, payload.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth_service.create_access_token(
        data={"sub": str(user.id), "type": "access"}
    )
    refresh_token = auth_service.create_refresh_token(
        data={"sub": str(user.id), "type": "refresh"}
    )
    return schemas.LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=user,
    )


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(database.get_db),
) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, auth_service.secret_key, algorithms=[auth_service.algorithm]
        )
        subject = payload.get("sub")
        if subject is None:
            raise credentials_exception
        user_id = int(subject)
    except (JWTError, ValueError):
        raise credentials_exception
    user = crud.get_user(db, user_id)
    if user is None or not user.is_active:
        raise credentials_exception
    return user


@router.get("/me", response_model=schemas.User)
def read_current_user(
    current_user: models.User = Depends(get_current_user),
):
    return current_user


@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    payload: schemas.ChangePasswordRequest,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Allow the currently authenticated user to change their own password.
    """
    # Find the Auth row linked to this user.
    auth = (
        db.query(models.Auth)
        .filter(
            models.Auth.table_name == models.User.__tablename__,
            models.Auth.table_id == current_user.id,
        )
        .first()
    )
    if not auth:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No credentials found for this user.",
        )

    # Verify current password.
    if not auth_service.verify_password(
        payload.current_password, auth.password_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect.",
        )

    # Update to the new password.
    auth.password_hash = auth_service.get_password_hash(payload.new_password)
    db.add(auth)
    db.commit()

    return


@router.get("/users", response_model=List[schemas.User])
def list_users(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    # For now, any authenticated user can list users.
    return crud.get_users(db)

