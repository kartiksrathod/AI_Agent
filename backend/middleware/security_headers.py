"""
Security Headers Middleware
Implements professional-grade security headers following OWASP best practices
"""

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response, RedirectResponse
import os


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Adds security headers to all responses:
    - HSTS (HTTP Strict Transport Security)
    - CSP (Content Security Policy)
    - X-Frame-Options
    - X-Content-Type-Options
    - X-XSS-Protection
    - Referrer-Policy
    - Permissions-Policy
    """
    
    def __init__(self, app, enforce_https: bool = True):
        super().__init__(app)
        self.enforce_https = enforce_https
        self.environment = os.getenv("ENVIRONMENT", "production")
    
    async def dispatch(self, request: Request, call_next):
        # HTTPS Redirection (only in production with HTTPS enabled)
        if self.enforce_https and self.environment == "production":
            if request.url.scheme == "http":
                # Redirect HTTP to HTTPS
                https_url = request.url.replace(scheme="https")
                return RedirectResponse(url=str(https_url), status_code=301)
        
        # Process request
        response = await call_next(request)
        
        # Add security headers
        self._add_security_headers(response, request)
        
        return response
    
    def _add_security_headers(self, response: Response, request: Request):
        """
        Add comprehensive security headers to response
        """
        
        # HSTS - Force HTTPS for 1 year
        # Tells browsers to always use HTTPS for this domain
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains; preload"
        )
        
        # Content Security Policy - Prevent XSS attacks
        # Defines which content sources are allowed to load
        csp_directives = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",  # Allow inline scripts for React
            "style-src 'self' 'unsafe-inline'",  # Allow inline styles for Tailwind
            "img-src 'self' data: https:",  # Allow images from https and data URIs
            "font-src 'self' data:",
            "connect-src 'self' https:",  # Allow API calls
            "frame-ancestors 'none'",  # Prevent clickjacking
            "base-uri 'self'",
            "form-action 'self'",
        ]
        response.headers["Content-Security-Policy"] = "; ".join(csp_directives)
        
        # X-Frame-Options - Prevent clickjacking
        # Prevents the page from being displayed in a frame/iframe
        response.headers["X-Frame-Options"] = "DENY"
        
        # X-Content-Type-Options - Prevent MIME sniffing
        # Prevents browsers from MIME-sniffing away from declared content-type
        response.headers["X-Content-Type-Options"] = "nosniff"
        
        # X-XSS-Protection - Enable browser XSS protection
        # Enables browser's built-in XSS filter
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        # Referrer-Policy - Control referrer information
        # Controls how much referrer information is sent
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Permissions-Policy - Control browser features
        # Restricts which browser features can be used
        permissions = [
            "geolocation=()",
            "microphone=()",
            "camera=()",
            "payment=()",
            "usb=()",
            "magnetometer=()",
            "gyroscope=()",
            "accelerometer=()",
        ]
        response.headers["Permissions-Policy"] = ", ".join(permissions)
        
        # X-Permitted-Cross-Domain-Policies - Restrict cross-domain policies
        response.headers["X-Permitted-Cross-Domain-Policies"] = "none"
        
        # Cache-Control for sensitive endpoints
        if request.url.path.startswith("/api/auth") or request.url.path.startswith("/api/profile"):
            response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, private"
            response.headers["Pragma"] = "no-cache"
            response.headers["Expires"] = "0"
