from rest_framework import serializers
from rest_framework.validators import ValidationError
from .models import Budget, Expenses, Source, Category, Income


class BudgetSerializer(serializers.ModelSerializer):
    amount_used = serializers.ReadOnlyField()
    amount_left = serializers.ReadOnlyField()
    has_expired = serializers.ReadOnlyField()

    class Meta:
        model = Budget
        fields = '__all__'
        extra_kwargs = {
            'user': {'write_only': True}
        }

    def validate_total_amount(self, value):
        if value is None:
            raise serializers.ValidationError("Amount must not be null.")
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0.")
        return value


class SourceSerializer(serializers.ModelSerializer):

    class Meta:
        model = Source
        fields = '__all__'
        extra_kwargs = {
            'user': {'write_only': True}
        }


class CategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Category
        fields = '__all__'
        extra_kwargs = {
            'user': {'write_only': True}
        }


class IncomeSerializer(serializers.ModelSerializer):

    source = SourceSerializer(many=True, required=False)

    class Meta:
        model = Income
        fields = '__all__'
        extra_kwargs = {
            'user': {'write_only': True},
            'amount': {'required': False}
        }


class CreateIncomeSerializer(serializers.ModelSerializer):

    class Meta:
        model = Income
        fields = '__all__'
        extra_kwargs = {
            'user': {'write_only': True},
            'amount': {'required': True}
        }

    def validate_amount(self, value):
        if value is None:
            raise serializers.ValidationError("Amount must not be null.")
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0.")
        return value

    def validate_title(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Title must not be blank.")
        return value.strip()

    def validate(self, data):
        if 'amount' not in data or data['amount'] is None:
            raise serializers.ValidationError({"amount": "Amount is required."})
        return data


class ExpenseSerializer(serializers.ModelSerializer):

    categories = CategorySerializer(many=True, required=False)
    budget = BudgetSerializer(many=False, read_only=True)

    class Meta:
        model = Expenses
        fields = '__all__'
        extra_kwargs = {
            'user': {'write_only': True}
        }


class CreateExpenseSerializer(serializers.ModelSerializer):

    class Meta:
        model = Expenses
        fields = '__all__'
        extra_kwargs = {
            'user': {'write_only': True}
        }

    def validate_amount(self, value):
        if value is None:
            raise serializers.ValidationError("Amount must not be null.")
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0.")
        return value

    def validate_title(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Title must not be blank.")
        return value.strip()

    def validate(self, attrs):
        amount: float = attrs.get('amount')
        budget: Budget = attrs.get('budget')

        if amount is None:
            raise serializers.ValidationError({"amount": "Amount is required."})
        if budget is None:
            raise serializers.ValidationError({"budget": "Budget is required."})

        if budget.amount_left < amount:
            raise ValidationError(
                detail=f"Amount {amount} exceeds remaining budget balance of {budget.amount_left:.2f}."
            )
        return super().validate(attrs)


class UpdateExpenseSerializer(serializers.ModelSerializer):

    class Meta:
        model = Expenses
        fields = '__all__'
        extra_kwargs = {
            'user': {'write_only': True}
        }

    def validate_amount(self, value):
        if value is None:
            raise serializers.ValidationError("Amount must not be null.")
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0.")
        return value

    def update(self, instance: Expenses, validated_data):
        old_amount: float = instance.amount
        old_budget: Budget = instance.budget
        amount: float = validated_data['amount']
        budget: Budget = validated_data['budget']

        if old_budget == budget:
            if budget.amount_left + old_amount < amount:
                raise ValidationError(
                    detail=f"Amount {amount} exceeds remaining budget balance of {budget.amount_left + old_amount:.2f}."
                )
        else:
            if budget.amount_left < amount:
                raise ValidationError(
                    detail=f"Amount {amount} exceeds remaining budget balance of {budget.amount_left:.2f}."
                )

        return super().update(instance, validated_data)
