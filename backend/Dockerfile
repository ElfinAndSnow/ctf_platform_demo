FROM python:3.12
ENV PYTHONUNBUFFERED 1
COPY pip.conf /root/.pip/pip.conf
RUN mkdir /var/demo
WORKDIR /var/demo
ADD . /var/demo
RUN pip install -r requirements.txt
