# Users

Registration, login and profile. Spec: F-01, F-08. Owner: Person 1.

Rules: passwords are stored hashed. Registration needs consent to the privacy notice (Data Privacy Act of 2012).
Email is unique and cannot be changed after registration.

### [POST] - "/users/register"

Public

Sample Request Body

```json
{
  "firstName": "Beatriz",
  "lastName": "Alonzo",
  "email": "beatriz@mail.com",
  "phone": "9178824491",
  "password": "samplePw123",
  "consent": true
}
```

- `phone` is the Philippine mobile number without `+63`, 9 to 13 digits (spaces allowed).
- `password` must be at least 8 characters and include a number or symbol.
- `consent` must be `true`.

Sample Response `201`: logs the user in and returns the user

```json
{
  "user": {
    "id": "6553f1c2a1b2c3d4e5f60718",
    "firstName": "Beatriz",
    "lastName": "Alonzo",
    "email": "beatriz@mail.com",
    "phone": "9178824491",
    "role": "customer"
  }
}
```

Errors: `400` with field errors, `409` with `errors.email = "Email already used."`.

### [POST] - "/users/login"

Public

Sample Request Body

```json
{
  "email": "sample@mail.com",
  "password": "samplePw123"
}
```

Sample Response `200`: same `user` object as register.

Errors: `400` missing fields, `401` `"Wrong email or password."` (never say which one was wrong).

### [POST] - "/users/logout"

Requires token

No Request Body

Sample Response `204`: no content.

### [GET] - "/users/profile"

Requires token

No Request Body

Sample Response `200`

```json
{
  "user": {
    "id": "6553f1c2a1b2c3d4e5f60718",
    "firstName": "Beatriz",
    "lastName": "Alonzo",
    "email": "beatriz@mail.com",
    "phone": "9178824491",
    "role": "customer"
  }
}
```

Errors: `401` when not logged in. The frontend uses this on page load to restore the session.

### [PATCH] - "/users/profile"

Requires token

Sample Request Body (send only what changes)

```json
{
  "firstName": "Beatriz",
  "lastName": "Alonzo",
  "phone": "9178824491"
}
```

Sample Response `200`: the updated `user` object.

Errors: `400` with field errors. `email` and `role` are ignored if sent.

### [PATCH] - "/users/password"

Requires token

Sample Request Body

```json
{
  "currentPassword": "samplePw123",
  "newPassword": "newSamplePw456!"
}
```

Sample Response `204`: no content.

Errors: `400` with `errors.currentPassword = "Current password is incorrect."` or `errors.newPassword` when the rules are not met.
