from rest_framework.views import APIView
from rest_framework.response import Response
from core.permissions import IsAnalystOrAdmin
from .services import get_summary


class SummaryView(APIView):
    permission_classes = [IsAnalystOrAdmin]

    def get(self, request):
        return Response(get_summary(request.user))
