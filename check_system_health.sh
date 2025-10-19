#!/bin/bash

##############################################################################
# SYSTEM HEALTH CHECK - Quick verification script
##############################################################################
# Run this anytime to check if everything is working properly
##############################################################################

echo "🔍 EduResources System Health Check"
echo "===================================="
echo ""

# Check services
echo "📊 Service Status:"
sudo supervisorctl status | grep -E "backend|frontend|mongodb"
echo ""

# Check keepalive monitor
echo "🛡️  Keepalive Monitor:"
if ps aux | grep -v grep | grep keepalive_monitor > /dev/null; then
    PID=$(ps aux | grep -v grep | grep keepalive_monitor | awk '{print $2}')
    echo "   ✅ ACTIVE (PID: $PID)"
else
    echo "   ❌ NOT RUNNING - Start with: nohup bash /app/scripts/keepalive_monitor.sh > /var/log/keepalive_monitor.log 2>&1 &"
fi
echo ""

# Check backend health
echo "🏥 Backend Health:"
HEALTH=$(curl -s http://localhost:8001/health)
if echo "$HEALTH" | grep -q "healthy"; then
    echo "   ✅ HEALTHY - $HEALTH"
else
    echo "   ❌ UNHEALTHY - $HEALTH"
fi
echo ""

# Check data
echo "📚 Database Stats:"
STATS=$(curl -s http://localhost:8001/api/stats)
if [ $? -eq 0 ]; then
    echo "   $STATS"
else
    echo "   ❌ Failed to fetch stats"
fi
echo ""

# Check backups
echo "💾 Backup System:"
LATEST_BACKUP=$(ls -td /app/backups/backup_* 2>/dev/null | head -1)
if [ -n "$LATEST_BACKUP" ]; then
    BACKUP_TIME=$(basename "$LATEST_BACKUP" | cut -d'_' -f2-3)
    echo "   ✅ Latest backup: $BACKUP_TIME"
    BACKUP_COUNT=$(ls -d /app/backups/backup_* 2>/dev/null | wc -l)
    echo "   📦 Total backups: $BACKUP_COUNT"
else
    echo "   ⚠️  No backups found"
fi
echo ""

# Check CPU usage
echo "💻 Resource Usage:"
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
echo "   CPU: ${CPU_USAGE}%"
MEM_USAGE=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100}')
echo "   Memory: ${MEM_USAGE}%"
echo ""

# Overall status
echo "🎯 Overall Status:"
if sudo supervisorctl status backend | grep -q "RUNNING" && \
   sudo supervisorctl status frontend | grep -q "RUNNING" && \
   sudo supervisorctl status mongodb | grep -q "RUNNING" && \
   ps aux | grep -v grep | grep keepalive_monitor > /dev/null && \
   curl -s http://localhost:8001/health | grep -q "healthy"; then
    echo "   ✅ ALL SYSTEMS OPERATIONAL"
    exit 0
else
    echo "   ⚠️  SOME ISSUES DETECTED - Check logs above"
    exit 1
fi
