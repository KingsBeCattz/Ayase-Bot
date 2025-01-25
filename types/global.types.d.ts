declare global {
	/**
	 * Represents that a type can be a promise
	 */
	type MaybePromise<T> = Promise<T> | T;

	/**
	 * Represents that a type can be a promise
	 */
	type MaybeArray<T> = T[] | T;

	/**
	 * Represents possible values in a JSON
	 */
	type JSONValue = string | number | boolean | JSONValue[] | JSONObject;

	/**
	 * Represents a JSON
	 */
	type JSONObject = { [k: string]: JSONValue };

	interface String {
		/**
		 * The first character of a string will be in upper case.
		 */
		capitalize(): string;
	}

	interface Number {
		/**
		 * Separates a number
		 * @param separator Separador. Default: ","
		 * @example (1000).format(",") // 1,000
		 */
		format(separator: '.' | ','): string;
	}

	interface BigInt {
		/**
		 * Converts a BigInt to a number and separates it.
		 * @param separator Separador. Default: ","
		 * @example (1000n).format(",") // 1,000
		 */
		format(separator: '.' | ','): string;
	}

	interface Array<T> {
		/**
		 * Joins an array of strings into a single string
		 * @example [""]
		 */
		format(separators?: { comma: string; and: string }): string;
	}

	interface CooldownData {
		user_id: string;
		command: string;
		timestamp: number;
		time: number;
		knows: boolean;
	}
}

export {};
