from rest_framework.permissions import BasePermission, SAFE_METHODS


def _authenticated(request):
    return bool(request.user and request.user.is_authenticated)


class IsAdmin(BasePermission):
    """Only admin role."""
    def has_permission(self, request, view):
        return _authenticated(request) and request.user.role == 'admin'


class IsAnalystOrAdmin(BasePermission):
    """Analyst or admin role."""
    def has_permission(self, request, view):
        return _authenticated(request) and request.user.role in ('analyst', 'admin')


class IsViewerOrAbove(BasePermission):
    """Any authenticated user regardless of role."""
    def has_permission(self, request, view):
        return _authenticated(request)


class ReadOnlyForViewer(BasePermission):
    """
    Viewer → GET/HEAD/OPTIONS only.
    Analyst / Admin → full access.
    """
    def has_permission(self, request, view):
        if not _authenticated(request):
            return False
        if request.user.role in ('analyst', 'admin'):
            return True
        # viewer gets read-only
        return request.method in SAFE_METHODS
