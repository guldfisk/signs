from distutils.util import strtobool

from django.db import transaction
from django.db.models import Sum, Case, When, IntegerField, F, Q
from django.db.models.functions import Coalesce
from django.http import Http404
from django.contrib.auth import get_user_model
from django.db.utils import IntegrityError

from rest_framework import status, generics, permissions
from rest_framework.exceptions import ValidationError
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.request import Request
from rest_framework.response import Response

from knox.models import AuthToken
from knox.auth import TokenAuthentication

from mocknames.generate import NameGenerator

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


class SearchView(generics.ListAPIView):
    queryset = models.Sign.objects.all()
    serializer_class = serializers.FullSignSerializer

    def filter_queryset(self, queryset):
        q: str = self.kwargs['query']
        if q.startswith('"') and q.endswith('"') and len(q) > 1:
            return queryset.filter(atom__meaning__iexact = q[1:-1])
        return queryset.filter(atom__meaning__icontains = q)


class SignFamiliarity(generics.GenericAPIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def patch(self, request: Request, pk: int) -> Response:
        try:
            value = int(request.data['familiarity'])
            if not value in range(0, 256):
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


class TrainingSetView(generics.RetrieveAPIView):
    queryset = models.TrainingSet.objects.all()
    serializer_class = serializers.TrainingSetWithFamiliaritySerializer
    permission_classes = (IsAuthenticatedOrReadOnly,)

    def filter_queryset(self, queryset):
        if self.request.user and self.request.user.is_authenticated:
            return queryset.filter(Q(public = True) | Q(creator = self.request.user))
        return queryset.filter(public = True)

    def post(self, request: Request, **kwargs) -> Response:
        instance = self.get_object()
        request.user.current_training_set = instance
        request.user.save(update_fields = ('current_training_set',))
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class AddSignView(generics.GenericAPIView):
    queryset = models.TrainingSet.objects.all()
    serializer_class = serializers.TrainingSetWithFamiliaritySerializer
    permission_classes = (IsAuthenticated,)

    def filter_queryset(self, queryset):
        return queryset.filter(Q(public = True) | Q(creator = self.request.user))

    def post(self, request: Request, **kwargs) -> Response:
        training_set = self.get_object()
        sign = get_object_or_404(models.Sign, pk = self.kwargs['sign_pk'])
        training_set.signs.add(sign)
        serializer = self.get_serializer(training_set)
        return Response(serializer.data)


class RemoveSignView(generics.GenericAPIView):
    queryset = models.TrainingSet.objects.all()
    serializer_class = serializers.TrainingSetWithFamiliaritySerializer
    permission_classes = (IsAuthenticated,)

    def filter_queryset(self, queryset):
        return queryset.filter(Q(public = True) | Q(creator = self.request.user))

    def post(self, request: Request, **kwargs) -> Response:
        training_set = self.get_object()
        sign = get_object_or_404(training_set.signs, pk = self.kwargs['sign_pk'])
        training_set.signs.remove(sign)
        serializer = self.get_serializer(training_set)
        return Response(serializer.data)


class MyTrainingSetView(generics.RetrieveAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = serializers.TrainingSetWithFamiliaritySerializer

    def get_object(self):
        training_set = self.request.user.current_training_set
        if not training_set:
            raise ValidationError('No training set')
        return training_set

    def post(self, request: Request, **kwargs) -> Response:
        try:
            auto = strtobool(str(request.data.get('auto', '1')))
            public = strtobool(str(request.data.get('public', '0')))

            name = request.data.get('name')
            if not name:
                name = NameGenerator().get_name()
            if not len(name) in range(5, 128):
                raise ValidationError('Invalid name')

            familiarity_threshold = int(request.data.get('familiarity_threshold', 3))
            if not familiarity_threshold in range(1, 256):
                raise ValidationError('Invalid familiarity_threshold')

            if auto:
                size = int(request.data.get('size', 50))
                if not size in range(1, 1000):
                    raise ValidationError('Invalid size')

        except ValueError as e:
            print(e)
            return Response(status = status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            training_set = models.TrainingSet.objects.create(
                name = name,
                creator = request.user,
                public = public,
            )

            if auto:
                signs = list(
                    models.Sign.objects.annotate(
                        familiarity = Coalesce(F('familiarities__level'), 0),
                    ).filter(
                        familiarity__lt = familiarity_threshold
                    ).order_by('?')[:size]
                )

                if len(signs) < size:
                    raise ValidationError('Insufficient un-trained signs for generating trainingset')

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

            request.user.current_training_set = training_set
            request.user.save(update_fields = ('current_training_set',))

        serializer = self.get_serializer(training_set)
        return Response(serializer.data)


class TrainingSetList(generics.ListAPIView):
    queryset = models.TrainingSet.objects.filter(public = True).order_by('-created_at')
    serializer_class = serializers.TrainingSetSerializer


class TrainingView(generics.GenericAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = serializers.TrainingSerializer

    def post(self, request: Request) -> Response:
        serializer: serializers.TrainingSerializer = self.get_serializer(data = request.data)
        serializer.is_valid(raise_exception = True)

        sign_id, success = serializer.validated_data['sign'], serializer.validated_data['success']

        training_set = request.user.current_training_set

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

        signs = training_set.signs.annotate(
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
            familiarity__lt = serializer.validated_data['threshold'],
        ).order_by('?')[:2]

        if not signs:
            return Response('Set completed', status = status.HTTP_204_NO_CONTENT)

        return Response(
            serializers.FullSignSerializer(
                (
                    signs[1]
                    if sign_id is not None and len(signs) > 1 and signs[0].id == sign_id else
                    signs[0]
                )
            ).data
        )


class RepetitionView(generics.GenericAPIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = serializers.TrainingSerializer

    def get(self, request: Request) -> Response:
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
            familiarity__gte = 1
        ).order_by('-familiarity', 'atom__meaning')

        return Response(
            [
                serializers.FullSignSerializerWithFamiliarity(
                    sign
                ).data
                for sign in
                signs
            ]
        )

    def post(self, request: Request) -> Response:
        serializer: serializers.RepetitionTrainingSerializer = self.get_serializer(data = request.data)
        serializer.is_valid(raise_exception = True)

        sign_id, success = serializer.validated_data['sign'], serializer.validated_data['success']

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
            familiarity__gte = 1,
            familiarity__lt = serializer.validated_data['threshold'],
        ).order_by('?')[:2]

        if not signs:
            return Response('No familiarity', status = status.HTTP_400_BAD_REQUEST)

        return Response(
            serializers.FullSignSerializer(
                (
                    signs[1]
                    if sign_id is not None and len(signs) > 1 and signs[0].id == sign_id else
                    signs[0]
                )
            ).data
        )
