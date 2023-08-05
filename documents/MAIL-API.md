# Routes

## POST /mails

Creates a new mail.

### Request Body

The request body should be a JSON object with the following properties:

```json
{
    "from": "adhamhaddad@gmail.com",
    "to": [""],
    "cc": [],
    "bcc": [],
    "subject": "Mail Subject",
    "message": "Mail Message",
    "attachments": []
}
```

### Response

If the mail is successfully created, the server will respond with a status code of 201 and a JSON object representing the new mail:

```json
{
    "id": 1,
    "from": "adhamhaddad@gmail.com",
    "to": [""],
    "cc": [],
    "bcc": [],
    "subject": "Mail Subject",
    "message": "Mail Message",
    "attachments": [],
    "created_at": "",
    "updated_at": null,
    "deleted_at": null
}
```

## GET /mails/:id

Get a mail by id.

### Request Headers

The request headers should have the following properties:

```json
"headers": {
    "Authorization": "Bearer <Access-Token>",
    "X-Refresh-Token": "Bearer <Refresh-Token>"
}
```

### Response

If the mail id is exists, the server will respond with a status code of 200 and a JSON object representing the mail:

```json
{
    "id": 1,
    "from": "adhamhaddad@gmail.com",
    "to": [""],
    "cc": [],
    "bcc": [],
    "subject": "Mail Subject",
    "message": "Mail Message",
    "attachments": [],
    "created_at": "",
    "updated_at": null,
    "deleted_at": null
}
```

## PATCH /mails/:id

Update a mail by id.

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
    "id": 1,
    "subject": "Mail Subject Updated",
    "message": "Mail Message Updated"
}
```

### Response

If the mail is exists and updated, the server will respond with a status code of 200 and a JSON object representing the updated mail:

```json
{
   "id": 1,
    "from": "adhamhaddad@gmail.com",
    "to": [""],
    "cc": [],
    "bcc": [],
    "subject": "Mail Subject Updated",
    "message": "Mail Message Updated",
    "attachments": [],
    "created_at": "",
    "updated_at": "",
    "deleted_at": null
}
```

## DELETE /mails/:id

Delete a mail by id.

### Request Headers

The request headers should have the following properties:

```json
"headers": {
    "Authorization": "Bearer <Access-Token>",
    "X-Refresh-Token": "Bearer <Refresh-Token>"
}
```

### Response

If the mail exists and is deleted, the server will respond with a status code of `204 No Content`. Additionally, the server will return a `Content-Location` header in the response to indicate the location of the deleted resource. The response headers will look like this:

```json
HTTP/1.1 204 No Content
Content-Location: /mails/1
