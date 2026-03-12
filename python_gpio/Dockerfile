# FROM ubuntu:24.04
FROM ubuntu:24.04

RUN apt update 
RUN apt install python3 -y
RUN apt install python3-libgpiod python3-paho-mqtt -y

WORKDIR /app

COPY ./gpiod-test.py ./gpiod-test.py

USER root

CMD ["python3", "-u", "gpiod-test.py"]
