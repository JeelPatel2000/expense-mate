#!/bin/bash
set -euo pipefail
# PostgreSQL connection details
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="expense_mate"
DB_USER="postgres"
DB_PASSWORD="postgres"

# Function to run a single migration file
run_migration() {
  echo "Running migration: $1"
  psql -h $DB_HOST -p $DB_PORT -d $DB_NAME -U $DB_USER -f "$1"
}

# Function to apply all migrations
apply_teardown_script() {
  for migration_file in flyway/*.sql; do
    if [ -f "$migration_file" ]; then
      run_migration "$migration_file"
    fi
  done
}

# Execute the script
apply_teardown_script
