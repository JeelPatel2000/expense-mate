#!/bin/bash
set -euo pipefail
# PostgreSQL connection details
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="expense_mate"
DB_USER="postgres"
DB_PASSWORD="postgres"

# Function to check if the database exists
check_database_exists() {
  psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1
  return $?
}
# Function to create the database
create_database() {
  echo "Creating database: $DB_NAME"
  psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME;"
}

# Function to run a single migration file
run_migration() {
  echo "Running migration: $1"
  psql -h $DB_HOST -p $DB_PORT -d $DB_NAME -U $DB_USER -f "$1"
}

# Function to apply all migrations
apply_migrations() {
  for migration_file in flyway/migrations/*.sql; do
    if [ -f "$migration_file" ]; then
      run_migration "$migration_file"
    fi
  done
}

# Check if the database exists
check_database_exists
if [ $? -eq 0 ]; then
  echo "Database '$DB_NAME' already exists. No action needed."
else
  # Create the database
  create_database
  echo "Database '$DB_NAME' created successfully."
fi

# Execute the script
apply_migrations
