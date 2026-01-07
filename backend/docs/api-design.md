# 2️⃣ API Design

We follow **thin, deterministic, sync-aware principles**.

---

### **Auth APIs**

| Method | Endpoint      | Request Body                    | Response                        |
| ------ | ------------- | ------------------------------- | ------------------------------- |
| POST   | /auth/login   | `{ email, password, deviceId }` | `{ accessToken, refreshToken }` |
| POST   | /auth/refresh | `{ refreshToken }`              | `{ accessToken, refreshToken }` |

---

### **Task APIs**

| Method | Endpoint   | Request Body                                 | Response            |
| ------ | ---------- | -------------------------------------------- | ------------------- |
| GET    | /tasks     | Query: tenantId                              | `[tasks...]`        |
| POST   | /tasks     | `{ title, description, status }`             | `{ task }`          |
| PUT    | /tasks/:id | `{ title?, description?, status?, version }` | `{ task }`          |
| DELETE | /tasks/:id | `{ version }`                                | `{ success: true }` |

---

### **Form APIs**

| Method | Endpoint   | Request Body                  | Response            |
| ------ | ---------- | ----------------------------- | ------------------- |
| GET    | /forms     | Query: tenantId, taskId       | `[forms...]`        |
| POST   | /forms     | `{ name, taskId?, fields }`   | `{ form }`          |
| PUT    | /forms/:id | `{ name?, fields?, version }` | `{ form }`          |
| DELETE | /forms/:id | `{ version }`                 | `{ success: true }` |

---

### **Sync APIs (Offline-First)**

#### **Push Changes (Client → Server)**

```
POST /sync/push
```

Request:

```json
{
  "deviceId": "abc123",
  "changes": [
    {
      "entity": "task",
      "operation": "UPDATE",
      "entityId": "uuid-task-1",
      "version": 3,
      "payload": { "status": "completed" }
    },
    {
      "entity": "form",
      "operation": "INSERT",
      "entityId": "uuid-form-1",
      "version": 1,
      "payload": { "name": "Inspection Form", "fields": [ ... ] }
    }
  ]
}
```

Response:

```json
{
  "results": [
    { "entityId": "uuid-task-1", "success": true },
    { "entityId": "uuid-form-1", "success": true }
  ]
}
```

---

#### **Pull Deltas (Server → Client)**

```
GET /sync/pull?since=2026-01-01T00:00:00Z
```

Response:

```json
{
  "updates": [
    { "entity": "task", "entityId": "uuid-task-2", "payload": { "status": "in_progress" }, "version": 2 },
    { "entity": "form", "entityId": "uuid-form-3", "payload": { "fields": [ ... ] }, "version": 1 }
  ],
  "deletes": [
    { "entity": "task", "entityId": "uuid-task-4", "version": 3 }
  ],
  "serverTimestamp": "2026-01-02T12:00:00Z"
}
```

---

### **Conflict Response**

```json
{
  "conflict": true,
  "entity": "task",
  "serverRecord": { "status": "completed", "version": 4 },
  "clientRecord": { "status": "in_progress", "version": 3 }
}
```
