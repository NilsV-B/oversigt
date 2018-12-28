package com.hlag.oversigt.properties;

import com.hlag.oversigt.properties.SerializableProperty.Description;

@Description("A connection to a database. Enter details to the JDBC connection so the connection information can be reused for multiple event sources.")
public class DatabaseConnection extends SerializableProperty {
	public static final DatabaseConnection EMPTY = new DatabaseConnection(0, "", "", "");

	@Member(icon = "file", size = 4)
	private String driverClassName;
	@Member(icon = "cloud", size = 4)
	private String jdbcUrl;

	public DatabaseConnection(int id, String name, String driverClassName, String jdbcUrl) {
		super(id, name);
		this.driverClassName = driverClassName;
		this.jdbcUrl = jdbcUrl;
	}

	public String getDriverClassName() {
		return driverClassName;
	}

	public Class<?> loadDriverClass() throws ClassNotFoundException {
		return Class.forName(getDriverClassName());
	}

	public String getJdbcUrl() {
		return jdbcUrl;
	}

}
