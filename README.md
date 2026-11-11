# Book review API

Completed IBM expressBookReviews starter using the original ten-book dataset.

## Run

Requires Node.js 18+ and npm.

```sh
cd final_project
npm ci
npm start
```

Server: http://127.0.0.1:5000. Run `npm test` for integration checks.

## Submission

Evidence files in `evidence/` contain executed cURL commands and actual responses for tasks 2-10. `reviewadded.txt` demonstrates both creation and modification. Cookie files and real credentials are excluded; the displayed credentials are disposable demo values.

Task 1: https://github.com/Amir888-s/expressBookReviews

Task 11: https://github.com/Amir888-s/expressBookReviews/blob/main/final_project/router/general.js

The all-books endpoint uses Axios with async/await; ISBN uses Axios promise callbacks; author/title use Axios with async/await. Internal catalogue endpoints expose the supplied data and avoid recursive requests. All four methods are in general.js.

The screenshots say 14 tasks but only show tasks 1-11 (which total 30 points). Additional unshown criteria have not been verified.

## API

- GET `/`, `/isbn/:isbn`, `/author/:author`, `/title/:title`, `/review/:isbn`
- POST `/register` with JSON username/password (password at least 8 characters)
- POST `/customer/login` with the same JSON; retain the session cookie
- PUT `/customer/auth/review/:isbn` with JSON review or a review query parameter
- DELETE `/customer/auth/review/:isbn` deletes only the signed-in user's review

Usernames are unique. Passwords are salted and hashed. Login uses an expiring JWT inside a server session. Users can edit and delete only their own review. Invalid input and missing books receive appropriate error statuses.

This course demo stores users, sessions and reviews in memory; restarting resets them. Production use would require persistent storage, a shared session store, HTTPS, configured JWT_SECRET/SESSION_SECRET, and rate limiting. The original book dataset is preserved.

Task 1 evidence notes a local Windows cURL TLS failure and includes a separately verified Node HTTPS GitHub response; it does not mislabel that response as cURL output.
