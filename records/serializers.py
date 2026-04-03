from rest_framework import serializers
from rest_framework.validators import ValidationError
from .models import Budget, Expenses, Source, Category, Income


class BudgetSerializer(serializers.ModelSerializer):

    class Meta:
        model = Budget
        fields = '__all__'
        extra_kwargs = {
            'user': {'write_only': True}
        }


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

    def validate(self, attrs):
        amount: float = attrs['amount']
        budget: Budget = attrs['budget']
        if budget.amount_left < amount:
            raise ValidationError(
                detail=f"This amount: {amount} is too large to fit in budget: {budget}")
        return super().validate(attrs)


class UpdateExpenseSerializer(serializers.ModelSerializer):

    class Meta:
        model = Expenses
        fields = '__all__'
        extra_kwargs = {
            'user': {'write_only': True}
        }

    def update(self, instance: Expenses, validated_data):
        old_amount: float = instance.amount
        old_budget: Budget = instance.budget
        amount: float = validated_data['amount']
        budget: Budget = validated_data['budget']

        if old_budget == budget:
            if budget.amount_left + old_amount < amount:
                raise ValidationError(
                    detail=f"This amount: {amount} is too large to fit in budget: {budget}")
        else:
            if budget.amount_left < amount:
                raise ValidationError(
                    detail=f"This amount: {amount} is too large to fit in budget: {budget}")

        return super().update(instance, validated_data)
