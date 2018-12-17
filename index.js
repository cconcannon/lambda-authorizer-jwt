const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const keyClient = jwksClient({
    cache: true,
    cacheMaxAge: 86400000, //value in ms
    rateLimit: true,
    jwksRequestsPerMinute: 10,
    strictSsl: true,
    jwksUri: process.env.JWKS_URI
})

const verificationOptions = {
    // verify claims, e.g.
    // "audience": "urn:audience"
    "algorithms": "RS256"
}

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
    if (e.authorizationToken && e.authorizationToken.split(' ')[0] === 'Bearer') {
        return e.authorizationToken.split(' ')[1];
    } else {
        return e.authorizationToken;
    }
}

function validateToken(token, callback) {
    jwt.verify(token, getSigningKey, verificationOptions, function (error) {
        if (error) {
            callback("Unauthorized")
        } else {
            callback(null, allow)
        }
    })
}

exports.handler = (event, context, callback) => {
    let token = extractTokenFromHeader(event) || '';
    validateToken(token, callback);
}
