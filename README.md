# JWT Token Lambda Authorizer
## Overview
This function uses the `jwks-rsa` and `jsonwebtoken` npm packages to implement token validation of JSON Web Tokens (JWTs). These tokens are granted by ID Providers using the OAuth2 protocol. 

The authorizer expects to find a JWT in the Authorization header.

The public RSA256 key(s) from the Identity Provider are fetched and cached. The JWT is then validated with the public RSA key without further HTTP calls. This means that there is no token introspection performed at the ID Provider server. This allows the authorizer to perform authorization based on signed, unexpired tokens that contain the required issuer and audience credentials per OIDC spec. This also enables extremely low latency times for invoking the AWS API Gateway calls to protected resources.

## Deployment
Upload the .zip file to AWS Lambda in the same region as the API Gateway resources you intend to protect with this authorizer.

## Configuration
Two environment variables must be set when you deploy the function to AWS:
- RESOURCE
    - the AWS arn for the API Gateway endpoint(s) you intend to secure with this Lambda Authorizer
- JWKS_URI
    - the uri to retrieve the public signing keys at your Identity Provider (this can usually be found at the OAuth2/OIDC server discovery endpoint)

## Additional Security
The function as-is will validate the JWT claims by checking the JWT signature against the IdP public RSA key. This provides assurance that the claims in the JWT can be trusted, but there is no logic that restricts access based on the JWT claims. 

**As-is, this function will allow access to the specified arn resource to any bearer of a valid JWT.**

**As-is, this function allows access to all users regardless of issuer, scope, and intended audience claims.**

It is best practice to implement fine-grained authorization to access protected resources based on these claims.

Refer to [AWS API Gateway Lambda Authorizers Documentation](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html) for more in-depth documentation about use of Lambda Authorizers.
