# pathbob

Simple path/URL builder.

An alternative to pathcat. pathbob is more efficient as it parses your path once and returns a template.

## Highlights

-   Typesafe
-   Fast
-   Zero dependencies

## Install

```sh
pnpm add pathbob
```

## Usage

```typescript
import { parse } from "pathbob";

// this is typesafe 🤯
const template = parse("https://test.com/:id");
const url = template({ id: "abc" }); // https://test.com/abc

// with path instead

const template = parse("https://test.com", "/:id");
const url = template({ id: "abc" }); // https://test.com/abc

// extra values passed to the template automatically become query params!
const template = parse("https://test.com", "/:id");
const url = template({ id: "abc", page: 1 }); // https://test.com/abc?page=1
```
