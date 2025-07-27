---
name: emergency-deploy-check
description: Absolute minimum checks for emergency deployment
---

EMERGENCY ONLY - Check these 5 things:

1. **Does it build?**
   ```bash
   npm run build
   ```

2. **Any exposed secrets?**
   - Quick search for API keys
   - Check .env is ignored

3. **Does it start?**
   ```bash
   npm start
   ```
   - Visit localhost:3000
   - Make sure no white screen of death

4. **Can users log in?**
   - Try to log in
   - If broken, deployment fails

5. **Is the database connected?**
   - Check if data loads
   - If not, check connection string

If all 5 pass, deploy with caution and monitor closely.
