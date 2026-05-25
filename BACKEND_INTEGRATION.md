# GrowBolt SDK - Backend Integration Guide

## Overview

This guide provides complete backend integration instructions for implementing the GrowBolt Web SDK.

---

## Backend Requirements

Your backend must implement a single endpoint to support SDK initialization:

- **Method:** `POST`
- **Path:** `/sdk/init` (or custom path)
- **CORS:** Must allow credentials and publisher domain

---

## Endpoint Specification

### Request

```
POST /sdk/init
Host: api.yourdomain.com
Content-Type: application/json
Origin: https://publisher.example.com

{
  "apiKey": "pk_live_1234567890abcdef",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Response (Success)

```http
HTTP/1.1 200 OK
Content-Type: application/json
Access-Control-Allow-Credentials: true
Access-Control-Allow-Origin: https://publisher.example.com

{
  "ok": true,
  "publisherConfig": {
    "offerwallUrl": "https://offerwall.example.com/pub/12345?session=abc123",
    "widgetSettings": {
      "width": 900,
      "height": 600,
      "placement": "bottom-right"
    },
    "customization": {
      "theme": "light",
      "colors": {
        "primary": "#007bff",
        "secondary": "#6c757d"
      }
    }
  }
}
```

### Response (Error)

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": "Invalid API key format"
}
```

---

## Implementation Examples

### Node.js / Express

```javascript
const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());

// CORS configuration - IMPORTANT for browser requests
const corsOptions = {
  origin: (origin, callback) => {
    // Allow specific publisher domains in production
    const allowedOrigins = [
      'https://publisher1.example.com',
      'https://publisher2.example.com',
      'http://localhost:3000', // Development
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  optionsSuccessStatus: 200
};

app.options('/sdk/init', cors(corsOptions));

app.post('/sdk/init', cors(corsOptions), async (req, res) => {
  try {
    const { apiKey, sessionId } = req.body;

    // 1. Validate input
    if (!apiKey || !sessionId) {
      return res.status(400).json({
        error: 'Missing apiKey or sessionId'
      });
    }

    // 2. Validate API key format
    if (!apiKey.startsWith('pk_') || apiKey.length < 20) {
      return res.status(400).json({
        error: 'Invalid API key format'
      });
    }

    // 3. Validate session ID format (UUID v4)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(sessionId)) {
      return res.status(400).json({
        error: 'Invalid session ID format'
      });
    }

    // 4. Lookup publisher in database
    const publisher = await Publisher.findByApiKey(apiKey);
    if (!publisher) {
      return res.status(401).json({
        error: 'API key not found'
      });
    }

    // 5. Check publisher is active
    if (publisher.status !== 'active') {
      return res.status(403).json({
        error: 'Publisher is not active'
      });
    }

    // 6. Create session in database
    const session = await Session.create({
      sessionId,
      publisherId: publisher.id,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    // 7. Generate offerwall URL with session token
    const sessionToken = jwt.sign(
      {
        sessionId,
        publisherId: publisher.id,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const offerwallUrl = new URL('https://offerwall.growbolt.com');
    offerwallUrl.searchParams.append('token', sessionToken);
    offerwallUrl.searchParams.append('publisherId', publisher.id);

    // 8. Set secure HttpOnly cookie for additional security
    res.cookie('growbolt_session', sessionToken, {
      httpOnly: true,        // Cannot be accessed via JavaScript
      secure: true,          // Only sent over HTTPS
      sameSite: 'Lax',      // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      domain: getPublisherDomain(req.origin)
    });

    // 9. Return successful response
    return res.status(200).json({
      ok: true,
      publisherConfig: {
        offerwallUrl: offerwallUrl.toString(),
        widgetSettings: {
          width: 900,
          height: 600,
          placement: 'center'
        },
        customization: {
          theme: publisher.theme || 'light',
          colors: publisher.colors || {
            primary: '#007bff',
            secondary: '#6c757d'
          }
        },
        // Include any publisher-specific settings
        publisherId: publisher.id,
        publisherName: publisher.name
      }
    });

  } catch (error) {
    console.error('SDK init error:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

### Python / Flask

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
import uuid
from datetime import datetime, timedelta
from urllib.parse import urlencode

app = Flask(__name__)

# CORS configuration
CORS(app, 
     origins=['https://publisher1.example.com', 'https://publisher2.example.com'],
     supports_credentials=True,
     methods=['POST', 'OPTIONS'],
     allow_headers=['Content-Type'])

@app.route('/sdk/init', methods=['POST', 'OPTIONS'])
def sdk_init():
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.get_json()
        api_key = data.get('apiKey')
        session_id = data.get('sessionId')
        
        # 1. Validate input
        if not api_key or not session_id:
            return jsonify({'error': 'Missing apiKey or sessionId'}), 400
        
        # 2. Validate API key format
        if not api_key.startswith('pk_') or len(api_key) < 20:
            return jsonify({'error': 'Invalid API key format'}), 400
        
        # 3. Validate session ID format (UUID v4)
        try:
            uuid.UUID(session_id, version=4)
        except ValueError:
            return jsonify({'error': 'Invalid session ID format'}), 400
        
        # 4. Lookup publisher
        publisher = Publisher.query.filter_by(api_key=api_key).first()
        if not publisher:
            return jsonify({'error': 'API key not found'}), 401
        
        # 5. Check publisher is active
        if publisher.status != 'active':
            return jsonify({'error': 'Publisher is not active'}), 403
        
        # 6. Create session
        session = Session(
            session_id=session_id,
            publisher_id=publisher.id,
            created_at=datetime.utcnow(),
            expires_at=datetime.utcnow() + timedelta(days=7),
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent')
        )
        db.session.add(session)
        db.session.commit()
        
        # 7. Generate JWT token
        token = jwt.encode({
            'session_id': session_id,
            'publisher_id': publisher.id,
            'exp': datetime.utcnow() + timedelta(days=7)
        }, app.config['JWT_SECRET'], algorithm='HS256')
        
        # 8. Build offerwall URL
        offerwall_params = {
            'token': token,
            'publisherId': publisher.id
        }
        offerwall_url = f"https://offerwall.growbolt.com?{urlencode(offerwall_params)}"
        
        # 9. Set secure cookie
        response = jsonify({
            'ok': True,
            'publisherConfig': {
                'offerwallUrl': offerwall_url,
                'widgetSettings': {
                    'width': 900,
                    'height': 600,
                    'placement': 'center'
                },
                'customization': {
                    'theme': publisher.theme or 'light',
                    'colors': publisher.colors or {
                        'primary': '#007bff',
                        'secondary': '#6c757d'
                    }
                },
                'publisherId': publisher.id,
                'publisherName': publisher.name
            }
        })
        
        response.set_cookie(
            'growbolt_session',
            token,
            httponly=True,
            secure=True,
            samesite='Lax',
            max_age=7*24*60*60
        )
        
        return response, 200
        
    except Exception as e:
        app.logger.error(f'SDK init error: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(port=3000, debug=False)
```

