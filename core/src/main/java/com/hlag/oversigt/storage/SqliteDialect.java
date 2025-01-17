package com.hlag.oversigt.storage;

import static java.util.stream.Collectors.joining;

import java.time.Duration;
import java.util.Collection;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class SqliteDialect implements SqlDialect {
	public SqliteDialect() {
		// no fields to be initialized
	}

	@Override
	public String getDriverClassName() {
		return "org.sqlite.JDBC";
	}

	@Override
	public String getJdbcConnectionUrl(final String location,
			@SuppressWarnings("unused") final String schemaName,
			@SuppressWarnings("unused") final String username,
			@SuppressWarnings("unused") final String password) {
		return "jdbc:sqlite:" + location;
	}

	@Override
	public String select(final String tableName,
			final Collection<String> select,
			final Collection<String> where,
			final Optional<String> columnIn,
			final boolean notIn,
			final long inValues) {
		String sql = "SELECT ";
		if (!select.isEmpty()) {
			sql += select.stream().collect(Collectors.joining(","));
		} else {
			sql += "*";
		}
		return sql + getFromAndWhere(tableName, where, columnIn, notIn, inValues);
	}

	private String getFromAndWhere(final String tableName,
			final Collection<String> where,
			final Optional<String> columnIn,
			final boolean notIn,
			final long inValues) {
		// from
		final StringBuilder sql = new StringBuilder(" FROM " + tableName);

		// where
		if (!where.isEmpty() || columnIn.isPresent() && inValues > 0) {
			sql.append(" WHERE ");

			// equals
			final boolean needAnd;
			if (!where.isEmpty()) {
				sql.append(where.stream().map(s -> s + " = ?").collect(Collectors.joining(" AND ")));
				needAnd = true;
			} else {
				needAnd = false;
			}

			// in
			if (columnIn.isPresent() && inValues > 0) {
				if (needAnd) {
					sql.append(" AND ");
				}
				if (notIn) {
					sql.append(" NOT ");
				}
				sql.append(columnIn.get()
						+ " IN ("
						+ Stream.generate(() -> "?").limit(inValues).collect(Collectors.joining(", "))
						+ ")");
			}
		} else if (inValues == -1) {
			sql.append(" WHERE 1 <> 1 -- IN values are not set");
		}
		return sql.toString();
	}

	@Override
	public String selectWithOneLike(final String tableName,
			final Collection<String> select,
			final Collection<String> columnsToCheck,
			final String columnWithLike) {
		String sql = "SELECT ";
		if (!select.isEmpty()) {
			sql += select.stream().collect(Collectors.joining(","));
		} else {
			sql += "*";
		}
		sql += " FROM " + tableName;
		sql += " WHERE ";
		if (!columnsToCheck.isEmpty()) {
			sql += columnsToCheck.stream().map(s -> s + "=?").collect(Collectors.joining(" AND ", "", " AND "));
		}
		sql += columnWithLike + " LIKE ?";
		return sql;
	}

	@Override
	public String insert(final String tableName, final Collection<String> columns) {
		String sql = "INSERT INTO " + tableName + " (";
		sql += columns.stream().collect(joining(","));
		sql += ") VALUES (";
		sql += columns.stream().map(s -> "?").collect(joining(","));
		sql += ")";
		return sql;
	}

	@Override
	public String update(final String tableName,
			final Collection<String> valueNames,
			final Collection<String> whereNames) {
		String sql = "UPDATE " + tableName + " SET ";
		sql += valueNames.stream().map(k -> k + "=?").collect(joining(","));
		sql += " WHERE ";
		sql += whereNames.stream().map(s -> s + "=?").collect(joining(" AND "));
		return sql;
	}

	@Override
	public String delete(final String tableName, final Collection<String> whereNames) {
		String sql = "DELETE FROM " + tableName + " WHERE ";
		sql += whereNames.stream().map(k -> k + " = ? ").collect(Collectors.joining(" AND "));
		return sql;
	}

	@Override
	public String delete(final String tableName,
			final Collection<String> where,
			final Optional<String> columnIn,
			final boolean notIn,
			final long inValues) {
		return "DELETE" + getFromAndWhere(tableName, where, columnIn, notIn, inValues);
	}

	@Override
	public String createTable(final String name, final ColumnOptions... columns) {
		String sql = "CREATE TABLE " + name + " (";
		final long pkColumnCount = Stream.of(columns).filter(c -> c.isPrimaryKey()).count();
		final boolean hasUnique = Stream.of(columns).filter(c -> c.isUnique()).findAny().isPresent();
		sql += Stream.of(columns).map(c -> getColumnDefinition(c, pkColumnCount == 1)).collect(Collectors.joining(","));
		if (pkColumnCount > 1) {
			sql += ", PRIMARY KEY ("
					+ Stream.of(columns)
							.filter(c -> c.isPrimaryKey())
							.map(c -> c.getName())
							.collect(Collectors.joining(","))
					+ ")";
		}
		if (hasUnique) {
			sql += ", UNIQUE ("
					+ Stream.of(columns)
							.filter(c -> c.isUnique())
							.map(c -> c.getName())
							.collect(Collectors.joining(","))
					+ ")";
		}
		sql += ")";
		return sql;
	}

	@Override
	public String alterTableAddColumn(final String tableName, final ColumnOptions option) {
		String sql
				= "ALTER TABLE " + tableName + " ADD COLUMN " + option.getName() + " " + getTypeName(option.getType());
		if (!option.isNullable()) {
			sql += " NOT NULL";
		}
		if (option.getDefaultValue() != null) {
			sql += " DEFAULT ";
			if (option.getDefaultValue() instanceof String) {
				sql += "'" + option.getDefaultValue() + "'";
			} else {
				sql += option.getDefaultValue();
			}
		}
		return sql;
	}

	@SuppressWarnings("unused")
	@Override
	public String alterTableDropColumn(final String tableName, final String columnName) {
		throw new UnsupportedOperationException("DROP COLUMN is not supported by SQLite");
	}

	@Override
	public Object convertValue(final Object object) {
		if (object instanceof Boolean) {
			return (Boolean) object ? 1 : 0;
		} else if (object instanceof Duration) {
			return ((Duration) object).getSeconds();
		} else {
			return object;
		}
	}

	private String getColumnDefinition(final ColumnOptions column, final boolean withPrimaryKey) {
		String sql = column.getName() + " " + getTypeName(column.getType());
		if (withPrimaryKey && column.isPrimaryKey()) {
			sql += " PRIMARY KEY";
		}
		if (column.isAutoincrement()) {
			sql += " AUTOINCREMENT";
		}
		if (column.isNullable()) {
			sql += " NULL";
		} else {
			sql += " NOT NULL";
		}
		if (column.getDefaultValue() != null && !column.isPrimaryKey() && !column.isUnique()) {
			sql += " DEFAULT ";
			if (column.getDefaultValue() instanceof String) {
				sql += "'" + column.getDefaultValue() + "'";
			} else {
				sql += column.getDefaultValue();
			}
		}
		return sql;
	}

	private String getTypeName(final ColumnType type) {
		switch (type) {
		case Text:
			return "TEXT";
		case Float:
			return "REAL";
		case Integer:
			return "INTEGER";
		case BigInteger:
			return "BIGINT";
		case Timestamp:
			return "TIMESTAMP";
		case Boolean:
			return "INTEGER(1)";
		case Date:
		case Time:
			return "TEXT";
		default:
			throw new RuntimeException("Unknown column type: " + type.name());
		}
	}
}
