# API Surface Discovery: [System/Service Name]

**Purpose**: Map public API endpoints, data flows, authentication mechanisms  
**Use When**: Integration tasks, API client development, understanding service contracts

---

## API Overview
- **Base URL**: `[http://api.example.com/v1]`
- **Protocol**: [REST / GraphQL / gRPC / WebSocket]
- **Documentation**: `[OpenAPI spec file / GraphQL schema location]`

## Public Endpoints

### [Endpoint Category: e.g., Authentication]
#### `[METHOD] [/path]` - [Purpose]
- **Implementation**: `[file:line]`
- **Input**: 
  ```[format]
  {
    "field": "type - description"
  }
  ```
- **Output**:
  ```[format]
  {
    "field": "type - description"
  }
  ```
- **Status Codes**: `[200, 400, 401, 500]` - [What each means]
- **Rate Limit**: `[N requests per time period]`

### [Another Category]
#### `[METHOD] [/path]` - [Purpose]
[Same structure as above]

## Authentication/Authorization

### Mechanism
- **Type**: [JWT / OAuth 2.0 / API Key / Session Cookie]
- **Implementation**: `[file:line]`
- **Token Location**: [Header / Query param / Cookie]
- **Token Format**: `[Bearer <token>]`

### Authorization Rules
- **[Role/Permission]**: Can access `[endpoints]`
- **[Role/Permission]**: Can access `[endpoints]`

### Implementation Files
- **Auth Middleware**: `[file:line]`
- **Token Validation**: `[file:line]`
- **Permission Checks**: `[file:line]`

## Data Flow

```
[Request] → [Middleware Chain] → [Route Handler] → [Service Layer] → [Data Layer] → [Response]
```

### Detailed Flow for [Example Endpoint]
1. **Request Entry**: `[file:line]` - [Router/controller]
2. **Validation**: `[file:line]` - [Input validation]
3. **Business Logic**: `[file:line]` - [Service/use case]
4. **Data Access**: `[file:line]` - [Repository/ORM]
5. **Response Formatting**: `[file:line]` - [Serializer/formatter]

## Error Handling

### Error Response Format
```[format]
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  }
}
```

### Error Types & Sources
| Error Code | HTTP Status | Source File | Trigger Condition |
|------------|-------------|-------------|-------------------|
| [CODE] | [4xx/5xx] | `[file:line]` | [When it occurs] |

## Middleware Stack

Execution order (request flows through these):
1. **[Middleware Name]** (`[file:line]`) - [Purpose: logging, CORS, etc.]
2. **[Middleware Name]** (`[file:line]`) - [Purpose]
3. **[Middleware Name]** (`[file:line]`) - [Purpose]

## Data Models/Schemas

### [Model Name]
```[language]
{
  field: Type // Description, validation rules
  field2: Type // Description
}
```
- **Validation**: `[file:line]`
- **Serialization**: `[file:line]`
- **Database Mapping**: `[table/collection name]`

## Rate Limiting / Throttling
- **Implementation**: `[file:line]`
- **Limits**: `[N requests per window]`
- **Scope**: [Per IP / Per API key / Global]
- **Exceeded Behavior**: `[429 response / queue / reject]`

## Versioning
- **Strategy**: [URL path / Header / Content negotiation]
- **Current Version**: `[v1, v2, etc.]`
- **Deprecated Versions**: `[list]`
- **Migration Path**: `[v1 → v2 mapping guide location]`

## Client Integration Guide

### Quick Start
```[language]
// Example API call:
[Code snippet showing authentication and basic request]
```

### SDKs/Clients (if any)
- **[Language]**: `[package name or repo]`
- **[Language]**: `[package name or repo]`

### Common Integration Patterns
- **[Pattern]**: `[When to use]` - `[Implementation reference]`

## Testing Endpoints

### Test Data
- **Test accounts**: `[file or location]`
- **Seed data**: `[file or script]`

### How to Test Locally
```bash
# Start local API server:
[command]

# Example curl commands:
curl -X GET [endpoint] -H "Authorization: Bearer [token]"
```

## Confidence & Gaps
- **Confidence**: [High / Medium / Low]
- **Undocumented Endpoints**: [Routes found but not documented]
- **Deprecated APIs**: [Old endpoints still present]
- **Missing Information**: [What couldn't be determined]

---

**Next Steps**: Use endpoint details for integration, refer to data models for request/response structure.
