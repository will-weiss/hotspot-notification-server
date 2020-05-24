# COVID-19 Case Management & Hotspot Notification Server

**_Note: This project is under active development and not ready for production use._**

This project aims to specify and implement a server to be deployed by health authorities to manage COVID-19 cases and notify users of hotspots based on reported location trails.


These location trails may be sent from an individual's mobile device having been collected by GPS and reviewed during a conversation with a contact tracer to redact private information, or manually input by a contact tracer based on a conversation with an individual.

## Table of Contents

- [Setup](/SETUP.md)
- [Glossary](#glossary)
- [Model](#model)
- [Roles And Permissions](#️roles-and-permissions)
- [Database Schema](#️database-schema)
- [API Spec](http://hotspot-notification-server.herokuapp.com/docs.html)
- [Deployment](/DEPLOYMENT.md)
- [Milestones](#️milestones)

## Glossary

**Staff**: An employee of a health authority. See [Roles and Permissions](#roles-and-permissions) for how health authorities may configure their system to control who can perform which functions.
**Case**: An individual believed to be infected with COVID-19. While unused at the moment, an `infection_risk` parameter allows space in the model for some percentage chance that an individual is infected, perhaps based on their self-reported symptoms.
**Location Trail Point**: A point in space and window in time where an infected individual was present. These may be sent by that individual's mobile device or entered by a staff member during a conversation with the infected individual.
**Hotspot**: A region in space and window in time where infected individual(s) were present. Note that hotspots define an area, not just a point. See [Hotspot Determination](#hotspot-determination) for more information about how health authorities might configure how these are found.

## Model

### Progression

Open Case -> Case Management -> Infection Risk Calculation -> Hotspot Determination -> Hotspot Notification

#### Open Case

#### Case Management

#### Infection Risk Calculation

#### Hotspot Determination

#### Hotspot Notification


## Roles and Permissions

TODO
to access  Note that specific roles such as "admin" or "contact_tracer" aren't defined in this specification, accounting for different but that this implementation allows arbitrary roles/perm



### Schema

- id, created_ts, updated_ts are present for each model

### Tables

roles
  - role

permissions
  - role_id
  - method_pattern
  - route_pattern

staff
  - username
  - password
  - role_id
  - contact_info

cases
  - created_by_staff
  - patient_record_info
  - infection_risk
  - consent_to_make_public_received
  - consent_to_make_public_given_at
  - consent_to_make_public_received_by_staff_id


location_trail_points
  - case_id
  - location
  - start_ts
  - end_ts
  - redacted

hotspots (materialized view?)
  - epicenter_location
  - radius
  - start_ts
  - end_ts
  - made_public

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

## Background Processes

<!-- Cleanup old location points? -->

## Milestones

- [ ] Manual Data Ingestion
  - [ ] Case Creation
  - [ ] Redaction & Consent
  - [ ] Simple Algorithm for Hotspot Determination
  - [ ] Hotspot Notification
- [ ] Mobile Data Ingestion
  - [ ] Auth Code Generation
  - [ ] Device Attestation
- [ ] Model Improvements
  - [ ] Configurable Algorithm for Hotspot Determination
  - [ ] Self Reporting
  - [ ] Infection Risk
- [ ] Development & Deployment
  - [ ] CI/CD Pipeline
  - [ ] Deployment Guide
  - [ ] Automated Setup Scripts


# Random lines to remember

heroku config:set PGSSLMODE=require --app hotspot-notification-server