import typing as t

from distutils.util import strtobool

from django.contrib.auth import authenticate, get_user_model
from rest_framework import serializers

from api import models

DATETIME_FORMAT = '%Y-%m-%dT%H:%M:%S'


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ('id', 'username')


class SignupSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
    email = serializers.CharField()

    def update(self, instance, validated_data):
        raise NotImplemented()

    def create(self, validated_data):
        raise NotImplemented()


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(**data)
        if user and user.is_active:
            return user
        raise serializers.ValidationError('Unable to login')

    def update(self, instance, validated_data):
        raise NotImplemented()

    def create(self, validated_data):
        raise NotImplemented()


class SignSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Sign
        fields = ('id', 'external_id',)


class MinimalSemanticAtomSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.SemanticAtom
        fields = ('id', 'meaning')


class FullSignSerializer(serializers.ModelSerializer):
    atom = MinimalSemanticAtomSerializer()

    class Meta:
        model = models.Sign
        fields = ('id', 'external_id', 'atom')


class SemanticAtomSerializer(serializers.ModelSerializer):
    signs = SignSerializer(many = True)


    class Meta:
        model = models.SemanticAtom
        fields = ('id', 'meaning', 'signs')
