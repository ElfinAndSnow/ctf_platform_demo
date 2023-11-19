FROM python:uwsgi
ENV PYTHONUNBUFFERED 1
COPY pip.conf /root/.pip/pip.conf
ADD . /demo
RUN pip install --upgrade pip 
RUN pip install -r requirements.txt
RUN chmod +x ./start.sh
