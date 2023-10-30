FROM python:3.10
ENV PYTHONUNBUFFERED 1
COPY pip.conf /root/.pip/pip.conf
RUN mkdir /demo
WORKDIR /demo
ADD . /demo
RUN pip install --upgrade pip 
RUN pip install -r requirements.txt
RUN chmod +x ./start.sh
