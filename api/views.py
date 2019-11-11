import string
import typing as t

import datetime
import hashlib
import random

from distutils.util import strtobool

from django.db import transaction
from django.db.models import Sum, Case, When, IntegerField, F
from django.http import HttpResponse, HttpRequest, Http404
from django.contrib.auth import get_user_model
from django.db.utils import IntegrityError
from django.template.loader import get_template
from django.conf import settings
from knox.auth import TokenAuthentication

from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
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
    serializer_class = serializers.FullSignSerializer


class SemanticAtomView(generics.RetrieveAPIView):
    queryset = models.SemanticAtom.objects.all()
    serializer_class = serializers.SemanticAtomSerializer


class SignFamiliarity(generics.GenericAPIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def patch(self, request: Request, pk: int) -> Response:
        try:
            value = int(request.data['familiarity'])
            if not value in range(1, 256):
                raise ValueError
        except (ValueError, KeyError):
            return Response(status = status.HTTP_400_BAD_REQUEST)

        try:
            sign = models.Sign.objects.get(id = pk)
        except models.Sign.DoesNotExist:
            raise Http404

        familiarity, _ = models.Familiarity.objects.get_or_create(
            user = request.user,
            sign = sign,
        )
        familiarity.level = value
        familiarity.save(update_fields = ('level',))

        return Response(status = status.HTTP_200_OK)


class TrainingSetView(generics.GenericAPIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get(self, request: Request) -> Response:
        training_set = request.user.training_sets.order_by('created_at').last()

        if not training_set:
            return Response(status = status.HTTP_400_BAD_REQUEST)

        signs = training_set.signs.select_related('atom').annotate(
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
        ).order_by('-familiarity', 'atom__meaning')

        return Response(
            {
                'id': training_set.id,
                'threshold': training_set.threshold,
                'size': training_set.size,
                'signs': [
                    serializers.FullSignSerializerWithFamiliarity(
                        sign
                    ).data
                    for sign in
                    signs
                ]
            }
        )

    def post(self, request: Request) -> Response:
        try:
            familiarity_threshold = int(request.data.get('familiarity_threshold', 3))
            size = int(request.data.get('size', 50))
            if not size in range(1, 1000) or not familiarity_threshold in range(1, 10):
                raise ValueError()
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

        return Response(
            {
                'id': training_set.id,
                'threshold': training_set.threshold,
                'size': training_set.size,
                'signs': [
                    serializers.FullSignSerializerWithFamiliarity(
                        sign
                    ).data
                    for sign in
                    sorted(
                        sorted(
                            signs,
                            key = lambda sign: sign.atom.meaning,
                        ),
                        key = lambda sign: sign.familiarity,
                        reverse = True,
                    )
                ]
            }
        )


class TrainingView(generics.GenericAPIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = serializers.TrainingSerializer

    def post(self, request: Request) -> Response:
        serializer: serializers.TrainingSerializer = self.get_serializer(data = request.data)
        serializer.is_valid(raise_exception = True)

        sign_id, success = serializer.validated_data['sign'], serializer.validated_data['success']

        training_set = request.user.training_sets.order_by('created_at').last()

        if not training_set:
            return Response(status = status.HTTP_400_BAD_REQUEST)

        if sign_id is not None:
            if success is None:
                return Response(status = status.HTTP_400_BAD_REQUEST)

            try:
                sign = models.Sign.objects.get(id = sign_id)
            except models.Sign.DoesNotExist:
                raise Http404

            familiarity, _ = models.Familiarity.objects.get_or_create(
                user = request.user,
                sign = sign,
            )

            if success:
                familiarity.level += 1
            else:
                familiarity.level = 0

            familiarity.save(update_fields = ('level',))

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

        if sign is None:
            return Response('Set completed', status = status.HTTP_204_NO_CONTENT)

        return Response(
            serializers.FullSignSerializer(
                sign
            ).data
        )
