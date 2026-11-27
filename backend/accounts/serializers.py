import os
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    staff_code = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'password',
            'first_name', 'last_name', 'role', 'staff_code',
            'department', 'phone', 'telegram_chat_id',
            'specialization', 'is_on_duty'
        ]

    def validate_email(self, value):
        email = value.strip().lower()
        allowed_domain = os.getenv('ALLOWED_EMAIL_DOMAIN', 'seu.edu.bd').strip().lower()

        if allowed_domain and not email.endswith(f'@{allowed_domain}'):
            raise serializers.ValidationError(
                f"Only official university emails (@{allowed_domain}) are allowed to register."
            )

        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("An account with this email already exists.")

        return email

    def validate_role(self, value):
        # Block public registration for admin role; only Django superuser can assign admin
        if value not in ['student', 'faculty', 'technician']:
            raise serializers.ValidationError(
                "Admin accounts cannot be created via public registration. Contact system superuser."
            )
        return value

    def validate(self, attrs):
        requested_role = attrs.get('role', 'student')
        staff_code = attrs.pop('staff_code', '').strip()
        expected_staff_code = os.getenv('STAFF_ACCESS_CODE', 'SEU-STAFF-2026')

        # Require secret staff access code for faculty and technician registration
        if requested_role in ['faculty', 'technician']:
            if not staff_code or staff_code != expected_staff_code:
                raise serializers.ValidationError({
                    'staff_code': f"Valid University Staff Access Code is required to register as {requested_role}."
                })

        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    specialization_display = serializers.CharField(source='get_specialization_display', read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'role_display', 'department', 'phone',
            'telegram_chat_id', 'specialization', 'specialization_display',
            'is_on_duty'
        ]
        # Prevent users from escalating their own role via profile update API
        read_only_fields = ['role']