import benchmark from "benchmark";
import { parse } from "./src";

const suite = new benchmark.Suite();

suite
	.add("With a base URL", () => {
		parse("https://example.com/users/:user_id/posts/:post_id/reactions")({
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
