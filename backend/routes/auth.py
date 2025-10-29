# routes/auth.py
from fastapi import APIRouter, HTTPException, status, BackgroundTasks
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt, JWTError
from config import (
    db,
    JWT_SECRET_KEY,
    JWT_ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    FRONTEND_URL,
    SMTP_SERVER,
    SMTP_PORT,
    SMTP_USERNAME,
    SMTP_PASSWORD,
    SMTP_FROM_EMAIL,
    SMTP_FROM_NAME,
)
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import uuid

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# -------------------- MODELS --------------------
class RegisterModel(BaseModel):
    name: str
    email: EmailStr
    password: str
    usn: str | None = None
    course: str | None = None
    semester: str | None = None

class LoginModel(BaseModel):
    email: EmailStr
    password: str

class ResendVerificationModel(BaseModel):
    email: EmailStr

# -------------------- UTILITIES --------------------
def create_access_token(data: dict, expires_minutes: int = ACCESS_TOKEN_EXPIRE_MINUTES):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires_minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def send_verification_email(to_email: str, token: str):
    # Use backend verify endpoint so clicking in email works from any device
    verify_link = f"{FRONTEND_URL.rstrip('/')}/verify-email/{token}"
    # If FRONTEND_URL not providing a page for verification, fallback to backend endpoint:
    backend_verify = f"{FRONTEND_URL.rstrip('/')}/api/auth/verify/{token}"
    # Compose email
    message = MIMEMultipart("alternative")
    message["Subject"] = "Verify your email - EduResources"
    message["From"] = f"{SMTP_FROM_NAME} <{SMTP_FROM_EMAIL}>"
    message["To"] = to_email

    text = (
        f"Hi,\n\n"
        f"Please verify your email by visiting this link:\n\n{verify_link}\n\n"
        f"If the above doesn't work, open this alternative link in your browser:\n{backend_verify}\n\n"
        "This link expires in 15 minutes.\n\nEduResources"
    )
    html = f"""
    <html><body style="font-family: sans-serif; font-size: 16px;">
      <p>Hi,</p>
      <p>Please verify your email by clicking the button below:</p>
      <p>
        <a href="{verify_link}" target="_blank"
           style="background-color:#2563eb;color:white;padding:10px 18px;border-radius:8px;text-decoration:none;">
           Verify Email
        </a>
      </p>
      <p>If that doesn't work, paste this URL into your browser:<br><small>{backend_verify}</small></p>
      <p>This link expires in 15 minutes.</p>
      <p>EduResources</p>
    </body></html>
    """
    message.attach(MIMEText(text, "plain"))
    message.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP(SMTP_SERVER, int(SMTP_PORT)) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.sendmail(SMTP_FROM_EMAIL, to_email, message.as_string())
            print(f"📨 Verification email sent to {to_email}")
    except Exception as e:
        # Provide useful debugging info to logs while not leaking credentials.
        raise HTTPException(status_code=500, detail=f"Failed to send verification email: {e}")


# -------------------- REGISTER --------------------
@router.post("/register")
async def register_user(data: RegisterModel):
    """
    Registration flow:
    - If an existing verified user exists: reject.
    - If an existing unverified record exists: remove it (reset).
    - Hash password and create a signed token containing the user data.
    - Send verification email with token.
    - Insert a minimal pending record (so UI knows registration started).
    - NOTE: full user document with password is only created when user clicks verification link.
    """
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    existing_user = db.users.find_one({"email": data.email})
    if existing_user and existing_user.get("verified", False):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered and verified")

    # Remove any stale unverified entry to reset the flow
    if existing_user and not existing_user.get("verified", False):
        db.users.delete_one({"email": data.email})

    hashed_pw = pwd_context.hash(data.password)

    token_data = {
        "name": data.name,
        "email": data.email,
        "password_hash": hashed_pw,
        "usn": data.usn,
        "course": data.course,
        "semester": data.semester,
    }
    verification_token = create_access_token(token_data, expires_minutes=15)

    # send email; if this raises, do not touch DB
    send_verification_email(data.email, verification_token)

    # create minimal pending record so frontend can show "pending verification"
    pending = {
        "_id": str(uuid.uuid4()),
        "email": data.email,
        "verified": False,
        "created_at": datetime.utcnow()
    }
    db.users.insert_one(pending)

    return {"message": "Verification email sent successfully. Please verify to complete registration."}


