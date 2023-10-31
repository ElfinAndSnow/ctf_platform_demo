# ![](https://github.com/ElfinAndSnow/ctf_platform_demo/blob/test/frontend/src/assets/images/logo.png?raw=true)
# Install

 - Set up Python (3.10 for production is recommended) and pip environment
 - Install dependencies:
   - Virtual environment is recommended for development, for you may not want to install site packages globally. You can create a venv easily with PyCharm, or using 
   - Production: `pip install -r requirements.txt`
   - Development: `pip install -r requirements_dev.txt`
 - Configure environment variables:
   - Generate a SECRET_KEY
     - In Python console:
```python
from django.core.management.utils import get_random_secret_key
get_random_secret_key()
```
   - Created .[env] in [backend/backend/], together with settings py files
```python
EMAIL_HOST_USER = xxx@xxx.com
EMAIL_HOST_PASSWORD = xxxxxxxx  
EMAIL_HOST = smtp.xxx.com
EMAIL_PORT = 587  
  
SECRET_KEY = Your secret key
  
DB_NAME = xxx
DB_USER = xxxx
DB_PASSWORD = xxxxxxxx
DB_HOST = xxx.xxx.xxx.xxx
DB_PORT = xxxx
```
 - If you are in development env, you need to add `--settings backnend.settings_dev` after commands below. E.g. `python manage.py runserver --settings backend.settings_dev`
 - Create cache table: `python manage.py createcachetable`
 - Make migration files: `python manage.py makemigrations`
 - Migrate to SQL: `python manage.py migrate`
 - If you are in production env, don't forget to collect static files: `python manage.py collectstatic`. Static files are stored in backend/static by default, can be configured in settings file.
 - Before running your server, you need to create a super user for admin site: `python manage.py createsuperuser`, and set up your super user following its guidance.
 - Now you can run your django server! Actually we recommend you to check first by `python manage.py check`. If everything works, then you can launch the server: `python manage.py runserver`. Default port is set to 8000, which can be configured in your settings files.
