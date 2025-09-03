# Copilot Instructions for SoftAuth Codebase

These instructions are intended to help AI coding agents quickly become productive in the SoftAuth project.

## Overview
- The project is a modern, server-side rendered React application built with Next.js.
- It includes user authentication and TOTP management (using libraries like `speakeasy` and `qrcode`).
- The application is containerized with Docker and has AWS Serverless (Lambda, API Gateway, CloudFormation) deployment instructions outlined in `ARCHITECTURE.md`.

## Architecture & Key Components
- **Next.js Pages**: Found in the `/pages` directory. These handle SSR and routing.
- **API Routes**: Implemented as Next.js API endpoints for login and TOTP functionalities.
- **Docker Integration**: The `Dockerfile` defines how to build and run the container.
- **CloudFormation**: Refer to `ARCHITECTURE.md` for AWS Serverless deployment and CloudFormation configuration.

## Developer Workflows
- **Development**: Run `npm run dev` for local development.
- **Building/Production**: Use `npm run build` and `npm start` for production builds.
- **Containerization**: Build and run the Docker container as specified in the `Dockerfile`.

## Project-Specific Conventions
- **Routing & Pages**: SSR is keyword; patterns in `/pages` follow Next.js conventions.
- **Authentication & TOTP**: Authentication endpoints and TOTP logic are integrated via API routes and helper functions (likely in a future `/lib` or `/components` directory).
- **Configuration Files**: Key setup files include `package.json`, `Dockerfile`, and `ARCHITECTURE.md` which outline project dependencies and architectural decisions.

## Integration Points
- **External Dependencies**: Uses `speakeasy` for TOTP and `qrcode` for generating QR codes.
- **AWS Serverless**: CloudFormation template provided in `ARCHITECTURE.md` for deploying the Lambda function, API Gateway, and related resources.

Please review these instructions and let me know if any sections need further detail or clarification.
