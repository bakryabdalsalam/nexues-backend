-- Update SUPER_ADMIN users to ADMIN
UPDATE users
SET role = 'ADMIN'
WHERE role = 'SUPER_ADMIN'; 