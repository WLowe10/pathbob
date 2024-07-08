export function buildTemplate(baseUrl: string) {
	return (params: Record<string, string | number>) => {
		let url = baseUrl;
		let notIncluded = [];

		for (const [key, value] of Object.entries(params)) {
			const urlParam = `/:${key}`;

			if (url.includes(urlParam)) {
				url = url.replace(urlParam, `/${encodeURIComponent(value)}`);
			} else {
				notIncluded.push(key);
			}
		}

		for (let i = 0; i < notIncluded.length; i++) {
			const key = notIncluded[i];

			url += `${i === 0 ? "?" : "&"}${key}=${encodeURIComponent(params[key])}`;
		}

		return url;
	};
}
