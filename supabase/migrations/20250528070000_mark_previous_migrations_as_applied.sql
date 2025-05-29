-- Mark previous migrations as applied
INSERT INTO supabase_migrations.schema_migrations (version, name)
VALUES 
  ('20250525080000', 'fix_vehicles_policy'),
  ('20250525080100', 'add_create_vehicle_function'),
  ('20250527003744', 'shiny_hall'),
  ('20250528034903', 'add_owner_decision_to_bookings')
ON CONFLICT (version) DO NOTHING; 