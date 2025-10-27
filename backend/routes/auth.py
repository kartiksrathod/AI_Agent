# routes/auth.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt, JWTError
from server import db
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Load environment variables
SECRET_KEY = os.getenv("SECRET_KEY", "secret")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", SMTP_USERNAME)
SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "EduResources")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# ---------- MODELS ----------
class RegisterModel(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginModel(BaseModel):
    email: EmailStr
    password: str

class ResendVerificationModel(BaseModel):
    email: EmailStr


# ---------- Helper: Send Verification Email ----------
def send_verification_email(to_email: str, token: str):
    verify_link = f"{FRONTEND_URL}/verify/{token}"

    message = MIMEMultipart("alternative")
    message["Subject"] = "Verify your email - EduResources"
    message["From"] = f"{SMTP_FROM_NAME} <{SMTP_FROM_EMAIL}>"
    message["To"] = to_email

    html_content = f"""
    <html>
        <body>
            <p>Hi 👋,<br>
            Please verify your email by clicking below:<br><br>
            <a href="{verify_link}">Verify Email</a><br><br>
            This link will expire in 15 minutes.<br><br>
            Thanks,<br>EduResources Team
            </p>
        </body>
    </html>
    """
    message.attach(MIMEText(html_content, "html"))

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.sendmail(SMTP_FROM_EMAIL, to_email, message.as_string())
            print(f"📨 Verification email sent successfully to {to_email}")
    except Exception as e:
        print(f"❌ Email sending error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to send email: {e}")


# ---------- REGISTER ----------
@router.post("/register")
async def register_user(data: RegisterModel):
    existing_user = db.users.find_one({"email": data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = pwd_context.hash(data.password)

    token_data = {
        "email": data.email,
        "exp": datetime.utcnow() + timedelta(minutes=15)
    }
    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)

    send_verification_email(data.email, token)

    user = {
        "name": data.name,
        "email": data.email,
        "password": hashed_password,
        "verified": False,
        "created_at": datetime.utcnow(),
    }
    db.users.insert_one(user)

    return {"message": "Verification email sent. Please verify to complete registration ✅"}


# ---------- VERIFY EMAIL ----------
@router.get("/verify/{token}")
async def verify_email(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    result = db.users.update_one({"email": email}, {"$set": {"verified": True}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"message": "Email verified successfully ✅"}


# ---------- LOGIN ----------
@router.post("/login")
async def login_user(data: LoginModel):
    user = db.users.find_one({"email": data.email})
    if not user or not pwd_context.verify(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.get("verified", False):
        raise HTTPException(status_code=403, detail="Please verify your email before logging in")

    payload = {
        "user_id": str(user["_id"]),
        "email": user["email"],
        "exp": datetime.utcnow().timestamp() + 3600
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    return {"access_token": token, "token_type": "bearer", "message": "Login successful ✅"}


# ---------- RESEND VERIFICATION ----------
@router.post("/resend-verification")
async def resend_verification(data: ResendVerificationModel):
    user = db.users.find_one({"email": data.email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.get("verified"):
        return {"message": "Your email is already verified ✅"}

    token_data = {
        "email": user["email"],
        "exp": datetime.utcnow() + timedelta(minutes=15)
    }
    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)

    send_verification_email(user["email"], token)

    return {"message": "Verification email resent successfully 📩"}
