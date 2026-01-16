# Alertmanager Email Troubleshooting Guide

## About the `monitoring/` Folder Structure

- **`monitoring/prometheus/alertmanager.yml`** ✅ **ACTIVE** - This is the file used by Docker
- **`monitoring/monitoring/alertmanager.yml`** ❌ **UNUSED** - Old/duplicate file (can be deleted)
- **`monitoring/prometheus/prometheus.yml`** - Prometheus configuration
- **`monitoring/prometheus/rules.yml`** - Alert rules

## Why Emails Aren't Sending - Step-by-Step Diagnosis

### Step 1: Verify Alert is FIRING in Prometheus

1. Open: http://localhost:9090/alerts
2. Look for "LoginErrorHigh" alert
3. Status should be **"FIRING"** (red) - not "PENDING" (yellow)
4. If PENDING, wait 1 minute (the `for: 1m` duration)

**If alert is not FIRING:**

- Your test requests might not be generating enough 429 errors
- Check the metric: `rate(http_requests_total{path="/api/auth/login",status="429"}[5m])`
- You need > 0.1 requests/second for 1 minute

### Step 2: Check if Prometheus is Sending Alerts to Alertmanager

1. Open: http://localhost:9090/status
2. Click "Runtime & Build Information"
3. Under "Alertmanagers", verify it shows: `alertmanager:9093`
4. Status should be "UP"

**If Alertmanager is DOWN:**

- Check network connectivity
- Verify docker-compose network is working

### Step 3: Check Alertmanager Received the Alert

1. Open: http://localhost:9093
2. Go to **"Alerts"** tab
3. You should see "LoginErrorHigh" alert listed
4. Check **"Status"** tab → **"Configuration"** - verify config loaded

**If no alerts in Alertmanager:**

- Prometheus is not sending alerts
- Check Prometheus logs: `docker logs prometheus`

### Step 4: Check Alertmanager Logs for Email Errors

```bash
docker logs alertmanager --tail 100 | grep -i "error\|email\|smtp"
```

Look for:

- `error sending notification`
- `smtp.*error`
- `authentication failed`

### Step 5: Verify Gmail Configuration

Current settings:

- **SMTP:** smtp.gmail.com:587
- **From:** anthonycrausus14.ncmc@gmail.com
- **To:** takasukunami76@gmail.com
- **App Password:** menbfbcuauqsaoat

**Common Gmail issues:**

1. App password expired or revoked
2. "Less secure app access" disabled (should use app password instead)
3. Gmail blocking the connection
4. Check spam folder!

### Step 6: Test Email Configuration

```bash
# Validate Alertmanager config syntax
docker exec alertmanager amtool check-config /etc/alertmanager/alertmanager.yml

# Reload config if you made changes
docker exec alertmanager kill -HUP 1
```

## Quick Test Procedure

1. **Trigger the alert:**

   - Make rapid login requests to `/api/auth/login` with wrong credentials
   - Need to hit rate limit (429 status)
   - Do this for at least 1-2 minutes continuously

2. **Check Prometheus:** http://localhost:9090/alerts

   - Wait for "LoginErrorHigh" to show "FIRING"

3. **Check Alertmanager:** http://localhost:9093/alerts

   - Should see the alert appear

4. **Check logs:**

   ```bash
   docker logs -f alertmanager
   ```

   - Watch for email sending attempts

5. **Check email:**
   - Check inbox: takasukunami76@gmail.com
   - Check spam folder
   - Wait up to 30 seconds (group_wait: 10s)

## Common Issues & Fixes

### Issue: Alert shows in Prometheus but not in Alertmanager

**Fix:** Check Prometheus can reach Alertmanager

```bash
docker exec prometheus wget -qO- http://alertmanager:9093/-/healthy
```

### Issue: Alertmanager shows alert but no email

**Fix:** Check Gmail app password and logs

```bash
docker logs alertmanager | grep -i email
```

### Issue: Gmail authentication fails

**Fix:**

1. Generate new app password in Gmail
2. Update `smtp_auth_password` in alertmanager.yml
3. Restart: `docker-compose restart alertmanager`

### Issue: Alert never fires

**Fix:**

- Verify metric exists: Check http://localhost:9090/graph
- Query: `rate(http_requests_total{path="/api/auth/login",status="429"}[5m])`
- Make sure you're generating 429 errors, not 401 errors

## Restart Services After Config Changes

```bash
cd backend/monitoring
docker-compose restart alertmanager prometheus
```

## Current Alert Rule

```yaml
- alert: LoginErrorHigh
  expr: rate(http_requests_total{path="/api/auth/login",status="429"}[5m]) > 0.1
  for: 1m
  labels:
    severity: critical
```

**This triggers when:**

- Rate of 429 errors on `/api/auth/login` > 0.1 per second
- For at least 1 minute continuously
