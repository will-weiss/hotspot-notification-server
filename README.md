# COVID-19 Case Management & Hotspot Notification Server

**_Note: This project is under active development and not ready for production use._**

This project aims to specify and implement a server to be deployed by health authorities to manage COVID-19 cases and notify users of hotspots based on reported location trails.

## Table of Contents

- [Setup](/SETUP.md)
- [Glossary](#glossary)
- [Model](#model)
- [Roles And Permissions](#️roles-and-permissions)
- [Database Schema](#️database-schema)
- [API Docs](http://hotspot-notification-server.herokuapp.com/docs.html)
- [Deployment](/DEPLOYMENT.md)
- [Milestones](#️milestones)
- [Milestones](#️milestones)

## Glossary

**Staff**: An employee of a health authority. See [Roles and Permissions](#roles-and-permissions) for how health authorities may configure their system to control who can perform which functions.
**Case**: An individual believed to be infected with COVID-19. While unused at the moment, an `infection_risk` parameter allows space in the model for some percentage chance that an individual is infected, perhaps based on their self-reported symptoms.
**Location Trail Point**: A point in space and window in time where an infected individual was present. These may be sent by that individual's mobile device or entered by a staff member during a conversation with the infected individual.
**Hotspot**: A region in space and window in time where infected individual(s) were present. Note that hotspots define an area, not just a point. See [Hotspot Determination](#hotspot-determination) for more information about how health authorities might configure how these are found.

## Model

Open Case -> Case Management -> Consent to Make Public -> Hotspot Determination -> Hotspot Notification -> Case Cleanup

### Open Case

A case is opened with the user's consent by a health authority staff member or by a user who may access the route via an auth code sent to their device for that purpose.

### Case Management

Points in the location trail are added and/or redacted with a view towards privacy/efficacy.

### Consent to Make Public

Consent is received to make the nonredacted points in the location trail public, that is, used to determine hotspots.

### Hotspot Determination

The nonredacted location trail points are used to find hotspots, regions where infected individual(s) were present for a prolonged period of time.

At its most basic, we're trying to find a circle of fixed radius on the globe, say 20m, and a block of time, say an hour, inside which location trail points are present and whose time ranges sum up to some length of time, say 50 minutes.

More complicated models might weigh infection risk, number of cases in the region, length of time in the region, whether the location is indoors, etc.

### Hotspot Notification

The public is notified of hotspots. This might be a manual process where health authority staff see the new hotspots and follow up with associated cases, or might be sent to mobile users to match against their own location trails.

### Cases Cleanup

Cases and their location trail points more than 21 days old are cleaned up periodically.


## Roles and Permissions

Specific roles such as "admin" or "contact_tracer" aren't defined in this specification. Instead, roles and permissions may be set up by a database administrator to suit a particular health authority's needs. A basic setup with 2 user roles might look like this.

|     role       | method_pattern |     route_pattern   |
|----------------|----------------|---------------------|
| admin          | *              | *                   |
| contact_tracer | *              | /v1/cases*          |
| contact_tracer | POST           | /v1/authcode/create |

This would allow someone with the `admin` role to access all methods for all routes, while someone with the `contact_tracer` role can access all case related roles and can create auth codes. See [API Docs](http://hotspot-notification-server.herokuapp.com/docs.html) for more information on methods & routes.

### Schema

`id`, `created_ts`, and `updated_ts` are present for each model

`roles`
  - `role`

`permissions`
  - `role_id`
  - `method_pattern`
  - `route_pattern`

`staff`
  - `username`
  - `password`
  - `role_id`
  - `contact_info`

`cases`
  - `patient_record_info`
  - `infection_risk`
  - `created_by_staff_id`
  - `consent_to_make_public_received`
  - `consent_to_make_public_given_at`
  - `consent_to_make_public_received_by_staff_id`

`location_trail_points`
  - `case_id`
  - `location`
  - `start_ts`
  - `end_ts`
  - `redacted`

`hotspots` (planned)
  - `epicenter_location`
  - `radius`
  - `start_ts`
  - `end_ts`
  - `made_public`

## Milestones

- [ ] Manual Case Management
  - [x] Roles & Permissions
  - [x] Case Creation
  - [x] Redaction & Consent
  - [ ] Simple Algorithm for Hotspot Determination
  - [ ] Manual Hotspot Notification
  - [ ] Case Cleanup
  - [ ] Health Authority Metadata
- [ ] Mobile Connection
  - [ ] Auth Code Generation
  - [ ] Device Attestation
  - [ ] Automated Hotspot Notification
- [ ] Model Improvements
  - [ ] Configurable Algorithm for Hotspot Determination
  - [ ] Self Reporting
  - [ ] Infection Risk?

### Parallel Work

- [ ] Development & Deployment
  - [ ] CI/CD Pipeline
  - [ ] Deployment Guide
- [ ] Privacy/Security
  - [ ] Threat Model re: Hotspot Notification
  - [ ] Server Audit
- [ ] Testing
  - [ ] Mess with datetimes
  - [ ] Mess with locations
  - [ ] Mess with doing things outside the API Docs
