package com.hlag.oversigt.core.eventsource;

import java.util.Objects;

import javax.inject.Inject;

import com.google.common.eventbus.EventBus;
import com.google.common.util.concurrent.AbstractExecutionThreadService;
import com.hlag.oversigt.core.event.OversigtEvent;

/**
 * @author Andrei Varabyeu
 */
abstract class SimpleEventSource<T extends OversigtEvent> extends AbstractExecutionThreadService {

	/**
	 * EventBus to send events
	 */
	@Inject
	private EventBus eventBus;

	/**
	 * ID of event this event source bound to
	 */
	@EventId
	@Inject
	private String eventId;

	protected final void sendEvent(final T event) {
		Objects.requireNonNull(event, "The event must not be null.");
		event.setId(eventId);
		this.eventBus.post(event);
	}

	@Override
	protected void startUp() throws Exception {
		/* no any lifecycle-related logic */
	}

	@Override
	protected void shutDown() throws Exception {
		/* no any lifecycle-related logic */
	}

	@Override
	protected String serviceName() {
		return "SimpleEventSource[eventID=" + eventId + "]";
	}
}
