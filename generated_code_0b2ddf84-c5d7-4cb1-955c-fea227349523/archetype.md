# Spring Boot Application Archetype Guide

## Overview

This is a Spring Boot 3.5.5 application archetype with Java 21, PostgreSQL, JPA, Flyway migrations, and Lombok. It follows a clean layered architecture pattern for building REST APIs.

## Project Structure

```text
src/
├── main/
│   ├── java/com/example/demo/
│   │   ├── DemoApplication.java          # Main Spring Boot application class
│   │   ├── controller/                   # REST Controllers (API endpoints)
│   │   ├── dto/                          # Data Transfer Objects (Request/Response objects)
│   │   ├── entity/                       # JPA Entities (Database models)
│   │   ├── enums/                        # Enum definitions
│   │   ├── repository/                   # Data Access Layer (JPA Repositories)
│   │   └── service/                      # Business Logic Layer
│   └── resources/
│       ├── application.properties       # Application configuration
│       ├── db/migration/                # Flyway database migration scripts
│       ├── static/                      # Static web resources
│       └── templates/                   # Template files
└── test/                                # Test classes
```

## Architecture Layers

### 1. Controller Layer

- **Purpose**: Handle HTTP requests and responses
- **Responsibilities**:
  - Define REST endpoints
  - Validate request data
  - Call service layer methods
  - Return appropriate HTTP responses

**Example Structure:**

```java
@Slf4j
@RestController
@RequiredArgsConstructor
@Tag(name = "User Management", description = "APIs for managing users")
@RequestMapping("/api/users")
public class UserController {
    
    private final UserService userService;
    
    @Operation(summary = "Get all users", description = "Retrieve a paginated list of all users")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successful retrieval of users"),
        @ApiResponse(responseCode = "400", description = "Invalid request parameters"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping
    public ResponseEntity<Page<UserResponse>> getAllUsers(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<UserResponse> users = userService.getAllUsers(pageable);
        return ResponseEntity.ok(users);
    }

    @Operation(summary = "Get user by ID", description = "Retrieve a user by their ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successful retrieval of user"),
        @ApiResponse(responseCode = "404", description = "User not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Create a new user", description = "Create a new user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "User created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request data"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @PostMapping
    public ResponseEntity<UserResponse> createUser(@RequestBody CreateUserRequest request) {
        UserResponse response = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @Operation(summary = "Update an existing user", description = "Update user details by ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request data"),
        @ApiResponse(responseCode = "404", description = "User not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id, 
                                                  @RequestBody UpdateUserRequest request) {
        UserResponse response = userService.updateUser(id, request);
        return ResponseEntity.ok(response);
    }
    
    @Operation(summary = "Delete a user", description = "Delete a user by ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "User deleted successfully"),
        @ApiResponse(responseCode = "404", description = "User not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
```

### 2. DTO Layer

- **Purpose**: Data Transfer Objects for API communication
- **Responsibilities**:
  - Request DTOs for incoming data
  - Response DTOs for outgoing data
  - Data validation annotations
  - Create each DTO class into separate class files

**Example Structure:**

> Request DTO file: CreateUserRequestDto.java

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateUserRequestDto {
    @Schema(description = "First name of the user", example = "John", required = true)
    private String firstName;

    @Schema(description = "Last name of the user", example = "Doe", required = true)
    private String lastName;

    @Schema(description = "Email address of the user", example = "john.doe@example.com", required = true)
    private String email;

    @Schema(description = "Phone number of the user", example = "+1234567890", required = false)
    private String phoneNumber;
}
```

### 3. Service Layer

- **Purpose**: Business logic and orchestration
- **Responsibilities**:
  - Implement business rules
  - Coordinate between repositories
  - Handle transactions
  - Data transformation

**Example Structure:**

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {
    
    private final UserRepository userRepository;
    
    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        log.info("Creating new user with email: {}", request.getEmail());
        
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("User with email already exists");
        }
        
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setStatus(UserStatus.ACTIVE);
        
        User savedUser = userRepository.save(user);
        return convertToResponse(savedUser);
    }
    
    @Transactional(readOnly = true)
    public Optional<UserResponse> getUserById(Long id) {
        return userRepository.findById(id).map(this::convertToResponse);
    }
    
    @Transactional
    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
        if (request.getStatus() != null) user.setStatus(request.getStatus());
        
        User updatedUser = userRepository.save(user);
        return convertToResponse(updatedUser);
    }
    
    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new IllegalArgumentException("User not found");
        }
        userRepository.deleteById(id);
    }
    
    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::convertToResponse);
    }
    
    private UserResponse convertToResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setPhoneNumber(user.getPhoneNumber());
        response.setStatus(user.getStatus());
        response.setStatusDisplayName(user.getStatus().getDisplayName());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        return response;
    }
}
```

### 4. Repository Layer

- **Purpose**: Data access abstraction
- **Responsibilities**:
  - Database operations
  - Custom queries
  - JPA repository interfaces

**Example Structure:**

