from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from djoser.serializers import UserCreateSerializer as Base
from django.contrib.auth import get_user_model


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # подменяем username на email
        attrs['username'] = attrs.get('email')
        return super().validate(attrs)


User = get_user_model()

class UserCreateSerializer(Base):
    class Meta(Base.Meta):
        model = User
        fields = ("id", "email", "password")

    def create(self, validated_data):
        # username = email, чтобы удовлетворить стандартную модель
        validated_data["username"] = validated_data["email"]
        return super().create(validated_data)