### Java / Spring Boot

```java
@RestController
@RequestMapping("/sdk")
@CrossOrigin(
    origins = {"https://publisher1.example.com", "https://publisher2.example.com"},
    allowCredentials = "true",
    methods = {RequestMethod.POST, RequestMethod.OPTIONS}
)
public class SDKController {
    
    @Autowired
    private PublisherService publisherService;
    
    @Autowired
    private SessionService sessionService;
    
    @PostMapping("/init")
    public ResponseEntity<?> initSDK(@RequestBody SDKInitRequest request) {
        try {
            String apiKey = request.getApiKey();
            String sessionId = request.getSessionId();
            
            // 1. Validate input
            if (apiKey == null || sessionId == null) {
                return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Missing apiKey or sessionId"));
            }
            
            // 2. Validate API key format
            if (!apiKey.startsWith("pk_") || apiKey.length() < 20) {
                return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Invalid API key format"));
            }
            
            // 3. Validate session ID format (UUID v4)
            try {
                UUID.fromString(sessionId);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Invalid session ID format"));
            }
            
            // 4. Lookup publisher
            Publisher publisher = publisherService.findByApiKey(apiKey);
            if (publisher == null) {
                return ResponseEntity.status(401)
                    .body(new ErrorResponse("API key not found"));
            }
            
            // 5. Check publisher is active
            if (!publisher.isActive()) {
                return ResponseEntity.status(403)
                    .body(new ErrorResponse("Publisher is not active"));
            }
            
            // 6. Create session
            Session session = new Session();
            session.setSessionId(sessionId);
            session.setPublisherId(publisher.getId());
            session.setCreatedAt(LocalDateTime.now());
            session.setExpiresAt(LocalDateTime.now().plusDays(7));
            sessionService.save(session);
            
            // 7. Generate JWT token
            String token = Jwts.builder()
                .setSubject(sessionId)
                .claim("publisherId", publisher.getId())
                .setExpiration(new Date(System.currentTimeMillis() + 7*24*60*60*1000))
                .signWith(SignatureAlgorithm.HS512, jwtSecret)
                .compact();
            
            // 8. Build offerwall URL
            String offerwallUrl = "https://offerwall.growbolt.com?" +
                "token=" + token +
                "&publisherId=" + publisher.getId();
            
            // 9. Build response
            SDKInitResponse response = new SDKInitResponse();
            response.setOk(true);
            
            PublisherConfig config = new PublisherConfig();
            config.setOfferwallUrl(offerwallUrl);
            config.setWidgetSettings(new WidgetSettings(900, 600, "center"));
            config.setPublisherId(publisher.getId());
            config.setPublisherName(publisher.getName());
            
            response.setPublisherConfig(config);
            
            return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, 
                    "growbolt_session=" + token + 
                    "; HttpOnly; Secure; SameSite=Lax; Max-Age=" + (7*24*60*60))
                .body(response);
            
        } catch (Exception e) {
            logger.error("SDK init error", e);
            return ResponseEntity.status(500)
                .body(new ErrorResponse("Internal server error"));
        }
    }
}

@Data
class SDKInitRequest {
    private String apiKey;
    private String sessionId;
}

@Data
class SDKInitResponse {
    private boolean ok;
    private PublisherConfig publisherConfig;
}

@Data
class PublisherConfig {
    private String offerwallUrl;
    private WidgetSettings widgetSettings;
    private Long publisherId;
    private String publisherName;
}

@Data
@AllArgsConstructor
class WidgetSettings {
    private int width;
    private int height;
    private String placement;
}
```

