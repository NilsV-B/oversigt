/*
 * Copyright (C) 2012 Atlassian
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
/**
 * This class has been copied to overwrite the SocketTimeout option.
 */
package com.atlassian.jira.rest.client.internal.async;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.util.Date;
import java.util.Properties;
import java.util.concurrent.TimeUnit;

import javax.annotation.Nonnull;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.atlassian.event.api.EventPublisher;
import com.atlassian.httpclient.apache.httpcomponents.DefaultHttpClientFactory;
import com.atlassian.httpclient.api.HttpClient;
import com.atlassian.httpclient.api.factory.HttpClientOptions;
import com.atlassian.jira.rest.client.api.AuthenticationHandler;
import com.atlassian.sal.api.ApplicationProperties;
import com.atlassian.sal.api.UrlMode;
import com.atlassian.sal.api.executor.ThreadLocalContextManager;
import com.hlag.oversigt.connect.jira.config.JiraConfigurationProvider;

import de.larssh.utils.annotations.PackagePrivate;
import de.larssh.utils.function.ThrowingRunnable;
import edu.umd.cs.findbugs.annotations.Nullable;
import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;

/**
 * Factory for asynchronous http clients.
 *
 * <p>
 * This class has been copied to overwrite the SocketTimeout option.
 *
 * @since v2.0
 */
@SuppressWarnings({
		"checkstyle:JavadocVariable",
		"checkstyle:MissingJavadocMethod",
		"checkstyle:MissingJavadocType",
		"javadoc",
		"PMD.CommentRequired" })
public class AsynchronousHttpClientFactory {
	public AsynchronousHttpClientFactory() {
		// nothing to do
	}

	public DisposableHttpClient createClient(final URI serverUri, final AuthenticationHandler authenticationHandler) {
		final HttpClientOptions options = new HttpClientOptions();
		options.setSocketTimeout(JiraConfigurationProvider.getSocketTimeout(), TimeUnit.SECONDS);

		final DefaultHttpClientFactory<?> defaultHttpClientFactory
				= new DefaultHttpClientFactory<>(NoOpEventPublisher.INSTANCE,
						RestClientApplicationProperties.create(serverUri),
						NoOpThreadLocalContextManager.INSTANCE);
		final HttpClient httpClient = defaultHttpClientFactory.create(options);

		return DisposableAtlassianHttpClientDecorator.create(httpClient, authenticationHandler, () -> {
			defaultHttpClientFactory.dispose(httpClient);
		});
	}

	public DisposableHttpClient createClient(final HttpClient httpClient) {
		return DisposableAtlassianHttpClientDecorator.create(httpClient, builder -> {
			// no op authentication handler
		}, () -> {
			// This should never be implemented. This is simply creation of a wrapper
			// for AtlassianHttpClient which is extended by a destroy method.
			// Destroy method should never be called for AtlassianHttpClient coming from
			// a client! Imagine you create a RestClient, pass your own HttpClient there
			// and it gets destroyed.
		});
	}

	private static final class DisposableAtlassianHttpClientDecorator extends AtlassianHttpClientDecorator {
		private static DisposableAtlassianHttpClientDecorator create(final HttpClient httpClient,
				final AuthenticationHandler authenticationHandler,
				final ThrowingRunnable onDestroy) {
			return new DisposableAtlassianHttpClientDecorator(httpClient, authenticationHandler, onDestroy);
		}

		private final ThrowingRunnable onDestroy;

		private DisposableAtlassianHttpClientDecorator(final HttpClient httpClient,
				final AuthenticationHandler authenticationHandler,
				final ThrowingRunnable onDestroy) {
			super(httpClient, authenticationHandler);

			this.onDestroy = onDestroy;
		}

		@Override
		public void destroy() throws Exception {
			onDestroy.runThrowing();
		}
	}

	private static final class MavenUtils {
		private static final Logger LOGGER = LoggerFactory.getLogger(MavenUtils.class);

		private static final String UNKNOWN_VERSION = "unknown";

