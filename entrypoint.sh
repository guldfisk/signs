#!/usr/bin/env bash

if [[ "$DEBUG" == "1" ]]
then
    python3 manage.py runserver 0.0.0.0:7000
else
    gunicorn --chdir signs --bind :7000 signs.wsgi:application
fi