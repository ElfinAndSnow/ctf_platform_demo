find . -type f -name '0*_*.py' -delete &&
find . -type f -name '*.py[co]' -delete &&
find . -type d -name __pycache__ -delete &&
python manage.py collectstatic --noinput &&
python manage.py createcachetable &&
python manage.py makemigrations &&
python manage.py migrate &&
uwsgi --ini /demo/uwsgi.ini &&
python manage.py cronloop --sleep 30