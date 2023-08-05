# Routes

## POST /phones

Creates a new mail.

### Request Body

The request body should be a JSON object with the following properties:

```json
{
    "id": 1,
    "phone": "01234567890",
    "is_verified": false,
    "is_default": false
}
```

### Response

If the mail is successfully created, the server will respond with a status code of 201 and a JSON object representing the new mail:

```json
{
    "id": 1,
    "phone": "01234567890",
    "is_verified": false,
    "is_default": false
}
```

## GET /phones

Get a phone by id.

### Request Headers

The request headers should have the following properties:

```json
"headers": {
    "Authorization": "Bearer <Access-Token>",
    "X-Refresh-Token": "Bearer <Refresh-Token>"
}
```

### Response

If the user id is exists, the server will respond with a status code of 200 and a JSON Array of numbers representing the user phones:

```json
[
    {
        "id": 1,
        "phone": "01234567890",
        "is_verified": true,
        "is_default": true
    },
    {
        "id": 2,
        "phone": "01234567891",
        "is_verified": true,
        "is_default": false
    }
]
```

## PATCH /phones/:id

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
    "phone": "01234567892"
}
```

### Response

If the phone is exists and updated, the server will respond with a status code of 200 and a JSON object representing the updated phone:

```json
{
    "id": 1,
    "phone": "01234567892",
    "is_verified": false,
    "is_default": false
}
```

## DELETE /phones/:id

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

If the phone exists and is deleted, the server will respond with a status code of `204 No Content`. Additionally, the server will return a `Content-Location` header in the response to indicate the location of the deleted resource. The response headers will look like this:

```json
HTTP/1.1 204 No Content
Content-Location: /phones/1
