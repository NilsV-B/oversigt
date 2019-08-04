package com.hlag.oversigt.core.configuration;

import static com.hlag.oversigt.util.TypeUtils.deserializer;
import static com.hlag.oversigt.util.TypeUtils.serializer;

import java.io.IOException;
import java.time.Duration;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.EnumSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.PropertyAccessor;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.datatype.jdk8.Jdk8Module;
import com.fasterxml.jackson.datatype.jsr310.deser.InstantDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.ZonedDateTimeSerializer;
import com.google.inject.AbstractModule;
import com.google.inject.Inject;
import com.google.inject.Provides;
import com.google.inject.Singleton;
import com.google.inject.name.Named;
import com.hlag.oversigt.properties.Color;
import com.hlag.oversigt.properties.SerializableProperty;
import com.hlag.oversigt.properties.SerializablePropertyController;
import com.hlag.oversigt.util.JsonUtils;
import com.jayway.jsonpath.Option;
import com.jayway.jsonpath.spi.json.JacksonJsonProvider;
import com.jayway.jsonpath.spi.json.JsonProvider;
import com.jayway.jsonpath.spi.mapper.JacksonMappingProvider;
import com.jayway.jsonpath.spi.mapper.MappingProvider;

import edu.umd.cs.findbugs.annotations.Nullable;

public class JsonModule extends AbstractModule {
	@Override
	protected void configure() {
		// JSON handling
		requestStaticInjection(JsonUtils.class);
	}

	@Singleton
	@Provides
	@Named("all-fields")
	ObjectMapper provideAllFieldsObjectMapper() {
		final SimpleModule module = new SimpleModule("Oversigt-API");
		module.addSerializer(Color.class, serializer(Color.class, Color::getHexColor));
		module.addDeserializer(Color.class, deserializer(Color.class, Color::parse));
		module.addSerializer(Duration.class, serializer(Duration.class, Duration::toString));
		module.addDeserializer(Duration.class, deserializer(Duration.class, Duration::parse));
		module.addSerializer(ZonedDateTime.class, ZonedDateTimeSerializer.INSTANCE);
		module.addDeserializer(ZonedDateTime.class, InstantDeserializer.ZONED_DATE_TIME);
		module.addSerializer(LocalDate.class, serializer(LocalDate.class, DateTimeFormatter.ISO_DATE::format));
		module.addDeserializer(LocalDate.class,
				deserializer(LocalDate.class, s -> LocalDate.from(DateTimeFormatter.ISO_DATE.parse(s))));
		// module.addDeserializer(Credentials.class, new JsonDeserializer<Credentials>()
		// {
		// @Override
		// @Nullable
		// public Credentials deserialize(@Nullable final JsonParser p, @Nullable final
		// DeserializationContext ctxt)
		// throws IOException, JsonProcessingException {
		// Objects.requireNonNull(p);
		// final TreeNode tree = p.readValueAsTree();
		// System.out.println(tree);
		// return null;
		// }
		//
		// });
		// mapper
		final ObjectMapper objectMapper = new ObjectMapper();
		objectMapper.registerModule(module);
		objectMapper.registerModule(new Jdk8Module());
		objectMapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);

		final ObjectMapper allFieldsObjectMapper = objectMapper.copy();
		allFieldsObjectMapper.setVisibility(PropertyAccessor.ALL, Visibility.NONE);
		allFieldsObjectMapper.setVisibility(PropertyAccessor.FIELD, Visibility.ANY);
		allFieldsObjectMapper.setSerializationInclusion(Include.NON_NULL);
		return allFieldsObjectMapper;
	}

	@Inject
	@Singleton
	@Provides
	@Named("only-annotated")
	ObjectMapper provideOnlyAnnotatedObjectMapper(@Named("all-fields") final ObjectMapper source,
			final SerializablePropertyController spc) {
		final ObjectMapper objectMapper = source.copy();

		final SimpleModule module = new SimpleModule("Serializable-Properties");
		module.addDeserializer(SerializableProperty.class, new JsonDeserializer<SerializableProperty>() {

			@Override
			@Nullable
			public SerializableProperty deserialize(@Nullable final JsonParser p,
					@Nullable final DeserializationContext ctxt) throws IOException, JsonProcessingException {
				// TODO Auto-generated method stub
				return null;
			}

		});
		objectMapper.registerModule(module);

		objectMapper.setVisibility(PropertyAccessor.ALL, Visibility.DEFAULT);
		objectMapper.setVisibility(PropertyAccessor.FIELD, Visibility.DEFAULT);
		objectMapper.setSerializationInclusion(Include.USE_DEFAULTS);
		return objectMapper;
	}

	/**
	 * Create the configuration for the used JSONPath implementation
	 *
	 * @return the configuration
	 */
	@Singleton
	@Provides
	com.jayway.jsonpath.Configuration provideJsonpathConfiguration() {
		final JsonProvider jsonProvider = new JacksonJsonProvider();
		final MappingProvider mappingProvider = new JacksonMappingProvider();

		final com.jayway.jsonpath.Configuration jsonpathConfiguration
				= com.jayway.jsonpath.Configuration.builder().options(Option.DEFAULT_PATH_LEAF_TO_NULL).build();
		com.jayway.jsonpath.Configuration.setDefaults(new com.jayway.jsonpath.Configuration.Defaults() {
			@Override
			public Set<Option> options() {
				return EnumSet.noneOf(Option.class);
			}

			@Override
			public MappingProvider mappingProvider() {
				return mappingProvider;
			}

			@Override
			public JsonProvider jsonProvider() {
				return jsonProvider;
			}
		});
		return jsonpathConfiguration;
	}
}
