import string
import typing as t

import datetime
import hashlib
import random

from distutils.util import strtobool

from django.db import transaction
from django.db.models import Sum, Case, When, IntegerField, F
from django.http import HttpResponse, HttpRequest
from django.contrib.auth import get_user_model
from django.db.utils import IntegrityError
from django.template.loader import get_template
from django.conf import settings

from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view
from rest_framework.request import Request
from rest_framework.response import Response

from knox.models import AuthToken

from api import models
from api.serialization import serializers


class SignupEndpoint(generics.GenericAPIView):
    serializer_class = serializers.SignupSerializer

    def post(self, request, *args, **kwargs):
        serializer: serializers.SignupSerializer = self.get_serializer(data = request.data)
        serializer.is_valid(raise_exception = True)

        try:
            new_user = get_user_model().objects.create_user(
                username = serializer.validated_data['username'],
                password = serializer.validated_data['password'],
                email = serializer.validated_data['email'],
            )
        except IntegrityError:
            return Response('User with that username already exists', status = status.HTTP_409_CONFLICT)

        _, auth_token = AuthToken.objects.create(new_user)

        return Response(
            {
                "user": serializers.UserSerializer(
                    new_user,
                    context = self.get_serializer_context(),
                ).data,
                "token": auth_token,
            }
        )


class LoginEndpoint(generics.GenericAPIView):
    serializer_class = serializers.LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data = request.data)
        serializer.is_valid(raise_exception = True)
        user = serializer.validated_data

        _, token = AuthToken.objects.create(user)

        return Response(
            {
                "user": serializers.UserSerializer(
                    user,
                    context = self.get_serializer_context(),
                ).data,
                "token": token,
            }
        )


class UserEndpoint(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = serializers.UserSerializer

    def get_object(self):
        return self.request.user


class UserList(generics.ListAPIView):
    queryset = get_user_model().objects.all()
    serializer_class = serializers.UserSerializer


class UserDetail(generics.RetrieveAPIView):
    queryset = get_user_model().objects.all()
    serializer_class = serializers.UserSerializer


class SignView(generics.RetrieveAPIView):
    queryset = models.Sign.objects.all()
    serializer_class = serializers.SignSerializer


class SemanticAtomView(generics.RetrieveAPIView):
    queryset = models.SemanticAtom.objects.all()
    serializer_class = serializers.SemanticAtomSerializer


@api_view(['POST'])
def create_training_set(request: Request) -> Response:
    if not request.user:
        return Response(status = status.HTTP_403_FORBIDDEN)
    try:
        familiarity_threshold = int(request.query_params.get('familiarity_threshold', 3))
        size = int(request.query_params.get('size', 50))
    except ValueError:
        return Response(status = status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        signs = models.Sign.objects.annotate(
            familiarity = Sum(
                Case(
                    When(
                        familiarities__user = request.user,
                        then = F('familiarities__level')
                    ),
                    default = 0,
                    output_field = IntegerField(),
                )
            )
        ).filter(
            familiarity__lt = familiarity_threshold
        ).order_by('?')[:size]

        training_set = models.TrainingSet.objects.create(
            user = request.user,
            threshold = familiarity_threshold,
            size = size,
        )

        join_model = models.TrainingSet.signs.through

        join_model.objects.bulk_create(
            [
                join_model(
                    trainingset_id = training_set.id,
                    sign_id = sign.id,
                )
                for sign in
                signs
            ]
        )

    return Response('ok')


@api_view(['GET'])
def get_sign(request: Request) -> Response:
    if not request.user:
        return Response(status = status.HTTP_403_FORBIDDEN)

    training_set = request.user.training_sets.order_by('created_at').last()

    if not training_set:
        return Response(status = status.HTTP_400_BAD_REQUEST)

    sign = training_set.signs.annotate(
        familiarity = Sum(
            Case(
                When(
                    familiarities__user = request.user,
                    then = F('familiarities__level'),
                ),
                default = 0,
                output_field = IntegerField(),
            )
        )
    ).filter(
        familiarity__lt = training_set.threshold
    ).order_by('?').first()

    return Response(
        serializers.FullSignSerializer(
            sign
        ).data
    )
