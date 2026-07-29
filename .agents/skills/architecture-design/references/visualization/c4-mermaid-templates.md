# C4 Mermaid Templates

Ready-to-use C4 diagram templates in mermaid syntax. Copy and adapt.

## Level 1 — System Context

Shows the system in scope and its relationships with users and external systems.

```mermaid
graph TD
    User["👤 User"] -->|"Uses"| System["🏢 System Name<br/><i>Description</i>"]
    System -->|"Sends emails via"| Email["📧 Email Service<br/><i>External</i>"]
    System -->|"Reads data from"| ExtAPI["🌐 External API<br/><i>External</i>"]
    Admin["👤 Admin"] -->|"Manages"| System
```

**Guidelines:**
- Include ALL users (human actors) and external systems
- Show high-level relationships only (no protocols)
- Target audience: everyone including non-technical stakeholders

---

## Level 2 — Container Diagram

Shows the deployable units inside the system boundary.

```mermaid
graph TD
    subgraph SystemBoundary["System Boundary"]
        WebApp["🌐 Web App<br/><i>React / Next.js</i>"]
        API["⚙️ API Server<br/><i>Node.js / Express</i>"]
        Worker["⏱️ Background Worker<br/><i>Node.js</i>"]
        DB[("🗄️ Database<br/><i>PostgreSQL</i>")]
        Cache[("⚡ Cache<br/><i>Redis</i>")]
        Queue["📨 Message Queue<br/><i>RabbitMQ</i>"]
    end

    User["👤 User"] -->|"HTTPS"| WebApp
    WebApp -->|"REST/JSON"| API
    API --> DB
    API --> Cache
    API -->|"Publishes"| Queue
    Queue -->|"Consumes"| Worker
    Worker --> DB
    API -->|"SMTP"| Email["📧 Email<br/><i>External</i>"]
```

**Guidelines:**
- Show technology choices (framework, language, DB engine)
- Show communication protocols (REST, gRPC, AMQP, SQL)
- One container per deployable unit (not per code module)

---

## Level 3 — Component Diagram

Shows the internal components of a single container.

```mermaid
graph TD
    subgraph APIServer["API Server Container"]
        Router["🔀 Router<br/><i>Express middleware</i>"]
        AuthCtrl["🔐 Auth Controller"]
        OrderCtrl["📦 Order Controller"]
        UserCtrl["👤 User Controller"]
        AuthSvc["Auth Service"]
        OrderSvc["Order Service"]
        UserSvc["User Service"]
        OrderRepo["Order Repository"]
        UserRepo["User Repository"]
    end

    Router --> AuthCtrl
    Router --> OrderCtrl
    Router --> UserCtrl
    AuthCtrl --> AuthSvc
    OrderCtrl --> OrderSvc
    UserCtrl --> UserSvc
    OrderSvc --> OrderRepo
    UserSvc --> UserRepo
    OrderRepo --> DB[("🗄️ Database")]
    UserRepo --> DB
    AuthSvc --> Cache[("⚡ Redis")]
```

**Guidelines:**
- One component diagram per critical container (not every container)
- Show internal responsibilities and their dependencies
- Target audience: developers working on this container

---

## Level 4 — Code Diagram (Use Sparingly)

Class/entity relationship diagram for critical domain models only.

```mermaid
classDiagram
    class Order {
        +String id
        +OrderStatus status
        +List~LineItem~ items
        +Money total
        +place()
        +cancel()
        +complete()
    }

    class LineItem {
        +String productId
        +int quantity
        +Money unitPrice
        +Money subtotal()
    }

    class OrderStatus {
        <<enumeration>>
        DRAFT
        PLACED
        PAID
        SHIPPED
        COMPLETED
        CANCELLED
    }

    Order "1" --> "*" LineItem
    Order --> OrderStatus
```

**Guidelines:**
- Use ONLY for critical domain models or complex design patterns
- Skip for CRUD entities with no business logic
- Keep to 5-10 classes maximum per diagram

---

## Supplementary Diagram Types

### Sequence Diagram (for flows)

```mermaid
sequenceDiagram
    actor User
    participant Web as Web App
    participant API as API Server
    participant DB as Database
    participant Queue as Message Queue
    participant Worker as Worker

    User->>Web: Submit Order
    Web->>API: POST /orders
    API->>DB: INSERT order
    API->>Queue: Publish OrderCreated
    API-->>Web: 201 Created
    Web-->>User: Order Confirmed
    Queue->>Worker: Consume OrderCreated
    Worker->>DB: UPDATE inventory
```

### Data Flow Diagram

```mermaid
flowchart LR
    ExtUser["🧑 External User"] -->|"HTTP Request"| LB["Load Balancer"]
    LB --> API["API Server"]
    API -->|"Read/Write"| DB[("Primary DB")]
    DB -->|"Replicate"| Replica[("Read Replica")]
    API -->|"Cache"| Redis[("Redis")]
    API -->|"Events"| Kafka["Kafka"]
    Kafka --> Analytics["Analytics Pipeline"]
    Kafka --> Notifications["Notification Service"]
```

### Deployment Diagram

```mermaid
graph TD
    subgraph Cloud["☁️ Cloud Provider"]
        subgraph AZ1["Availability Zone 1"]
            LB["🔀 Load Balancer"]
            App1["⚙️ App Instance 1"]
            DB_Primary[("🗄️ DB Primary")]
        end
        subgraph AZ2["Availability Zone 2"]
            App2["⚙️ App Instance 2"]
            DB_Replica[("🗄️ DB Replica")]
        end
        CDN["🌐 CDN"]
    end

    User["👤 User"] --> CDN
    CDN --> LB
    LB --> App1
    LB --> App2
    App1 --> DB_Primary
    App2 --> DB_Primary
    DB_Primary -.->|"Replicate"| DB_Replica
```
