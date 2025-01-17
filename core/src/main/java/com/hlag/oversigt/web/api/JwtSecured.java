package com.hlag.oversigt.web.api;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import javax.ws.rs.NameBinding;

/**
 * @author Olaf Neumann
 * @see <a href=
 *      "https://stackoverflow.com/questions/26777083/best-practice-for-rest-token-based-authentication-with-jax-rs-and-jersey">https://stackoverflow.com/questions/26777083/best-practice-for-rest-token-based-authentication-with-jax-rs-and-jersey</a>
 */
@NameBinding
@Retention(RetentionPolicy.RUNTIME)
@Target({ ElementType.TYPE, ElementType.METHOD })
public @interface JwtSecured {
	/**
	 * Defines whether a call to the annotated method must be authenticated or not.
	 * Setting this value to <code>true</code> will authentication is required.
	 *
	 * @return <code>true</code> if authentication is required, else
	 *         <code>false</code>
	 */
	boolean mustBeAuthenticated() default true;
}
