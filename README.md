# Frontend (React)

## Run locally
```bash
npm install
npm run dev
```

If you need to point API calls to the backend, create `.env`:
```
VITE_API_BASE=http://localhost:5000/api
```

## Notes
- Ensure `public/index.html` exists. Downgraded date-fns to ^3.6.0 to satisfy react-day-picker peer deps.
- If you previously saw `ERESOLVE` for `date-fns` vs `react-day-picker`, we've set `date-fns` to `^3.6.0`.
