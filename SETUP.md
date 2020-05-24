All of this assumes you're on a Mac. If any part of these instructions are wrong or incomplete, please update them!

## Installs

Get [Homebrew](https://brew.sh/).

```bash
> /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

Get [node.js](https://nodejs.org/en/).

```bash
> brew install node
```

Get [nvm](https://github.com/nvm-sh/nvm).

```bash
> curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
```

Get [postgres](https://www.postgresql.org/).

```bash
> brew install postgresql
```

Get [PostGIS](https://postgis.net/).

```bash
> brew install postgis
```

## Setup

Use the correct node version and install node_modules.

```bash
> nvm use
> npm install
```

Create a database for both local development & for running tests.

```bash
> createdb -h localhost -U $your_user -W hotspot-notification-server-dev
> createdb -h localhost -U $your_user -W hotspot-notification-server-test
```

Create a `.env.dev` file at the root level of the project with the connection information for the database you created. You may optionally specify a port. By default, the dev server runs on `5004` and the test server runs on `5005`.

```
DB_HOST=localhost
DB_PASS=
DB_USER=$your_user
DB_NAME=hotspot-notification-server-dev
PORT=
```

Do the same for `.env.test`.

```
DB_HOST=localhost
DB_PASS=
DB_USER=$your_user
DB_NAME=hotspot-notification-server-test
PORT=
```

Run the [database migrations](/db/migrations) for each.

```bash
> NODE_ENV=dev npm run knex migrate:latest
> NODE_ENV=test npm run knex migrate:latest
```

Add [seed data](db/seeds/two_role_three_user.js) to the dev database. The [end-to-end tests](/src/__test/end-to-end.test.ts) automatically wipe the database rows and seed them before each run, so no need to do so for the test database. *Note*: Do not do this in production, instead have a DB Admin add roles/permissions/staff suited to your use case.

```bash
> NODE_ENV=dev npm run knex seed:run
```

Run end-to-end tests.

```bash
> npm test
```

Start a development server and watch source files in [/src](/src).

```bash
> npm run dev
```

Log in as a contact tracer, saving your cookie to a file.

```bash
> COOKIE_JAR=$(mktemp)
> curl localhost:5004/v1/session \
  --request POST \
  --header 'Content-Type: application/json' \
  --cookie-jar $COOKIE_JAR \
  --data '{ "username": "contact_tracer_1", "password": "pw_contact_tracer_1" }'

  # Response is "OK"
```

Open a case.

```bash
> curl localhost:5004/v1/cases \
  --request POST \
  --header 'Content-Type: application/json' \
  --cookie $COOKIE_JAR \
  --data '
    {
      "patient_record_info": { "some": "metadata" },
      "location_trail_points": [
        {
          "lat": 40,
          "lon": -80,
          "start_ts": "2020-05-05T00:10:00-04:00",
          "end_ts": "2020-05-05T00:15:00-04:00"
        },
        {
          "lat": 40,
          "lon": -80.222,
          "start_ts": "2020-05-05T00:15:00-04:00",
          "end_ts": "2020-05-05T00:20:00-04:00"
        }
      ]
    }
  '

  # Response is {"id":1}
```

Add an additional point.

```bash
> curl localhost:5004/v1/cases/1/location_trail_points \
  --request POST \
  --header 'Content-Type: application/json' \
  --cookie $COOKIE_JAR \
  --data '
    {
      "lat": 40,
      "lon": -80.444,
      "start_ts": "2020-05-05T00:20:00-04:00",
      "end_ts": "2020-05-05T00:25:00-04:00"
    }
  '

  # Response is [{"id":3,"lat":40,"lon":-80.444,"start_ts":"2020-05-05T00:20:00-04:00","end_ts":"2020-05-05T00:25:00-04:00"}]
```

See that the case has the new point.

```bash
> curl localhost:5004/v1/cases/1 \
  --request GET \
  --header 'Content-Type: application/json' \
  --cookie $COOKIE_JAR

  # Response is {"id":1,"patient_record_info":{"some":"metadata"},"infection_risk":1,"consent_to_make_public_received":false,"consent_to_make_public_received_by_staff_username":null,"consent_to_make_public_given_at":null,"location_trail_points":[{"id":1,"start_ts":"2020-05-05T00:10:00-04:00","end_ts":"2020-05-05T00:15:00-04:00","lon":-80,"lat":40,"redacted":false},{"id":2,"start_ts":"2020-05-05T00:15:00-04:00","end_ts":"2020-05-05T00:20:00-04:00","lon":-80.222,"lat":40,"redacted":false},{"id":3,"start_ts":"2020-05-05T00:20:00-04:00","end_ts":"2020-05-05T00:25:00-04:00","lon":-80.444,"lat":40,"redacted":false}]}
```

Redact the second point.

```bash
> curl localhost:5004/v1/cases/1/location_trail_points/2/redact \
  --request POST \
  --header 'Content-Type: application/json' \
  --cookie $COOKIE_JAR

  # Response is OK
```

See that the point is redacted.

```bash
> curl localhost:5004/v1/cases/1 \
  --request GET \
  --header 'Content-Type: application/json' \
  --cookie $COOKIE_JAR

  # Response is {"id":1,"patient_record_info":{"some":"metadata"},"infection_risk":1,"consent_to_make_public_received":false,"consent_to_make_public_received_by_staff_username":null,"consent_to_make_public_given_at":null,"location_trail_points":[{"id":1,"start_ts":"2020-05-05T00:10:00-04:00","end_ts":"2020-05-05T00:15:00-04:00","lon":-80,"lat":40,"redacted":false},{"id":2,"start_ts":"2020-05-05T00:15:00-04:00","end_ts":"2020-05-05T00:20:00-04:00","lon":-80.222,"lat":40,"redacted":true},{"id":3,"start_ts":"2020-05-05T00:20:00-04:00","end_ts":"2020-05-05T00:25:00-04:00","lon":-80.444,"lat":40,"redacted":false}]}
```

Consent to make the unredacted points in the case public.

```bash
> curl localhost:5004/v1/cases/1/consent_to_make_public \
  --request POST \
  --header 'Content-Type: application/json' \
  --cookie $COOKIE_JAR

  # Response is OK
```

See that consent was given.

```bash
> curl localhost:5004/v1/cases/1 \
  --request GET \
  --header 'Content-Type: application/json' \
  --cookie $COOKIE_JAR

  # Response is {"id":1,"patient_record_info":{"some":"metadata"},"infection_risk":1,"consent_to_make_public_received":true,"consent_to_make_public_received_by_staff_username":"contact_tracer_1","consent_to_make_public_given_at":"2020-05-24T15:01:30.640Z","location_trail_points":[{"id":1,"start_ts":"2020-05-05T00:10:00-04:00","end_ts":"2020-05-05T00:15:00-04:00","lon":-80,"lat":40,"redacted":false},{"id":2,"start_ts":"2020-05-05T00:15:00-04:00","end_ts":"2020-05-05T00:20:00-04:00","lon":-80.222,"lat":40,"redacted":true},{"id":3,"start_ts":"2020-05-05T00:20:00-04:00","end_ts":"2020-05-05T00:25:00-04:00","lon":-80.444,"lat":40,"redacted":false}]}
```
