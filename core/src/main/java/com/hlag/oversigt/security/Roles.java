package com.hlag.oversigt.security;

import java.util.Optional;

public enum Roles {
	ADMIN("Server Admin", "server.admin", Role.SERVER_ADMIN),
	DASHBOARD_OWNER("Owner", "server.dashboard.owner", Role.DASHBOARD_OWNER),
	DASHBOARD_EDITOR("Editor", "server.dashboard.editor", Role.DASHBOARD_EDITOR);

	private final String displayName;

	private final String name;

	private final Role role;

	Roles(final String displayName, final String name, final Role role) {
		this.displayName = displayName;
		this.name = name;
		this.role = role;
	}

	public String getDisplayName() {
		return displayName;
	}

	String getName() {
		return name;
	}

	public Role getRole() {
		return role;
	}

	public static Optional<Roles> fromString(final String string) {
		for (final Roles roles : values()) {
			if (roles.name().equalsIgnoreCase(string) || roles.name.equalsIgnoreCase(string)) {
				return Optional.of(roles);
			}
		}
		return Optional.empty();
	}
}
