# Create seed-data directory
mkdir -p prisma/seed-data

# Export each table to JSON
tables=("columns" "tasks")

for table in "${tables[@]}"
do
  echo "Exporting $table..."
  docker exec kanban-db psql -U postgres -d kanban -t -A -c \
    "SELECT row_to_json(t) FROM $table t" > prisma/seed-data/$table.json
done

echo "✅ Export completed!"