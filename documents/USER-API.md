# Routes

## GET /users/:id

Get a user by id.

### Request Headers

The request headers should have the following properties:

```json
"headers": {
    "Authorization": "Bearer <Access-Token>",
    "X-Refresh-Token": "Bearer <Refresh-Token>"
}
```

### Response

If the user is exists, the server will respond with a status code of 200 and a JSON object representing the received user:

```json
{
  "id": 1,
  "first_name": "Adham",
  "last_name": "Adham",
  "email": "adhamhaddad.dev@gmail.com"
}
```

## PATCH /users/:id

Update a user by id.

### Request Headers

The request headers should have the following properties:

```json
"headers": {
    "Authorization": "Bearer <Access-Token>",
    "X-Refresh-Token": "Bearer <Refresh-Token>"
}
```

### Request Body

The request body should be a JSON object with the following properties:

```json
{
  "first_name": "Adham",
  "last_name": "Ashraf",
  "email": "adhamhaddad.dev@gmail.com"
}
```

### Response

If the user is exists and updated, the server will respond with a status code of 200 and a JSON object representing the updated user:

```json
{
  "id": 1,
  "first_name": "Adham",
  "last_name": "Ashraf",
  "email": "adhamhaddad.dev@gmail.com"
}
```

## DELETE /users/:id

Delete a user by id.

### Request Headers

The request headers should have the following properties:

```json
"headers": {
    "Authorization": "Bearer <Access-Token>",
    "X-Refresh-Token": "Bearer <Refresh-Token>"
}
```

### Response

If the user exists and is deleted, the server will respond with a status code of `204 No Content`. Additionally, the server will return a `Content-Location` header in the response to indicate the location of the deleted resource. The response headers will look like this:

```json
HTTP/1.1 204 No Content
Content-Location: /users/1