```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    Page<User> findByStatus(UserStatus status, Pageable pageable);
    
    @Query("SELECT u FROM User u WHERE LOWER(u.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<User> findByNameContaining(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    @Query("SELECT u FROM User u WHERE u.createdAt >= :since")
    List<User> findRecentUsers(@Param("since") LocalDateTime since);
    
    long countByStatus(UserStatus status);
}
```

### 5. Entity Layer

- **Purpose**: Database model representation
- **Responsibilities**:
  - JPA entity definitions
  - Database table mappings
  - Relationships between entities

**Example Structure:**

```java
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;
    
    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;
    
    @Column(name = "email", unique = true, nullable = false, length = 255)
    private String email;
    
    @Column(name = "phone_number", length = 20)
    private String phoneNumber;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private UserStatus status = UserStatus.ACTIVE;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    public User(String firstName, String lastName, String email) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.status = UserStatus.ACTIVE;
    }
    
    public String getFullName() {
        return firstName + " " + lastName;
    }
}
```

### 6. Enums Layer

- **Purpose**: Define constant values and types
- **Responsibilities**:
  - Status enums
  - Category types
  - Configuration constants

**Example Structure:**

```java
public enum UserStatus {
    
    ACTIVE("Active"),
    SUSPENDED("Suspended"),
    INACTIVE("Inactive"),
    PENDING("Pending");
    
    private final String displayName;
    
    UserStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public boolean canLogin() {
        return this == ACTIVE;
    }
    
    public boolean canModify() {
        return this == ACTIVE || this == SUSPENDED;
    }
}
```

## Getting Started

### Stack Requirements

- Java 21
- Maven 3.6
- PostgreSQL database

## Development Guidelines

### Creating a New Feature

#### 1. Entity First (`/entity`)

Define the JPA entity with necessary fields and annotations, following naming conventions and examples provided above.

#### 2. DTOs (`/dto`)

Define Request and Response DTOs for the entity, ensuring proper validation annotations and documentation. Also make sure to create each DTO class into separate class files, do not combine multiple DTOs into a single file.

#### 3. Repository (`/repository`)

Create a JPA repository interface for the entity, including custom query methods as needed.

#### 4. Service (`/service`)

Implement the business logic for the entity, using the repository for data access.

#### 5. Controller (`/controller`)

Define the REST API endpoints for the entity, using the service for business logic.

#### 6. Database Migration (`/resources/db/migration`)

Create a Flyway migration script:

**Example Structure:**

```sql
-- V1__Create_users_table.sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

Migration File Naming Convention

- Format: `V{version}__{description}.sql`
- Examples:
  - `V1__Create_users_table.sql`
  - `V2__Add_created_at_to_users.sql`
  - `V3__Create_orders_table.sql`

### Best Practices

1. **Separation of Concerns**: Each layer should have a single responsibility
2. **DTO Usage**: Never expose entities directly in controllers
3. **Validation**: Use Bean Validation annotations in DTOs
4. **Error Handling**: Implement proper exception handling if needed
5. **Database Migrations**: Always use Flyway for schema changes

## Code Generation Patterns

### Required Imports by Layer

**Entity Layer:**

```java
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
```

**Repository Layer:**

```java
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
```

**Service Layer:**

```java
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
```

**Controller Layer:**

```java
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
```

**DTO Layer:**

```java
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
```

### Naming Conventions

- **Entities**: PascalCase (e.g., `User`, `Order`, `Product`)
- **Tables**: snake_case (e.g., `users`, `orders`, `products`)
- **Columns**: snake_case (e.g., `first_name`, `created_at`)
- **Request DTOs**: `Create{Entity}RequestDto`, `Update{Entity}RequestDto`
- **Response DTOs**: `{Entity}ResponseDto`
- **Controllers**: `{Entity}Controller`
- **Services**: `{Entity}Service`
- **Repositories**: `{Entity}Repository`
- **Enums**: PascalCase (e.g., `UserStatus`, `OrderStatus`)
- **Migration Files**: `V{number}__{Description}.sql`

### Standard Annotations

- **@Entity** + **@Table(name = "table_name")**: For JPA entities
- **@Service**: For service classes
- **@Repository**: For repository interfaces
- **@RestController** + **@RequestMapping("/api/entity")**: For controllers
- **@Data** + **@NoArgsConstructor** + **@AllArgsConstructor**: For DTOs and entities
- **@RequiredArgsConstructor**: For dependency injection
- **@Slf4j**: For logging
- **@Transactional**: For service methods that modify data
- **@Transactional(readOnly = true)**: For read-only operations

## Available Dependencies

- **Spring Boot Web**: REST API development
- **Spring Boot Data JPA**: Database operations
- **PostgreSQL Driver**: Database connectivity
- **Flyway**: Database migrations
- **Lombok**: Reduce boilerplate code
- **Spring Boot Actuator**: Application monitoring
- **Spring Boot DevTools**: Development utilities

## DO NOT

- **Change the project structure**: Stick to the defined architecture
- **Mix layers**: Keep concerns separated
- **Change the pom.xml**: Use the provided dependencies only
