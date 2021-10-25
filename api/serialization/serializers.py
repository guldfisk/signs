from django.contrib.auth import authenticate, get_user_model
from django.db.models import F
from django.db.models.functions import Coalesce

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
        fields = ('id', 'video_id', 'thumb_id')


class MinimalSemanticAtomSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.SemanticAtom
        fields = ('id', 'meaning', 'external_id')


class FullSignSerializer(serializers.ModelSerializer):
    atom = MinimalSemanticAtomSerializer()

    class Meta:
        model = models.Sign
        fields = ('id', 'video_id', 'thumbnail_id', 'atom')


class FullSignSerializerWithFamiliarity(serializers.ModelSerializer):
    atom = MinimalSemanticAtomSerializer()
    familiarity = serializers.IntegerField()

    class Meta:
        model = models.Sign
        fields = ('id', 'video_id', 'thumbnail_id', 'atom', 'familiarity')


class SemanticAtomSerializer(serializers.ModelSerializer):
    signs = SignSerializer(many = True)

    class Meta:
        model = models.SemanticAtom
        fields = ('id', 'meaning', 'signs', 'external_id')


class TrainingSetSerializer(serializers.ModelSerializer):
    signs = FullSignSerializer(many = True)

    class Meta:
        model = models.TrainingSet
        fields = ('id', 'signs', 'name')


class TrainingSetWithFamiliaritySerializer(TrainingSetSerializer):
    signs = serializers.SerializerMethodField()

    @classmethod
    def get_signs(cls, instance: models.TrainingSet):
        return [
            FullSignSerializerWithFamiliarity(sign).data
            for sign in
            instance.signs.select_related('atom').annotate(
                familiarity = Coalesce(F('familiarities__level'), 0),
            ).order_by('-familiarity', 'atom__meaning')
        ]


class TrainingSerializer(serializers.Serializer):
    sign = serializers.IntegerField(allow_null = True, required = False, default = None)
    success = serializers.BooleanField(allow_null = True, required = False, default = None)
    threshold = serializers.IntegerField(required = True)

    def update(self, instance, validated_data):
        raise NotImplemented()

    def create(self, validated_data):
        raise NotImplemented()
