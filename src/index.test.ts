import { it, expect } from "vitest";
import * as pathbob from "./index";

it("works with one parameter", () => {
	const template = pathbob.parse("https://test.com/users/:id");
	const url = template({ id: 123 });

	expect(url).toBe("https://test.com/users/123");
});

it("works with multiple parameters", () => {
	const template = pathbob.parse("https://test.com/users/:id/posts/:postId");
	const url = template({ id: 123, postId: 456 });

	expect(url).toBe("https://test.com/users/123/posts/456");
});

it("works with path argument", () => {
	const template = pathbob.parse("https://test.com", "/users/:id");
	const url = template({ id: 123 });

	expect(url).toBe("https://test.com/users/123");
});
