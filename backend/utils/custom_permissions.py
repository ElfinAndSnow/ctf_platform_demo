from rest_framework import permissions


class IsAdminOrAuthorOrReadOnly(permissions.BasePermission):
    """
    Object-level permission to only allow owners of an object to edit it.
    Assumes the model instance has an `owner` attribute.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Instance must have an attribute named `owner`.
        return (obj.author == request.user) or request.user.is_staff


class IsAdminOrSessionCreator(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # print("obj.user: " + obj.user.username)
        # print("request.user: " + request.user.username)
        return obj.user == request.user or request.user.is_staff
