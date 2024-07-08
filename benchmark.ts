import benchmark from "benchmark";
import { buildTemplate } from "./src";

const suite = new benchmark.Suite();

suite
	.add("With a base URL", () => {
		const buildUrl = buildTemplate(
			"https://example.com/users/:user_id/posts/:post_id/reactions"
		);
		const url = buildUrl({
			user_id: 1,
			post_id: 2,
			limit: 10,
			skip: 10,
		});
	})
	.on("cycle", (event: Event) => {
		console.log(String(event.target));
	})
	.run({ async: true });
