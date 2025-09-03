# SoftAuth Architecture and Instructions

## Overview

This project is a modern stack React application with server-side rendering (using Next.js) designed to support user authentication and TOTP management. The app allows users to login, add TOTP codes, generate QR codes, and view one-time passwords from the list of added codes.

## Folder Structure

```
/softauth
├── pages/             // Next.js pages for SSR
├── components/        // Reusable React components (e.g., Login, TOTP List, etc.)
├── styles/            // CSS/SCSS files
├── public/            // Static assets (images, fonts, etc.)
├── lib/               // Helper functions (e.g., TOTP generation, QR code utils)
├── Dockerfile         // Dockerfile for containerization
├── docker-compose.yml // (Optional) Docker Compose configuration
├── package.json       // Project dependencies and scripts
└── ARCHITECTURE.md    // This document
```

## Docker Container Architecture

- **Container Setup**: The application will run inside a Docker container with a Node.js environment, serving a Next.js server for SSR.
- **Dockerfile**: The Dockerfile will set up the Node.js environment, install dependencies, build the Next.js project, and start the server.
- **Docker Compose**: Optionally, a docker-compose.yml file can be provided to orchestrate the app along with any additional services.

## AWS Serverless Hosting

To host SoftAuth in AWS Serverless mode, you can deploy the application using AWS Lambda and API Gateway. This approach allows you to run your Next.js SSR application without managing servers. Static assets can be served from S3, while CloudFront can be used as a CDN.

### CloudFormation Configuration Example

Below is a sample CloudFormation template that provisions the necessary AWS resources:

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: CloudFormation template for SoftAuth Serverless Deployment

Parameters:
  LambdaMemorySize:
    Type: Number
    Default: 512
    Description: Memory size for the Lambda function
  LambdaTimeout:
    Type: Number
    Default: 10
    Description: Timeout in seconds for the Lambda function

Resources:
  SoftAuthLambdaFunction:
    Type: AWS::Lambda::Function
    Properties:
      FunctionName: SoftAuthFunction
      Handler: index.handler
      Runtime: nodejs18.x
      MemorySize: !Ref LambdaMemorySize
      Timeout: !Ref LambdaTimeout
      Code:
        S3Bucket: your-code-bucket
        S3Key: path/to/softauth.zip
      Role: arn:aws:iam::123456789012:role/your-lambda-role

  ApiGateway:
    Type: AWS::ApiGateway::RestApi
    Properties:
      Name: SoftAuthApi

  LambdaIntegration:
    Type: AWS::ApiGateway::Integration
    Properties:
      IntegrationHttpMethod: POST
      Type: AWS_PROXY
      Uri: !Sub arn:aws:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/${SoftAuthLambdaFunction.Arn}/invocations

  ApiDeployment:
    Type: AWS::ApiGateway::Deployment
    Properties:
      RestApiId: !Ref ApiGateway
      StageName: prod
    DependsOn: LambdaIntegration

Outputs:
  ApiUrl:
    Description: URL of the deployed API
    Value: !Sub 'https://${ApiGateway}.execute-api.${AWS::Region}.amazonaws.com/prod/'
```

### Deployment Steps

1. Package the application code as a zip file and upload it to an S3 bucket.
2. Create or update a CloudFormation stack using the provided template.
3. Configure API Gateway to integrate with the Lambda function.
4. Use CloudFront and Route 53 for static asset distribution and custom domain configuration, if needed.

## Next Steps

1. **Project Setup**: Initialize a Next.js project in the project directory.
2. **Authentication**: Implement login functionality (JWT or session-based).
3. **TOTP Management**: Develop features for adding TOTP codes, generating QR codes, and displaying one-time passwords.
4. **Dockerization**: Containerize the application using the Dockerfile (and docker-compose if needed).

## Development Instructions

- **Clone the Repository**: Clone the project and navigate into the project directory.
- **Install Dependencies**: Run `npm install` to install all required dependencies.
- **Development Mode**: Start the development server with `npm run dev`.
- **Production Build**: Build the project for production using `npm run build` and run it with `npm start`.
- **Docker Commands**: Refer to the Dockerfile and docker-compose.yml for container orchestration and deployment instructions.

---

This document serves as a blueprint for the application architecture and the initial steps to get started with development.
