# React + TypeScript + Vite

## CI/CD: Deploy to AWS EC2 with Docker & ECR

- Overview
  - Builds the Vite React app inside Docker, serves via NGINX.
  - Pushes the image to Amazon ECR.
  - SSH into EC2 and runs `docker compose` with the pushed image.

- Files added
  - `Dockerfile`: multi-stage build (Node build + NGINX runtime)
  - `nginx.conf`: SPA routing (`/index.html` fallback)
  - `docker-compose.yml`: uses `IMAGE_PLACEHOLDER`; port `3005:80`
  - `.github/workflows/main.yml`: Build & Deploy pipeline
  - `.dockerignore`: reduces Docker build context

- Required GitHub secrets
  - `AWS_ACCESS_KEY_ID`: IAM user key with ECR (push) permissions
  - `AWS_SECRET_ACCESS_KEY`: IAM user secret
  - `AWS_REGION`: e.g. `us-east-1`
  - `AWS_ACCOUNT_ID`: e.g. `748538527781`
  - `APP_API_BASE_URL`: API base URL used at build time by Vite (e.g. `https://server.example.com/api`)
  - `HOSTNAME`: EC2 public IP or DNS
  - `USER_NAME`: SSH username (e.g. `ubuntu`)
  - `PRIVATE_KEY`: SSH private key for EC2 (PEM contents)
  - `TOKEN`: GitHub token with read access to this repo (for remote clone)

- AWS prerequisites (on your EC2)
  - Docker and Docker Compose installed
  - AWS CLI installed and accessible
  - `git` installed
  - Security Group allows inbound on port `3005` (or your chosen external port)
  - ECR repository exists: `zahn-frontend` (or update `ECR_REPOSITORY` in workflow)

- How the pipeline works
  1. On push to `main`, GitHub builds the Docker image.
  2. It passes `APP_API_BASE_URL` to `Dockerfile` as build arg (`VITE_APP_API_BASE_URL`) so API URL is baked into the static bundle.
  3. Image is pushed to ECR with tag `${{ github.run_number }}`.
  4. EC2 is accessed via SSH; repo is cloned; `docker-compose.yml` image placeholder is replaced with the ECR image URL.
  5. `docker compose up -d` runs the container mapping `3005 -> 80`.

- Local testing
  - Build the image: `docker build --build-arg VITE_APP_API_BASE_URL=https://your-api.example.com/api -t zahn-frontend:local .`
  - Run: `docker run -p 3005:80 zahn-frontend:local`
  - Visit: `http://localhost:3005`

Notes
- Vite env vars (`VITE_*`) are evaluated at build time. Use `APP_API_BASE_URL` secret to set `VITE_APP_API_BASE_URL` during the CI build.
- If you need to change repository or ports, update `env` in `.github/workflows/main.yml` and `docker-compose.yml` accordingly.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
