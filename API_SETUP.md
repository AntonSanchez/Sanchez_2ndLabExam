# Local API (json-server + json-server-auth)

A free fake REST API that runs on your computer. Sign-ups are saved to `db.json`, so they persist.

## 1. Install (once)

```
npm install -D json-server@0.17.4 json-server-auth@2.1.0
```

Use json-server 0.x; json-server-auth does not work with json-server 1.x.

## 2. Start the API

```
npx json-server-auth db.json -r routes.json --port 3000 --host 0.0.0.0
```

Keep this terminal open. Open http://localhost:3000/students to check it is running
(it should return 401 or the student list depending on the access rules).

## 3. Point the app at it

`constants/api.ts` picks the host automatically:

| Where the app runs | Host used |
| --- | --- |
| Web, iOS simulator | `localhost` |
| Android emulator | `10.0.2.2` |
| Physical phone (Expo Go) | set `PC_IP_ADDRESS` in `constants/api.ts` to your computer's Wi-Fi IP, e.g. `192.168.1.5` |

The phone and the computer must be on the same Wi-Fi, and the firewall must allow port 3000.

## Endpoints

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/register` | `{ name, email, password }` -> `{ accessToken, user }` |
| POST | `/login` | `{ email, password }` -> `{ accessToken, user }` |
| GET | `/students` | needs `Authorization: Bearer <token>` |
| GET | `/students/{id}` | needs a token |
| GET | `/users/{id}` | the signed-in user's own record (used for Profile) |

Demo account: `student@example.com` / `student123`

Tokens expire after 1 hour; the app then returns to the sign-in screen.
`routes.json` controls access: `users: 600` (owner only) and `students: 660` (any signed-in user can read and write).
