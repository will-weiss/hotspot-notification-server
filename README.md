# Reference COVID-19 Case Management & Hotspot Notification Server

This server project aims to be deployed by health authorities to identify and notify users of COVID-19 hotspots based on timestamped location trails of possibly infected individuals. These location trails may be sent from an individual's mobile device having been collected by GPS and reviewed during a conversation with a contact tracer to redact private information, or manually input by a contact tracer based on a conversation with an individual.

# Model

## Progression

Case & Location Trail Creation/Review -> Infection Risk Calculation -> Hotspot Determination -> Hotspot Notification

## Schema

- id, created_ts, updated_ts are present for each model

### Tables

health_authority_info_field
  - key
  - value

roles
  - role

permissions
  - role_id
  - method
  - route

staff
  - username
  - password
  - role_id
  - contact_info

auth_codes?
  - code

cases
  - created_by_staff
  - patient_record_info
  - infection_risk
  - redacted

location_trail_points
  - case_id
  - lat
  - lon
  - start_ts
  - end_ts

hotspots (materialized view?)
  - epicenter_lat
  - epicenter_lon
  - start_ts
  - end_ts
  - published

past_hotspots?
  - epicenter_lat
  - epicenter_lon
  - start_ts
  - end_ts

### Variables/Settings

<!-- - require_auth_code_before -->
- self_reporting
- hotspot_auto_notify
- hotspot_minimum_individuals
- hotspot_minimum_time_present


## Functions

- `POST`   `/session`
- `DELETE` `/session`
- `GET`    `/health_authority_info`
- `PUT`    `/health_authority_info`
- `GET`    `/staff`
- `POST`   `/staff`
- `PUT`    `/staff/$health_authority_staff_id`
- `DELETE` `/staff/$health_authority_staff_id`
- `GET`    `/settings`
- `PUT`    `/settings/$setting_id`
- `POST`   `/authcode/create` (mobile number)
- `POST`   `/cases` { auth_code?, location_trail_points, patient_record_information }
- `GET`    `/cases` ?page=pageId -> { case_id, location_trail_points, patient_record_information }[]
- `DELETE` `/cases/$case_id`
- `PUT`    `/cases/$case_id/patient_record_information`
- `POST`   `/cases/$case_id/location_trail_points`
- `DELETE` `/cases/$case_id/location_trail_points/$location_trail_point_id`
- `GET`    `/hotspots?past=$timestamp&pubished=$published&unpublished=$unpublished`
- `POST`   `/hotspots/$hotspot_id/publish`


## Background Processes

<!-- Cleanup old location points? -->

Commit order
- base db migrations ✅
- koa app skeleton  ✅
- /cases (sans auth code) ✅
- /session ✅
- deploy ✅
- Fill in some gaps
- doc update
- CI/CD
- Install
- hotspot calculation
- authcode workflow
- Self Reporting?
- Device Attestation
- Cleanup old location points




# Random lines to remember

heroku config:set PGSSLMODE=require --app hotspot-notification-server