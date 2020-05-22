# Reference COVID-19 Case Management & Hotspot Notification Server

This server project aims to be deployed by health authorities to identify and notify users of COVID-19 hotspots based on timestamped location trails of possibly infected individuals. These location trails may be sent from an individual's mobile device having been collected by GPS and reviewed during a conversation with a contact tracer to redact private information, or manually input by a contact tracer based on a conversation with an individual.

# Model

## Progression

Case & Location Trail Creation/Review -> Infection Risk Calculation -> Hotspot Determination -> Hotspot Notification

## Schema

- id, created_ts, updated_ts are present for each model

### Tables

health_authority
  - info

health_authority_staff
  - username
  - password
  - name
  - contact_info
  - role

health_authority_roles
  - role

health_authority_role_permissions
  - health_authority_role_id
  - method
  - route

auth_codes?
  - code

cases
  - patient_record_information
  - infection_risk

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
- `GET`    `/health_authority/info`
- `PUT`    `/health_authority/info`
- `GET`    `/health_authority/staff`
- `POST`   `/health_authority/staff`
- `PUT`    `/health_authority/staff/$health_authority_staff_id`
- `DELETE` `/health_authority/staff/$health_authority_staff_id`
- `GET`    `/health_authority/settings`
- `PUT`    `/health_authority/settings/$setting_id`
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
- base db migrations
- express app skeleton
- /session
- /cases (sans auth code)
- hotspot calculation
- authcode workflow
- Self Reporting
- Device Attestation
- Cleanup old location points