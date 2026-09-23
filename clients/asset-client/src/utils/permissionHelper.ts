import ItemPermissionConstant from "@/constants/ItemPermissionConstant";

/**
 * Permission levels for hierarchy checking
 * NONE < READ < WRITE < DELETE
 */
export const PERMISSION_LEVELS = {
  NONE: 0,
  READ: 1,
  DOWNLOAD: 1, // Same level as READ
  WRITE: 2,
  DELETE: 3,
} as const;

/**
 * Get numeric permission level from permission string
 * @param permission - Permission string (e.g., "READ", "WRITE", "READ,WRITE,DELETE")
 * @returns Numeric permission level
 */
export function getPermissionLevel(permission?: string | null): number {
  if (!permission) return PERMISSION_LEVELS.NONE;

  const upperPermission = permission.toUpperCase();

  // Check for highest permission first
  if (upperPermission.includes(ItemPermissionConstant.DELETE)) {
    return PERMISSION_LEVELS.DELETE;
  }
  if (upperPermission.includes(ItemPermissionConstant.WRITE)) {
    return PERMISSION_LEVELS.WRITE;
  }
  if (
    upperPermission.includes(ItemPermissionConstant.READ) ||
    upperPermission.includes(ItemPermissionConstant.DOWNLOAD)
  ) {
    return PERMISSION_LEVELS.READ;
  }

  return PERMISSION_LEVELS.NONE;
}

export function canPerformAction(
  userPermission?: string | null,
  requiredPermission: "READ" | "WRITE" | "DELETE" = "READ",
): boolean {
  const userLevel = getPermissionLevel(userPermission);
  let requiredLevel: number = PERMISSION_LEVELS.READ;

  if (
    requiredPermission === "WRITE" ||
    requiredPermission === (ItemPermissionConstant.WRITE as string)
  ) {
    requiredLevel = PERMISSION_LEVELS.WRITE;
  } else if (
    requiredPermission === "DELETE" ||
    requiredPermission === (ItemPermissionConstant.DELETE as string)
  ) {
    requiredLevel = PERMISSION_LEVELS.DELETE;
  }

  return userLevel >= requiredLevel;
}

/**
 * Check if user can view/read an item
 */
export function canRead(permission?: string | null): boolean {
  return canPerformAction(permission, "READ");
}

/**
 * Check if user can share/edit an item
 */
export function canWrite(permission?: string | null): boolean {
  return canPerformAction(permission, "WRITE");
}

/**
 * Check if user can delete an item
 */
export function canDelete(permission?: string | null): boolean {
  return canPerformAction(permission, "DELETE");
}

/**
 * Get permission display label
 */
export function getPermissionLabel(permission?: string | null): string {
  if (!permission) return "Không có quyền";

  const permissions: string[] = [];
  const upperPermission = permission.toUpperCase();

  if (upperPermission.includes(ItemPermissionConstant.READ)) {
    permissions.push(
      ItemPermissionConstant.getDisplayName(
        ItemPermissionConstant.READ,
      ) as string,
    );
  }
  if (upperPermission.includes(ItemPermissionConstant.WRITE)) {
    permissions.push(
      ItemPermissionConstant.getDisplayName(
        ItemPermissionConstant.WRITE,
      ) as string,
    );
  }
  if (upperPermission.includes(ItemPermissionConstant.DELETE)) {
    permissions.push(
      ItemPermissionConstant.getDisplayName(
        ItemPermissionConstant.DELETE,
      ) as string,
    );
  }
  if (upperPermission.includes(ItemPermissionConstant.DOWNLOAD)) {
    permissions.push(
      ItemPermissionConstant.getDisplayName(
        ItemPermissionConstant.DOWNLOAD,
      ) as string,
    );
  }

  return permissions.join(", ") || "Không rõ";
}
