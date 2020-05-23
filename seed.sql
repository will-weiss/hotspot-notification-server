with inserted_admin_role_id as (
  INSERT INTO roles (role) VALUES ('admin') RETURNING id
),

inserted_contact_tracer_role_id as (
  INSERT INTO roles (role) VALUES ('contact_tracer') RETURNING id
),

inserted_permissions as (
  INSERT INTO permissions (role_id, method_pattern, route_pattern)
    (select id, '*' as method_pattern, '*' as route_pattern from inserted_admin_role_id) UNION
    (select id, '*' as method_pattern, '/v1/cases*' as route_pattern from inserted_contact_tracer_role_id) UNION
    (select id, 'POST' as method_pattern, '/v1/authcode/create' as route_pattern from inserted_contact_tracer_role_id)
),

INSERT INTO staff (username, hashed_password, )

;

-- psql postgresql://safepaths:safepaths@localhost:5432/safepaths_dev