# -------------------- VERIFY EMAIL --------------------
@router.get("/verify/{token}", response_class=HTMLResponse)
async def verify_email(token: str):
    """
    When user clicks the email link we decode token and create the full user document (or update if present).
    We return a small HTML page that redirects to frontend login after 3 seconds.
    """
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired verification link")

    email = payload.get("email")
    name = payload.get("name")
    password_hash = payload.get("password_hash")

    if not email or not name or not password_hash:
        raise HTTPException(status_code=400, detail="Invalid token payload")

    # remove any pending documents with same email to avoid duplicates
    db.users.delete_many({"email": email})

    # Build final user doc
    user_doc = {
        "_id": str(uuid.uuid4()),
        "name": name,
        "email": email,
        "password": password_hash,
        "usn": payload.get("usn"),
        "course": payload.get("course"),
        "semester": payload.get("semester"),
        "is_admin": False,
        "role": "student",
        "verified": True,
        "verified_at": datetime.utcnow(),
        "created_at": datetime.utcnow(),
    }

    db.users.insert_one(user_doc)

    # Friendly HTML response (redirects to frontend login)
    redirect_url = f"{FRONTEND_URL.rstrip('/')}/login"
    html = f"""
    <html><body style='font-family: sans-serif; text-align:center; padding:40px;'>
      <h2>🎉 Email Verified Successfully!</h2>
      <p>Your account has been activated. You will be redirected to login shortly.</p>
      <p><a href="{redirect_url}">Click here if you are not redirected</a></p>
      <meta http-equiv="refresh" content="3;url={redirect_url}" />
    </body></html>
    """
    return HTMLResponse(content=html, status_code=200)


# -------------------- LOGIN --------------------
@router.post("/login")
async def login_user(data: LoginModel):
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    user = db.users.find_one({"email": data.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.get("verified", False):
        raise HTTPException(status_code=403, detail="Please verify your email before logging in")

    if not pwd_context.verify(data.password, user.get("password", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Include 'sub' for email and 'role'/'is_admin' for admin checks
    is_admin = bool(user.get("is_admin", False) or user.get("role") == "admin")
    payload = {"sub": user["email"], "role": user.get("role", "student"), "is_admin": is_admin}
    token = create_access_token(payload, expires_minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    # Return user object for frontend (do not include password)
    user_response = {
        "name": user.get("name"),
        "email": user.get("email"),
        "usn": user.get("usn"),
        "course": user.get("course"),
        "semester": user.get("semester"),
        "is_admin": is_admin,
        "role": user.get("role", "student"),
    }

    return {"access_token": token, "token_type": "bearer", "user": user_response}


# -------------------- RESEND VERIFICATION --------------------
@router.post("/resend-verification")
async def resend_verification(data: ResendVerificationModel, background_tasks: BackgroundTasks):
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    user = db.users.find_one({"email": data.email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.get("verified", False):
        return {"message": "Email already verified"}

    # If user doc has a password hash already, reuse it. Otherwise instruct re-register.
    password_hash = user.get("password")
    name = user.get("name", "EduResources User")
    if not password_hash:
        # There may be only a pending entry with no password — ask to register again.
        raise HTTPException(status_code=400, detail="No pending registration data — please register again")

    token_data = {"name": name, "email": data.email, "password_hash": password_hash, "usn": user.get("usn"), "course": user.get("course"), "semester": user.get("semester")}
    verification_token = create_access_token(token_data, expires_minutes=15)
    background_tasks.add_task(send_verification_email, data.email, verification_token)
    return {"message": "Verification email resent successfully."}
