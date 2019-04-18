package com.hlag.oversigt.core.eventsource;

import java.time.Duration;
import java.time.ZonedDateTime;
import java.util.Deque;
import java.util.LinkedList;
import java.util.Optional;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NonNull;

@Getter
public class EventSourceStats {
	private static final int NUMBER_OF_EXECUTION_TIMES = 5;
	private ExecutionTime fastestExecutionTime = null;
	private ExecutionTime slowestExecutionTime = null;

	private final Deque<ExecutionTime> lastExecutionTimes = new LinkedList<>();

	public Optional<Duration> getAverageExecutionDuration() {
		long millis = (long) lastExecutionTimes.stream()
				.map(ExecutionTime::getExecutionDuration)
				.mapToLong(Duration::toMillis)
				.average()
				.orElse(-1);
		if (millis > 0) {
			return Optional.of(Duration.ofMillis(millis));
		}
		return Optional.empty();
	}

	public void addExecutionTime(final long millis) {
		addExecutionTime(new ExecutionTime(Duration.ofMillis(millis)));
	}

	public void addExecutionTime(final ExecutionTime newExecutionTime) {
		lastExecutionTimes.addLast(newExecutionTime);
		if (lastExecutionTimes.size() > NUMBER_OF_EXECUTION_TIMES) {
			lastExecutionTimes.removeFirst();
		}

		if (fastestExecutionTime == null
				|| newExecutionTime.executionDuration.minus(fastestExecutionTime.executionDuration).isNegative()) {
			fastestExecutionTime = newExecutionTime;
		}

		if (slowestExecutionTime == null
				|| slowestExecutionTime.executionDuration.minus(newExecutionTime.executionDuration).isNegative()) {
			slowestExecutionTime = newExecutionTime;
		}
	}

	public ExecutionTime getListExecutionTime() {
		return lastExecutionTimes.peekLast();
	}

	@Getter
	@AllArgsConstructor
	public static class ExecutionTime {
		@NonNull
		private final ZonedDateTime timestamp;
		@NonNull
		private final Duration executionDuration;

		public ExecutionTime(Duration duration) {
			this(ZonedDateTime.now(), duration);
		}
	}
}
