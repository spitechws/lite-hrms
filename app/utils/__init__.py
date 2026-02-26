import re

from fastapi import HTTPException, status


def validate_email(email: str) -> None:
  email_regex = r"^[\w\.-]+@[\w\.-]+\.\w+$"
  if not re.match(email_regex, email):
    raise HTTPException(
      status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
      detail="Invalid email format.",
    )

