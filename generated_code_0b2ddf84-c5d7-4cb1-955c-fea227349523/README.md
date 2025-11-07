# Spring Boot Application Archetype

A comprehensive Spring Boot 3.5.5 archetype with Java 21, PostgreSQL, JPA, Flyway migrations, and clean architecture patterns.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Architecture Guide](#architecture-guide)
- [Development Guidelines](#development-guidelines)
- [API Examples](#api-examples)
- [Database Migrations](#database-migrations)
- [Configuration](#configuration)
- [Best Practices](#best-practices)
- [Contributing](#contributing)

## 🚀 Overview

This archetype provides a ready-to-use Spring Boot application structure that follows industry best practices and clean architecture principles. It's designed to help developers quickly set up new projects with a solid foundation.

## ✨ Features

- **Spring Boot 3.5.5** with Java 21
- **PostgreSQL** database with JPA/Hibernate
- **Flyway** database migrations
- **Lombok** for reducing boilerplate code
- **Spring Boot Actuator** for monitoring
- **Layered Architecture** (Controller → Service → Repository → Entity)
- **DTO Pattern** for API contracts
- **Comprehensive Examples** for each layer
- **Production-Ready Configuration**

## 📁 Project Structure

```
src/
├── main/
│   ├── java/com/example/demo/
│   │   ├── DemoApplication.java          # Main application class
│   │   ├── controller/                   # REST Controllers
│   │   │   └── UserController.java       # Example controller
│   │   ├── dto/                         # Data Transfer Objects
│   │   │   ├── CreateUserRequest.java    # Request DTO
│   │   │   ├── UpdateUserRequest.java    # Update DTO
│   │   │   └── UserResponse.java         # Response DTO
│   │   ├── entity/                      # JPA Entities
│   │   │   ├── User.java                # Example entity
│   │   │   └── Order.java               # Related entity example
│   │   ├── enums/                       # Enum definitions
│   │   │   ├── UserStatus.java          # User status enum
│   │   │   └── OrderStatus.java         # Order status enum
│   │   ├── repository/                  # Data Access Layer
│   │   │   └── UserRepository.java      # Example repository
│   │   └── service/                     # Business Logic Layer
│   │       └── UserService.java        # Example service
│   └── resources/
│       ├── application.properties       # Application configuration
│       └── db/migration/               # Flyway migrations
│           ├── V1__Create_users_table.sql
│           ├── V2__Add_user_search_indexes.sql
│           └── V3__Create_orders_table.sql
└── test/                               # Test classes
```

## 🏁 Getting Started

### Quick Start
1. **Clone or use this archetype**
2. **Configure your database** in `application.properties`
3. **Run the application**: `./mvnw spring-boot:run`
4. **Test the API**: `curl http://localhost:8080/api/users`

For detailed setup instructions, see [QUICKSTART.md](QUICKSTART.md).

## 🏗️ Architecture Guide

This application follows a **layered architecture** pattern:

### 1. **Controller Layer** (`/controller`)
- Handles HTTP requests and responses
- Validates input data
- Maps DTOs to/from service layer
- Returns appropriate HTTP status codes

### 2. **Service Layer** (`/service`)
- Contains business logic
- Orchestrates operations between repositories
- Handles transactions
- Performs data transformations

### 3. **Repository Layer** (`/repository`)
- Data access abstraction
- Database operations through JPA
- Custom queries when needed

### 4. **Entity Layer** (`/entity`)
- JPA entity definitions
- Database table mappings
- Relationships between entities

### 5. **DTO Layer** (`/dto`)
- API contracts (Request/Response objects)
- Input validation
- Data transfer between layers

### 6. **Enums** (`/enums`)
- Type-safe constants
- Business domain values
- Status definitions

For detailed architecture information, see [ARCHETYPE.md](ARCHETYPE.md).

## 🛠️ Development Guidelines

### Creating a New Feature

Follow this order when implementing new features:

1. **Entity** → Define your data model
2. **Migration** → Create database schema
3. **Repository** → Data access interface
4. **DTOs** → API contracts
5. **Service** → Business logic
6. **Controller** → REST endpoints
7. **Tests** → Comprehensive testing

### Example Implementation

```java
// 1. Entity
@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;
}

// 2. Repository
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Page<Product> findByNameContainingIgnoreCase(String name, Pageable pageable);
}

// 3. Service
@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    
    public ProductResponse createProduct(CreateProductRequest request) {
        // Business logic here
    }
}

// 4. Controller
@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService productService;
    
    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(@RequestBody CreateProductRequest request) {
        // Controller logic here
    }
}
```

## 📝 API Examples

### User Management APIs

```bash
# Create User
POST /api/users
{
  "firstName": "John",
  "lastName": "Doe", 
  "email": "john.doe@example.com",
  "phoneNumber": "555-1234"
}

# Get All Users (with pagination)
GET /api/users?page=0&size=10&sort=createdAt,desc

# Get User by ID
GET /api/users/1

# Update User
PUT /api/users/1
{
  "firstName": "Jane",
  "phoneNumber": "555-5678"
}

# Delete User
DELETE /api/users/1

# Search Users
GET /api/users/search?q=john

# Get Recent Users
GET /api/users/recent
```

## 🗃️ Database Migrations

Flyway migrations follow this naming convention:
- `V{version}__{description}.sql`
- Example: `V1__Create_users_table.sql`

### Migration Examples

```sql
-- V1__Create_users_table.sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

## ⚙️ Configuration

### Database Configuration
```properties
# PostgreSQL Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/your_database
spring.datasource.username=your_username
spring.datasource.password=your_password

# JPA Configuration
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false

# Flyway Configuration
spring.flyway.locations=classpath:db/migration
spring.flyway.baseline-on-migrate=true
```

### Development vs Production
- **Development**: Use `spring.jpa.show-sql=true` for SQL logging
- **Production**: Set `spring.jpa.show-sql=false` and configure proper logging levels

## 📚 Best Practices

### Code Organization
- ✅ Follow package-by-layer structure
- ✅ Use consistent naming conventions
- ✅ Implement proper exception handling
- ✅ Add comprehensive logging
- ✅ Write meaningful tests

### Database
- ✅ Always use migrations for schema changes
- ✅ Add appropriate indexes for performance
- ✅ Use proper constraints and validations
- ✅ Document complex queries

### API Design
- ✅ Use proper HTTP status codes
- ✅ Implement pagination for collections
- ✅ Validate input data
- ✅ Return consistent response formats
- ✅ Handle errors gracefully

### Security
- ✅ Never expose entities directly in APIs
- ✅ Use DTOs for data transfer
- ✅ Validate all inputs
- ✅ Implement proper authentication/authorization
- ✅ Log security events

## 🤝 Contributing

1. Follow the established architecture patterns
2. Add tests for new features
3. Update documentation
4. Follow the coding standards
5. Create meaningful commit messages

---

## 📄 Additional Documentation

- [Detailed Architecture Guide](ARCHETYPE.md)
- [Quick Start Guide](QUICKSTART.md)
- [API Documentation](http://localhost:8080/actuator/mappings) (when running)

This archetype provides everything you need to build robust, scalable Spring Boot applications. Happy coding! 🚀
