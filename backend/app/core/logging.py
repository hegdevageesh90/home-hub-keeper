
"""
Logging configuration for the application
"""
import logging
import sys
from datetime import datetime
from pathlib import Path

from app.core.config import settings

def configure_logging():
    """Configure structured logging for the application"""
    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
    
    # Create logs directory if it doesn't exist
    logs_dir = Path("logs")
    logs_dir.mkdir(exist_ok=True)
    
    # Get current date for log filename
    current_date = datetime.now().strftime("%Y-%m-%d")
    log_file = logs_dir / f"{current_date}.log"
    
    # Setup logging
    logging.basicConfig(
        level=log_level,
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler(log_file)
        ]
    )
    
    # Create logger for this module
    logger = logging.getLogger("app")
    logger.setLevel(log_level)
    
    # Log the application startup
    logger.info(
        f"Starting application | Environment: {settings.ENVIRONMENT} | "
        f"Log level: {settings.LOG_LEVEL}"
    )
    
    return logger
