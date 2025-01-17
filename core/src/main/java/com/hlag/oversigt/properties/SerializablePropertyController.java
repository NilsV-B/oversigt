package com.hlag.oversigt.properties;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hlag.oversigt.properties.SerializableProperty.Description;
import com.hlag.oversigt.storage.Storage;
import com.hlag.oversigt.util.TypeUtils;
import com.hlag.oversigt.util.TypeUtils.SerializablePropertyMember;
import com.hlag.oversigt.util.TypeUtils.SerializablePropertyMember.MemberMissingException;

import edu.umd.cs.findbugs.annotations.Nullable;

@Singleton
public class SerializablePropertyController {
	private static final Logger LOGGER = LoggerFactory.getLogger(SerializablePropertyController.class);

	private final Map<String, Class<SerializableProperty>> namesToClasses;

	private final Map<Class<? extends SerializableProperty>, SerializableProperty> classToEmpty = new HashMap<>();

	private final Storage storage;

	private final Map<Integer, SerializableProperty> properties = new HashMap<>();

	@Inject
	public SerializablePropertyController(final Storage storage) {
		this.storage = storage;
		namesToClasses = TypeUtils.findClasses(getClass().getPackage(), SerializableProperty.class)
				.peek(c -> classToEmpty.put(c, createEmptyItem(c)))
				.collect(Collectors.toMap(Class::getSimpleName, Function.identity()));
		LOGGER.info("Loaded serializable property classes: {}", namesToClasses.keySet().toString());

		properties.putAll(namesToClasses.values()
				.stream()
				.flatMap(c -> storage.listProperties(c).stream())
				.collect(Collectors.toMap(SerializableProperty::getId, Function.identity())));
	}

	public Collection<String> getNames() {
		return namesToClasses.keySet();
	}

	@SuppressWarnings("unchecked")
	public <T extends SerializableProperty> Stream<T> streamProperties(final Class<T> clazz) {
		return properties.values().stream().filter(p -> p.getClass() == clazz).map(p -> (T) p);
	}

	@SuppressWarnings("unchecked")
	public <T extends SerializableProperty> T getProperty(final Class<T> clazz, final int id) {
		return id == 0 ? getEmpty(clazz) : (T) Optional.ofNullable(properties.get(id)).get();
	}

	public Class<? extends SerializableProperty> getClass(final String name) {
		return Optional.ofNullable(namesToClasses.get(name)).get();
	}

	public Set<Class<? extends SerializableProperty>> getClasses() {
		return classToEmpty.keySet();
	}

	public String getDescription(final String name) {
		return getDescription(getClass(name));
	}

	private String getDescription(@Nullable final Class<? extends SerializableProperty> clazz) {
		return Optional.ofNullable(clazz)
				.map(c -> c.getAnnotation(Description.class))
				.map(Description::value)
				.orElse("");
	}

	public Collection<SerializablePropertyMember> getMembers(final Class<? extends SerializableProperty> clazz) {
		return TypeUtils.getSerializablePropertyMembers(clazz);
	}

	public String toString(@Nullable final SerializableProperty value) {
		return value == null ? "0" : Integer.toString(value.getId());
	}

	public <T extends SerializableProperty> T createProperty(final Class<T> clazz,
			final String name,
			final Map<String, Object> parameters) {
		return createProperty(clazz,
				name,
				getMembers(clazz).stream().filter(m -> !"name".equals(m.getName())).map(m -> {
					try {
						return m.createInstance((String) parameters.get(m.getName()));
					} catch (final MemberMissingException e) {
						throw new RuntimeException("Unknown member: " + m.getName(), e);
					}
				}).collect(Collectors.toList()));
	}

	public <T extends SerializableProperty> T createProperty(final Class<T> clazz,
			final String name,
			final List<Object> parameters) {
		final T property = storage.createProperty(clazz, name, parameters.toArray());
		properties.put(property.getId(), property);
		return property;
	}

	public void updateProperty(final SerializableProperty property) {
		if (!properties.values().contains(property)) {
			final SerializableProperty real = getProperty(property.getClass(), property.getId());
			TypeUtils.getSerializablePropertyMembers(property.getClass()).forEach(m -> m.set(real, m.get(property)));
			storage.updateProperty(real);
		} else {
			storage.updateProperty(property);
		}
	}

	public void deleteProperty(final Class<? extends SerializableProperty> clazz, final int id) {
		storage.deleteProperty(clazz, id);
		properties.remove(id);
	}

	@SuppressWarnings("unchecked")
	public <T extends SerializableProperty> T getEmpty(final Class<T> clazz) {
		return (T) classToEmpty.get(clazz);
	}

	private static SerializableProperty createEmptyItem(final Class<? extends SerializableProperty> clazz) {
		if (SerializableProperty.class.isAssignableFrom(clazz)) {
			try {
				return (SerializableProperty) clazz.getField("EMPTY").get(null);
			} catch (final IllegalArgumentException
					| IllegalAccessException
					| NoSuchFieldException
					| SecurityException e) {
				throw new RuntimeException("Unable to get field 'EMPTY' from type " + clazz.getSimpleName(), e);
			}
		}
		throw new RuntimeException(
				"Type " + clazz.getName() + " is not a " + SerializableProperty.class.getSimpleName());
	}
}
