"""
Logging Middleware
Comprehensive request/response logging with security event tracking
"""

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
import time
import logging
import json
from datetime import datetime
import traceback


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Logs all HTTP requests and responses with:
    - Request details (method, path, headers, IP)
    - Response details (status, time)
    - Security events
    - Errors and exceptions
    """
    
    def __init__(self, app):
        super().__init__(app)
        self.logger = logging.getLogger("app.requests")
        self.security_logger = logging.getLogger("app.security")
        self.error_logger = logging.getLogger("app.errors")
    
    async def dispatch(self, request: Request, call_next):
        # Start timer
        start_time = time.time()
        
        # Extract request info
        request_info = self._extract_request_info(request)
        
        # Log incoming request
        self.logger.info(
            f"Request: {request.method} {request.url.path}",
            extra=request_info
        )
        
        try:
            # Process request
            response = await call_next(request)
            
            # Calculate request duration
            duration = time.time() - start_time
            
            # Extract response info
            response_info = {
                **request_info,
                "status_code": response.status_code,
                "duration_ms": round(duration * 1000, 2),
            }
            
            # Log response
            log_level = self._get_log_level(response.status_code)
            self.logger.log(
                log_level,
                f"Response: {request.method} {request.url.path} - {response.status_code} ({duration:.2f}s)",
                extra=response_info
            )
            
            # Log security events
            self._log_security_events(request, response, response_info)
            
            return response
            
        except Exception as e:
            # Log error
            duration = time.time() - start_time
            
            error_info = {
                **request_info,
                "error_type": type(e).__name__,
                "error_message": str(e),
                "duration_ms": round(duration * 1000, 2),
                "traceback": traceback.format_exc()
            }
            
            self.error_logger.error(
                f"Error: {request.method} {request.url.path} - {type(e).__name__}: {str(e)}",
                extra=error_info
            )
            
            # Re-raise the exception to be handled by FastAPI
            raise
    
    def _extract_request_info(self, request: Request) -> dict:
        """
        Extract relevant information from request
        """
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "method": request.method,
            "path": request.url.path,
            "query_params": str(request.query_params),
            "client_ip": request.client.host if request.client else "unknown",
            "user_agent": request.headers.get("user-agent", "unknown"),
            "referer": request.headers.get("referer", "none"),
        }
    
    def _get_log_level(self, status_code: int) -> int:
        """
        Determine log level based on status code
        """
        if status_code < 400:
            return logging.INFO
        elif status_code < 500:
            return logging.WARNING
        else:
            return logging.ERROR
    
    def _log_security_events(self, request: Request, response, response_info: dict):
        """
        Log security-relevant events
        """
        path = request.url.path
        status = response.status_code
        
        # Log authentication events
        if "/auth/login" in path:
            if status == 200:
                self.security_logger.info(
                    f"Successful login from {response_info['client_ip']}",
                    extra=response_info
                )
            elif status == 401:
                self.security_logger.warning(
                    f"Failed login attempt from {response_info['client_ip']}",
                    extra=response_info
                )
        
        # Log registration events
        elif "/auth/register" in path:
            if status == 200:
                self.security_logger.info(
                    f"New user registration from {response_info['client_ip']}",
                    extra=response_info
                )
        
        # Log password reset events
        elif "/auth/forgot-password" in path or "/auth/reset-password" in path:
            self.security_logger.warning(
                f"Password reset request from {response_info['client_ip']}",
                extra=response_info
            )
        
        # Log file upload events
        elif request.method == "POST" and ("/papers" in path or "/notes" in path or "/syllabus" in path):
            if status == 200:
                self.security_logger.info(
                    f"File uploaded from {response_info['client_ip']}",
                    extra=response_info
                )
        
        # Log admin actions (deletes, updates)
        elif request.method in ["DELETE", "PUT", "PATCH"] and status == 200:
            self.security_logger.warning(
                f"Resource modification: {request.method} {path} from {response_info['client_ip']}",
                extra=response_info
            )
        
        # Log rate limit violations
        elif status == 429:
            self.security_logger.warning(
                f"Rate limit exceeded from {response_info['client_ip']} on {path}",
                extra=response_info
            )
        
        # Log unauthorized access attempts
        elif status == 401:
            self.security_logger.warning(
                f"Unauthorized access attempt: {request.method} {path} from {response_info['client_ip']}",
                extra=response_info
            )
        
        # Log forbidden access attempts
        elif status == 403:
            self.security_logger.warning(
                f"Forbidden access attempt: {request.method} {path} from {response_info['client_ip']}",
                extra=response_info
            )
