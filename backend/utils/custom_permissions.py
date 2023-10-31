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


class IsAdminOrSelf(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj == request.user or request.user.is_staff


class IsNotPrivateOrSelf(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return (not obj.is_private) or obj == request.user


class IsSelf(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj == request.user


class DisallowAny(permissions.BasePermission):
    def has_permission(self, request, view):
        return False


class IsActivatedUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_email_verified

# Add IsTeamLeader permission class


class IsTeamLeader(permissions.BasePermission):
    def has_permission(self, request, view):
        # 检查用户是否是队长
        team = view.get_object()
        return request.user == team.leader

    def has_object_permission(self, request, view, obj):
        # 进一步检查是否有权限操作对象
        return request.user == obj.leader


class IsTeamMate(permissions.BasePermission):
    def has_permission(self, request, view):
        # 在列表视图中检查用户是否是队员
        team = view.get_object()
        return request.user in team.members.all()

    def has_object_permission(self, request, view, obj):
        # 在对象级别视图中检查用户是否是队员
        return request.user in obj.members.all()
