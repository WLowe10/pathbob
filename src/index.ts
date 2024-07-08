type ParamValueType = string | number | boolean | null | undefined;
type ParamValue = ParamValueType | ParamValueType[];

type RemoveProtocol<T extends string> = T extends `${string}://${infer Rest}` ? Rest : T;

type ExtractUrlParams<T extends string> =
	RemoveProtocol<T> extends `${string}:${infer Param}/${infer Rest}`
		? { [K in Param | keyof ExtractUrlParams<Rest>]: ParamValue }
		: RemoveProtocol<T> extends `${string}:${infer Param}`
		? { [K in Param]: ParamValue }
		: {};

type TemplateFnForPath<T extends string> = (
	params: ExtractUrlParams<T> & Record<string, ParamValue>
) => string;

type StaticSegment = {
	type: "static";
	value: string;
};

type DynamicSegment = {
	type: "dynamic";
	key: string;
};

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
			key: match[1],
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

export function parse<T extends string, K extends string | undefined = undefined>(
	baseUrl: T,
	path?: K
): K extends undefined ? TemplateFnForPath<T> : TemplateFnForPath<`${T}${K}`> {
	// this is the most expensive computation so we do it once and split the segments for the template
	const fullUrl = path ? joinPaths(baseUrl, path) : baseUrl;
	const segments = splitPathIntoSegments(fullUrl);

	const usedParams = new Set<string>();

	return ((params: any) => {
		let url = "";

		for (const segment of segments) {
			if (segment.type === "static") {
				url += segment.value;
			} else {
				usedParams.add(segment.key);
				url += encodeURIComponent(params[segment.key] as string);
			}
		}

		const paramKeys = Object.keys(params);

		if (paramKeys.length > usedParams.size) {
			const searchParams = new URLSearchParams();

			for (let i = 0; i < paramKeys.length; i++) {
				const key = paramKeys[i];

				if (!usedParams.has(key)) {
					const value = params[key];

					if (Array.isArray(value)) {
						for (const item of value) {
							searchParams.append(key, String(item));
						}
					} else {
						searchParams.set(key, String(value));
					}
				}
			}

			url += "?" + searchParams;
		}

		return url;
	}) as any;
}
