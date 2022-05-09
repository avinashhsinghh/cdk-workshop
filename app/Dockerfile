FROM public.ecr.aws/docker/library/python:3.7-slim

USER root

WORKDIR /app

ADD . /app

RUN pip install --trusted-host pypi.python.org -r requirements.txt

EXPOSE 3000

ENV NAME World

CMD ["python", "app.py"]