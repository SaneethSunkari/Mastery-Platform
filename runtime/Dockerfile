FROM python:3.11-slim-bookworm

ENV PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update \
    && apt-get install --no-install-recommends -y openjdk-17-jre-headless \
    && rm -rf /var/lib/apt/lists/* \
    && pip install --no-cache-dir pyspark==3.5.1 \
    && useradd --create-home --uid 10001 --shell /usr/sbin/nologin spark-runner

COPY --chown=spark-runner:spark-runner pyspark_runner.py /opt/mastery/pyspark_runner.py

USER 10001:10001
WORKDIR /tmp
ENTRYPOINT ["python3", "/opt/mastery/pyspark_runner.py"]