---

## Security Checklist

- [ ] **HTTPS Only** - Use TLS for all endpoints
- [ ] **API Key Validation** - Check key exists and belongs to active publisher
- [ ] **Session ID Validation** - Verify UUID v4 format and uniqueness
- [ ] **CORS Configuration** - Only allow trusted publisher domains
- [ ] **Rate Limiting** - Limit requests per IP/publisher to prevent abuse
- [ ] **HttpOnly Cookies** - Set authentication tokens as HttpOnly
- [ ] **Secure Flag** - Set Secure flag on cookies for HTTPS
- [ ] **SameSite Cookie** - Use SameSite=Lax to prevent CSRF
- [ ] **Input Sanitization** - Validate all request data
- [ ] **Error Logging** - Log security events (failed auth, suspicious patterns)
- [ ] **JWT Expiration** - Short-lived tokens (7 days max)
- [ ] **Database Validation** - Validate data integrity at database layer

---

## Error Handling

### Validation Errors (400)

```json
{
  "error": "Invalid API key format"
}
```

**Common causes:**
- Missing apiKey or sessionId
- apiKey doesn't start with "pk_"
- sessionId is not valid UUID v4

### Authentication Errors (401)

```json
{
  "error": "API key not found"
}
```

**Causes:**
- API key doesn't exist in database
- API key revoked

### Authorization Errors (403)

```json
{
  "error": "Publisher is not active"
}
```

**Causes:**
- Publisher account suspended
- Publisher quota exceeded
- Publisher API key disabled

### Server Errors (500)

```json
{
  "error": "Internal server error"
}
```

---

## Testing the Endpoint

### Using curl

```bash
curl -X POST https://api.example.com/sdk/init \
  -H "Content-Type: application/json" \
  -H "Origin: https://publisher.example.com" \
  -d '{
    "apiKey": "pk_live_1234567890abcdef",
    "sessionId": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

### Using Node.js

```javascript
const response = await fetch('https://api.example.com/sdk/init', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    apiKey: 'pk_live_1234567890abcdef',
    sessionId: '550e8400-e29b-41d4-a716-446655440000'
  })
});

const data = await response.json();
console.log(data);
```

### Using Python

```python
import requests
import json

response = requests.post(
    'https://api.example.com/sdk/init',
    json={
        'apiKey': 'pk_live_1234567890abcdef',
        'sessionId': '550e8400-e29b-41d4-a716-446655440000'
    },
    headers={'Content-Type': 'application/json'}
)

print(response.json())
```

---

## Database Schema

### Publishers Table

```sql
CREATE TABLE publishers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  api_key VARCHAR(50) UNIQUE NOT NULL,
  status ENUM('active', 'suspended', 'deleted') DEFAULT 'active',
  theme VARCHAR(50) DEFAULT 'light',
  colors JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_api_key ON publishers(api_key);
```

### Sessions Table

```sql
CREATE TABLE sessions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  session_id VARCHAR(36) UNIQUE NOT NULL,
  publisher_id BIGINT NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  FOREIGN KEY (publisher_id) REFERENCES publishers(id),
  KEY idx_session_id (session_id),
  KEY idx_publisher_id (publisher_id),
  KEY idx_expires_at (expires_at)
);

-- Auto-clean expired sessions
DELETE FROM sessions WHERE expires_at < NOW();
```

---

## Monitoring & Metrics

### Key Metrics to Track

- **Request Rate**: Requests per second per publisher
- **Error Rate**: 400/401/403/500 errors
- **Response Time**: P50, P95, P99 latencies
- **Session Creation Rate**: New sessions per day
- **Failed Authentications**: API key lookup failures
- **CORS Rejections**: Origin mismatch rejections

### Alerting Rules

```
Alert if:
- Error rate > 5%
- Response time P95 > 500ms
- Request rate drops by 50% (possible outage)
- Database connection pool exhausted
```

---

## Deployment Checklist

- [ ] Environment variables configured (JWT_SECRET, CORS_ORIGINS)
- [ ] Database migrations executed
- [ ] SSL/TLS certificates valid
- [ ] Rate limiting enabled
- [ ] Monitoring and logging configured
- [ ] Backup and recovery tested
- [ ] Load testing completed
- [ ] Security audit passed
- [ ] CORS headers tested with actual publisher domains
- [ ] Cookie security tested (HttpOnly, Secure, SameSite)

---

## Support

For questions or issues with backend integration:
- Check error logs for detailed failure reasons
- Verify CORS headers are correct
- Ensure JWT secret is consistent across restarts
- Check database connectivity and permissions
- Review rate limiting configuration
