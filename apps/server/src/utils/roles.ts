export type UserRole = "admin" | "user";

export const normalizeRoles = (value: unknown): UserRole[] => {
    if (Array.isArray(value)) {
        const roles = value.filter((item): item is UserRole =>
            typeof item === "string" && ["admin", "user"].includes(item as UserRole),
        );

        if (roles.length > 0) {
            return Array.from(new Set(roles));
        }
    }

    if (typeof value === "string") {
        if (value === "admin") {
            return ["admin"];
        }

        if ( value === "user") {
            return ["user"];
        }
    }

    return ["user"];
};

export const getPrimaryRole = (roles: UserRole[]): UserRole => {
    if (roles.includes("admin")) return "admin";
    return "user";
};

// export const hasRole = (value: unknown, targetRole: UserRole): boolean => {
//     return normalizeRoles(value).includes(targetRole);
// };
