"""
Logging Configuration
Sets up comprehensive logging for the application
"""

import logging
import logging.handlers
import os
from pathlib import Path
import json
from datetime import datetime


class JSONFormatter(logging.Formatter):
    """
    Custom JSON formatter for structured logging
    """
    
    def format(self, record):
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        
        # Add extra fields if present
        if hasattr(record, "client_ip"):
            log_data["client_ip"] = record.client_ip
        if hasattr(record, "method"):
            log_data["method"] = record.method
        if hasattr(record, "path"):
            log_data["path"] = record.path
        if hasattr(record, "status_code"):
            log_data["status_code"] = record.status_code
        if hasattr(record, "duration_ms"):
            log_data["duration_ms"] = record.duration_ms
        if hasattr(record, "user_agent"):
            log_data["user_agent"] = record.user_agent
        if hasattr(record, "error_type"):
            log_data["error_type"] = record.error_type
        if hasattr(record, "error_message"):
            log_data["error_message"] = record.error_message
        
        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        
        return json.dumps(log_data)


def setup_logging():
    """
    Configure comprehensive logging for the application
    
    Creates separate log files for:
    - app.log: All application logs
    - security.log: Security events only
    - error.log: Errors and exceptions only
    - audit.log: Admin actions and sensitive operations
    """
    
    # Create logs directory
    log_dir = Path(__file__).resolve().parent / "logs"
    log_dir.mkdir(parents=True, exist_ok=True)
    
    # Root logger configuration
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    
    # Remove existing handlers
    root_logger.handlers = []
    
    # Console handler (for development)
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    console_handler.setFormatter(console_formatter)
    root_logger.addHandler(console_handler)
    
    # Application log file (all logs)
    app_handler = logging.handlers.RotatingFileHandler(
        log_dir / "app.log",
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5
    )
    app_handler.setLevel(logging.INFO)
    app_handler.setFormatter(JSONFormatter())
    root_logger.addHandler(app_handler)
    
    # Security log file (security events only)
    security_logger = logging.getLogger("app.security")
    security_logger.setLevel(logging.INFO)
    security_logger.propagate = False  # Don't propagate to root logger
    
    security_handler = logging.handlers.RotatingFileHandler(
        log_dir / "security.log",
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=10  # Keep more security logs
    )
    security_handler.setLevel(logging.INFO)
    security_handler.setFormatter(JSONFormatter())
    security_logger.addHandler(security_handler)
    
    # Also log to console
    security_console = logging.StreamHandler()
    security_console.setFormatter(console_formatter)
    security_logger.addHandler(security_console)
    
    # Error log file (errors and exceptions only)
    error_logger = logging.getLogger("app.errors")
    error_logger.setLevel(logging.ERROR)
    error_logger.propagate = False
    
    error_handler = logging.handlers.RotatingFileHandler(
        log_dir / "error.log",
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=10
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(JSONFormatter())
    error_logger.addHandler(error_handler)
    
    # Also log to console
    error_console = logging.StreamHandler()
    error_console.setFormatter(console_formatter)
    error_logger.addHandler(error_console)
    
    # Audit log file (admin actions and sensitive operations)
    audit_logger = logging.getLogger("app.audit")
    audit_logger.setLevel(logging.INFO)
    audit_logger.propagate = False
    
    audit_handler = logging.handlers.RotatingFileHandler(
        log_dir / "audit.log",
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=20  # Keep extensive audit logs
    )
    audit_handler.setLevel(logging.INFO)
    audit_handler.setFormatter(JSONFormatter())
    audit_logger.addHandler(audit_handler)
    
    # Request logger
    request_logger = logging.getLogger("app.requests")
    request_logger.setLevel(logging.INFO)
    
    print("✅ Logging system initialized")
    print(f"📁 Logs directory: {log_dir}")
    print("📝 Log files:")
    print("   - app.log (all logs)")
    print("   - security.log (security events)")
    print("   - error.log (errors only)")
    print("   - audit.log (admin actions)")


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance
    
    Args:
        name: Logger name (e.g., 'app.security', 'app.errors', 'app.audit')
    
    Returns:
        logging.Logger: Configured logger instance
    """
    return logging.getLogger(name)
