#!/bin/bash

##############################################################################
# KEEPALIVE MONITOR - Ensures Services Stay Running 24/7
##############################################################################
# This script continuously monitors and restarts services if they stop
# Runs every 30 seconds to detect and recover from any shutdowns
##############################################################################

LOG_FILE="/var/log/keepalive_monitor.log"
HEALTH_CHECK_URL="http://localhost:8001/health"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

check_and_restart_services() {
    # Check supervisor status for all services
    BACKEND_STATUS=$(sudo supervisorctl status backend | awk '{print $2}')
    FRONTEND_STATUS=$(sudo supervisorctl status frontend | awk '{print $2}')
    MONGODB_STATUS=$(sudo supervisorctl status mongodb | awk '{print $2}')
    
    RESTART_NEEDED=false
    
    # Check if any service is not running
    if [ "$BACKEND_STATUS" != "RUNNING" ]; then
        log "⚠️  Backend is $BACKEND_STATUS - Restarting..."
        RESTART_NEEDED=true
    fi
    
    if [ "$FRONTEND_STATUS" != "RUNNING" ]; then
        log "⚠️  Frontend is $FRONTEND_STATUS - Restarting..."
        RESTART_NEEDED=true
    fi
    
    if [ "$MONGODB_STATUS" != "RUNNING" ]; then
        log "⚠️  MongoDB is $MONGODB_STATUS - Restarting..."
        RESTART_NEEDED=true
    fi
    
    # Restart all services if any are down
    if [ "$RESTART_NEEDED" = true ]; then
        log "🔄 Restarting all services..."
        sudo supervisorctl restart all
        sleep 5
        
        # Verify restart
        BACKEND_NEW=$(sudo supervisorctl status backend | awk '{print $2}')
        if [ "$BACKEND_NEW" = "RUNNING" ]; then
            log "✅ Services restarted successfully"
        else
            log "❌ Service restart failed - manual intervention may be needed"
        fi
    fi
}

check_backend_health() {
    # Try to hit the health endpoint
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_CHECK_URL" --max-time 5)
    
    if [ "$HTTP_CODE" != "200" ]; then
        log "⚠️  Backend health check failed (HTTP $HTTP_CODE) - Restarting backend..."
        sudo supervisorctl restart backend
        sleep 3
    fi
}

log "🚀 Keepalive Monitor Started"
log "📊 Monitoring services every 30 seconds"
log "🛡️  Auto-restart enabled for: backend, frontend, mongodb"

# Main monitoring loop
while true; do
    # Check if services are running
    check_and_restart_services
    
    # Check backend health (only if backend is running)
    BACKEND_STATUS=$(sudo supervisorctl status backend | awk '{print $2}')
    if [ "$BACKEND_STATUS" = "RUNNING" ]; then
        check_backend_health
    fi
    
    # Wait 30 seconds before next check
    sleep 30
done
