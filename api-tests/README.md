# Bruno API tests

Use the `Droplet` environment when running the collection against the deployed
site.

The public frontend is served from the site root:

```text
https://cop4331lamp13.xyz/
```

The API tests intentionally keep using the existing Apache alias-backed API
prefix:

```text
https://cop4331lamp13.xyz/lamp/api
```

Do not change the Bruno request URLs to root-relative frontend paths like
`/api/...`. Apache maps `/lamp/api/...` to `/var/www/html/lamp/api/...`, while
`/` maps to `/var/www/html/lamp/frontend/...`.

The registration request can return `409` if `testLogin` already exists. Change
`testLogin` to a new value, run registration again, and then run both login tests.
