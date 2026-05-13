#!/bin/sh
set -e

echo "⏳ Waiting for MySQL (mysql:3306)..."
until nc -z -w2 mysql 3306 2>/dev/null; do
    printf '.'
    sleep 2
done
echo ""
echo "✅ MySQL is ready."

exec "$@"
