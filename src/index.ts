type RemoveProtocol<T extends string> = T extends `${string}://${infer Rest}` ? Rest : T;
type ParamValue = string | number | boolean;

type ExtractUrlParams<T extends string> =
	RemoveProtocol<T> extends `${string}:${infer Param}/${infer Rest}`
		? { [K in Param | keyof ExtractUrlParams<Rest>]: ParamValue }
		: RemoveProtocol<T> extends `${string}:${infer Param}`
			? { [K in Param]: ParamValue }
			: {};

type TemplateFnForPath<T extends string> = (params: ExtractUrlParams<T>) => string;

interface StaticSegment {
	type: "static";
	value: string;
}

interface DynamicSegment {
	type: "dynamic";
	key: string;
}

type Segment = StaticSegment | DynamicSegment;

const paramRegex = /:([a-zA-Z0-9_]+)/g;

// splits the path into segments for later use
function splitPathIntoSegments(path: string): Segment[] {
	const segments: Segment[] = [];

	let lastIndex = 0;
	let match;

	while ((match = paramRegex.exec(path)) !== null) {
		if (match.index > lastIndex) {
			segments.push({
				type: "static",
				value: path.slice(lastIndex, match.index),
			});
		}

		segments.push({
			type: "dynamic",
			key: match[1]!,
		});

		lastIndex = paramRegex.lastIndex;
	}

	if (lastIndex < path.length) {
		segments.push({
			type: "static",
			value: path.slice(lastIndex),
		});
	}

	return segments;
}

function joinPaths(a: string, b: string): string {
	const aEndsWithSlash = a.endsWith("/");
	const bStartsWithSlash = b.startsWith("/");

	if (aEndsWithSlash && bStartsWithSlash) {
		return a + b.slice(1);
	}

	if (!aEndsWithSlash && !bStartsWithSlash) {
		return `${a}/${b}`;
	}

	return a + b;
}

export class PathbobError extends Error {
	constructor(message: string) {
		super(message);

		this.name = "PathbobError";
	}
}

export class ParameterNotFoundError extends Error {
	/** The parameter key expected in the template */
	public parameter: string;

	constructor(parameter: string) {
		super(`The parameter ${parameter} was not provided to the template`);

		this.name = "ParameterNotFoundError";
		this.parameter = parameter;
	}
}

export function parse<TBase extends string, TPath extends string | undefined = undefined>(
	baseUrl: TBase,
	path?: TPath
): TPath extends undefined ? TemplateFnForPath<TBase> : TemplateFnForPath<`${TBase}${TPath}`> {
	// this is the most expensive computation so we do it once and split the segments for the template
	const fullUrl = path ? joinPaths(baseUrl, path) : baseUrl;
	const segments = splitPathIntoSegments(fullUrl);

	const templateFn = (params: Record<string, ParamValue>) => {
		let url = "";

		for (const segment of segments) {
			if (segment.type === "static") {
				url += segment.value;
			} else {
				const paramValue = params[segment.key];

				if (paramValue === undefined) {
					throw new ParameterNotFoundError(segment.key);
				}

				url += encodeURIComponent(paramValue);
			}
		}

		return url;
	};

	return templateFn as any;
}
