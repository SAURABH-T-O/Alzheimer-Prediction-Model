# AlzAI prediction services

The website uses React for its interface and Express on Node.js for the application API. FastAPI runs the feature-based and MRI image inference that require the supplied PyTorch models. The application does not use a database and does not save prediction requests, results, or MRI images.

```mermaid
flowchart LR
    A[React method selection] --> B[Express API on Node.js]
    B -->|Medical data| C[FastAPI feature inference]
    C --> D[Supplied Scaler.pkl]
    D --> E[Supplied model_param.pth]
    B -->|MRI image| F[FastAPI MRI inference]
    F --> G[Supplied alzy_model.pth]
    E --> C
    G --> F
    C --> B
    F --> B
    B -->|Return result without storing data| A
```

FastAPI runs at `http://127.0.0.1:8000`. Express runs at `http://127.0.0.1:5000`. The Vite development server proxies `/api` requests to Express.

Place the supplied `model_param.pth`, `Scaler.pkl`, and `alzy_model.pth` files in `backend/models/`. The MRI upload accepts JPEG, PNG, and WebP images up to 10 MB. The service reports the relevant model unavailable if its artifact cannot be loaded.

From the project root, run `npm install`, copy `.env.example` to `.env`, then run `npm run dev` to start the React and Express development servers. In another terminal, create and activate a Python virtual environment in `backend`, install `backend/requirements.txt`, and run `uvicorn app.main:app --reload --port 8000` from the `backend` folder.

For a production frontend build, run `npm run build`. Express serves the generated files from `frontend/dist` when that directory exists.

The prediction is informational and is not a medical diagnosis.
