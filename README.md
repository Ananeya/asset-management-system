# Asset Management System - User Guide

## Introduction

The Asset Management System helps businesses manage their assets, track items, monitor availability, and handle assignments. This guide outlines how to use the system's features, including user registration, login, item management, employee functionalities, search, filtering, and authentication.

---

## Table of Contents

1. [User Registration](#1-user-registration)
2. [User Login](#2-user-login)
3. [Item Management](#3-item-management)
   - [View All Items](#31-view-all-items)
   - [Create an Item](#32-create-an-item)
   - [Update an Item](#33-update-an-item)
   - [Delete an Item](#34-delete-an-item)
4. [Employee Functionalities](#4-employee-functionalities)
   - [View Assigned Items](#41-view-assigned-items)
   - [Update Status of Assigned Items](#42-update-status-of-assigned-items)
   - [Request Additional Items](#43-request-additional-items)
   - [Report Item Issues](#44-report-item-issues)
5. [Search Functionality](#5-search-functionality)
6. [Filtering Functionality](#6-filtering-functionality)
7. [Authentication Middleware](#7-authentication-middleware)

---

## 1. User Registration

### Endpoint:

`POST /api/auth/register`

### Description:

This endpoint allows users to create an account by providing their details.

### Request Body:

- `username`: String (required)
- `email`: String (required)
- `password`: String (required)
- `role`: String (e.g., employee, storekeeper)

### Sample Request:

```json
{
  "username": "johndoe",
  "email": "johndoe@example.com",
  "password": "securepassword123",
  "role": "employee"
}
```

### Response:

- **Success**: 201 Created

```json
{
  "message": "User registered successfully",
  "token": "JWT_TOKEN"
}
```

- **Error**: 400 Bad Request (Validation failed)

---

## 2. User Login

### Endpoint:

`POST /api/auth/login`

### Description:

This endpoint allows registered users to log in using their email and password.

### Request Body:

- `email`: String (required)
- `password`: String (required)

### Sample Request:

```json
{
  "email": "johndoe@example.com",
  "password": "securepassword123"
}
```

### Response:

- **Success**: 200 OK

```json
{
  "message": "Login successful",
  "token": "JWT_TOKEN"
}
```

- **Error**: 400 Bad Request (Invalid credentials)

---

## 3. Item Management

### 3.1 View All Items

#### Endpoint:

`GET /api/items`

#### Description:

This endpoint retrieves all available items in the system.

#### Response:

- **Success**: 200 OK

```json
[
  {
    "name": "Laptop",
    "category": "Electronics",
    "availability": true
  },
  {
    "name": "Chair",
    "category": "Furniture",
    "availability": false
  }
]
```

---

### 3.2 Create an Item

#### Endpoint:

`POST /api/items`

#### Description:

This endpoint allows authorized users to add new items to the system.

#### Request Body:

- `name`: String (required)
- `category`: String (required)
- `availability`: Boolean
- `assignedTo`: User ID (optional)

#### Sample Request:

```json
{
  "name": "New Laptop",
  "category": "Electronics",
  "availability": true
}
```

#### Response:

- **Success**: 201 Created

```json
{
  "message": "Item created successfully"
}
```

- **Error**: 400 Bad Request (Validation failed)

---

### 3.3 Update an Item

#### Endpoint:

`PUT /api/items/:id`

#### Description:

This endpoint updates an existing item based on the provided ID and body content.

#### Request Body:

- Updatable fields, e.g., `availability`, `assignedTo`

#### Response:

- **Success**: 200 OK

```json
{
  "message": "Item updated successfully"
}
```

---

### 3.4 Delete an Item

#### Endpoint:

`DELETE /api/items/:id`

#### Description:

This endpoint allows authorized users to delete an item from the system by its ID.

#### Response:

- **Success**: 200 OK

```json
{
  "message": "Item deleted successfully"
}
```

---

## 4. Employee Functionalities

### 4.1 View Assigned Items

#### Endpoint:

`GET /api/employees/items`

#### Description:

Employees can view items assigned to them through this endpoint.

#### Response:

- **Success**: 200 OK

```json
[
  {
    "name": "Laptop",
    "status": "in use"
  }
]
```

---

### 4.2 Update Status of Assigned Items

#### Endpoint:

`PUT /api/employees/items/:id/status`

#### Description:

Allows employees to update the status of items assigned to them, such as marking an item as "in use" or "returned".

#### Request Body:

- `status`: String (e.g., "in use", "returned")

#### Response:

- **Success**: 200 OK

```json
{
  "message": "Status updated successfully"
}
```

---

### 4.3 Request Additional Items

#### Endpoint:

`POST /api/employees/items/request`

#### Description:

Allows employees to request additional items.

#### Request Body:

- `itemId`: Item ID (required)

#### Response:

- **Success**: 200 OK

```json
{
  "message": "Item requested successfully"
}
```

---

### 4.4 Report Item Issues

#### Endpoint:

`POST /api/employees/items/report`

#### Description:

Employees can report issues related to items assigned to them through this endpoint.

#### Request Body:

- `itemId`: Item ID (required)
- `issue`: Description of the issue (required)

#### Response:

- **Success**: 200 OK

```json
{
  "message": "Issue reported successfully"
}
```

---

## 5. Search Functionality

### 5.1 Search Items by Criteria

#### Endpoint:

`GET /api/items/search`

#### Description:

Allows users to search for items based on criteria such as name or category.

#### Query Parameters:

- `name`: String (optional)
- `category`: String (optional)

#### Sample Request:

`/api/items/search?name=Laptop&category=Electronics`

#### Response:

- **Success**: 200 OK

```json
[
  {
    "name": "Laptop",
    "category": "Electronics",
    "availability": true
  }
]
```

---

## 6. Filtering Functionality

### 6.1 Filter Items by Availability or Assignment Status

#### Endpoint:

`GET /api/items/filter`

#### Description:

This route filters items based on availability or assigned status.

#### Query Parameters:

- `availability`: Boolean (optional)
- `assignedTo`: User ID (optional)

#### Sample Request:

`/api/items/filter?availability=true&assignedTo=12345`

#### Response:

- **Success**: 200 OK

```json
[
  {
    "name": "Laptop",
    "availability": true,
    "assignedTo": "12345"
  }
]
```

---

## 7. Authentication Middleware

### Description:

To protect routes and allow only authenticated users to access them, the system uses JWT-based authentication middleware.

1. Import `authMiddleware`:

   ```js
   const authMiddleware = require("../middleware/authMiddleware");
   ```

2. Apply to routes:
   ```js
   router.get("/items", authMiddleware, (req, res) => {
     // Logic to handle the request
   });
   ```

This middleware ensures that only users with valid JWT tokens can access protected routes like creating, updating, or deleting items.

---

## Conclusion

This guide provides an overview of the Asset Management System's core functionalities. It explains how to register, log in, manage items, and use employee-specific features. Additionally, it outlines the search, filtering, and authentication mechanisms to ensure a secure and efficient system.

```

```
