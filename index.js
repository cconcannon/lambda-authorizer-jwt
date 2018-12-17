const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const keyClient = jwksClient({
    cache: true,
    cacheMaxAge: 86400000, //value in ms
    rateLimit: true,
    jwksRequestsPerMinute: 10,
    strictSsl: true,
    jwksUri: 'https://sso.connect.pingidentity.com/sso/as/jwks'
})

process.env.TZ = 'America/Los_Angeles';

const allow = {
    "principalId": "user",
    "policyDocument": {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Action": "execute-api:Invoke",
                "Effect": "Allow",
                "Resource": process.env.RESOURCE
            }
        ]
    }
}

function getSigningKey (header = decoded.header, callback) {
    keyClient.getSigningKey(header.kid, function(err, key) {
        const signingKey = key.publicKey || key.rsaPublicKey;
        callback(null, signingKey);
    })
}

function extractTokenFromHeader(e) {
    if (event.authorizationToken && event.authorizationToken.split(' ')[0] === 'Bearer') {
        return event.authorizationToken.split(' ')[1];
    }
}

function validateToken(token) {
    const verificationOptions = {
        // issuer and/or audience should most definitely be verified
        // "issuer": "urn:issuer",
        // "audience": "urn:audience"
        "algorithms": "RS256"
    }

    let result = {};
    result.status = 0;
    
    jwt.verify(token, getSigningKey, verificationOptions, function(error, decoded) {
        if (error) {
            result.status = 403;
            result.body = JSON.stringify(error);
        } else {
            result.status = 200;
            result.body = JSON.stringify(decoded)
        }
        return result;
    })
}
exports.handler = (event, context, callback) => {
    let token = extractTokenFromHeader(event) || '';
    
    validateToken(token);
}