		@PackagePrivate
		@SuppressFBWarnings(value = "CRLF_INJECTION_LOGS", justification = "secure arguments source")
		static String getVersion(final String groupId, final String artifactId) {
			final Properties props = new Properties();
			try (InputStream resourceAsStream = MavenUtils.class
					.getResourceAsStream(String.format("/META-INF/maven/%s/%s/pom.properties", groupId, artifactId))) {
				if (resourceAsStream == null) {
					return UNKNOWN_VERSION;
				}
				props.load(resourceAsStream);
				return props.getProperty("version", UNKNOWN_VERSION);
			} catch (final IOException e) {
				LOGGER.debug("Could not find version for maven artifact {}:{}", groupId, artifactId);
				LOGGER.debug("Got the following exception", e);
				return UNKNOWN_VERSION;
			}
		}

		@SuppressWarnings("PMD.AvoidThrowingRawExceptionTypes")
		private MavenUtils() {
			throw new RuntimeException();
		}
	}

	private static final class NoOpEventPublisher implements EventPublisher {
		private static final NoOpEventPublisher INSTANCE = new NoOpEventPublisher();

		private NoOpEventPublisher() {
			// nothing to do
		}

		@Override
		public void publish(@SuppressWarnings("unused") @Nullable final Object object) {
			// empty by design
		}

		@Override
		public void register(@SuppressWarnings("unused") @Nullable final Object object) {
			// empty by design
		}

		@Override
		public void unregister(@SuppressWarnings("unused") @Nullable final Object object) {
			// empty by design
		}

		@Override
		public void unregisterAll() {
			// empty by design
		}
	}

	private static final class NoOpThreadLocalContextManager implements ThreadLocalContextManager<Object> {
		private static final NoOpThreadLocalContextManager INSTANCE = new NoOpThreadLocalContextManager();

		private NoOpThreadLocalContextManager() {
			// nothing to do
		}

		@Nullable
		@Override
		public Object getThreadLocalContext() {
			return null;
		}

		@Override
		public void setThreadLocalContext(@SuppressWarnings("unused") @Nullable final Object context) {
			// empty by design
		}

		@Override
		public void clearThreadLocalContext() {
			// empty by design
		}
	}

	/**
	 * These properties are used to present JRJC as a User-Agent during http
	 * requests.
	 */
	private static final class RestClientApplicationProperties implements ApplicationProperties {
		private static RestClientApplicationProperties create(final URI jiraUri) {
			return new RestClientApplicationProperties(jiraUri.getPath());
		}

		private final String baseUrl;

		private RestClientApplicationProperties(final String baseUrl) {
			this.baseUrl = baseUrl;
		}

		/**
		 * {@inheritDoc}
		 *
		 * @deprecated since 2.10. This implementation is application-specific, and
		 *             unreliable for a cross product plugin. Use
		 *             {@link #getBaseUrl(UrlMode)} instead.
		 */
		@Deprecated
		@Override
		public String getBaseUrl() {
			return baseUrl;
		}

		/**
		 * We'll always have an absolute URL as a client.
		 */
		@Nonnull
		@Override
		public String getBaseUrl(@SuppressWarnings("unused") @Nullable final UrlMode urlMode) {
			return baseUrl;
		}

		@Nonnull
		@Override
		public String getDisplayName() {
			return "Atlassian JIRA Rest Java Client";
		}

		@Nonnull
		@Override
		public String getPlatformId() {
			return ApplicationProperties.PLATFORM_JIRA;
		}

		@Nonnull
		@Override
		public String getVersion() {
			return MavenUtils.getVersion("com.atlassian.jira", "jira-rest-java-com.atlassian.jira.rest.client");
		}

		@Nonnull
		@Override
		public Date getBuildDate() {
			throw new UnsupportedOperationException();
		}

		@Nonnull
		@Override
		public String getBuildNumber() {
			return String.valueOf(0);
		}

		@Override
		public File getHomeDirectory() {
			return new File(".");
		}

		/**
		 * {@inheritDoc}
		 *
		 * @deprecated As of SAL 2.7.
		 */
		@Deprecated
		@Override
		public String getPropertyValue(@SuppressWarnings("unused") @Nullable final String propertyName) {
			throw new UnsupportedOperationException("Not implemented");
		}
	}
}
