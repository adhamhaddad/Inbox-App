# Routes

## PATCH /mail-folders/:id

Update mail folder by id.

### Request Body

The request body should be a JSON object with the following properties:

```json
{
    "folder": "SPAM"
}
```

### Response

If the mail folder is successfully updated, the server will respond with a status code of 200 and a JSON object representing the updated mail folder:

```json
{
    "id": 1,
    "mail_id": 1,
    "user_id": 1,
    "folder": "SPAM"
}
```
