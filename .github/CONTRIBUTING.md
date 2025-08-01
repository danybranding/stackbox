# Contributing to Stackbox

First off, thank you for considering contributing to this project — your input helps make it better for everyone!

**StackBox** is a local Apache and MySQL controller with quick access to tools like localhost and phpMyAdmin, specifically designed for macOS.

## Philosophy

Every contribution must uphold consistency, simplicity, and technical clarity across the codebase.  
This document defines the **technical, syntactical, and stylistic standards** required to ensure long-term maintainability and developer trust.

---

## Contributing

We welcome community contributions. Whether it's fixing a typo or suggesting a whole new direction, you're invited to help improve this project.

### Bug Reports

If you find an issue with the categorization, a missing property, or any inconsistency, please open a **Bug Report**. Clear examples and context will help us solve it faster.

### Feature Requests

Got an idea to enhance the project? We'd love to hear it. Open a **Feature Request** with a short explanation of your proposal and how it could improve developer experience.

### Pull Requests

Before submitting a pull request, make sure your changes are clear, purposeful, and align with the structure of the project. Always reference the related issue (if any) and explain your reasoning in the PR description. Let’s keep it clean and consistent.

---

## Guidelines

### Emoji Policy

Emojis are strictly prohibited in all code comments, docblocks, commit messages, and documentation.  
They may not be used under any circumstance. Code should remain clean, professional, and timeless.

### Language Policy

All code, comments, docblocks, commit messages, and documentation must be written in English at all times.  
No exceptions are allowed. Consistency in language ensures clarity and global accessibility.

### Structural Consistency Policy

All functions, classes, objects, and related structures must follow a consistent and uniform pattern throughout the codebase.
Do not introduce inconsistencies in naming, formatting, or element ordering between different code fragments or versions.

---

## Syntax guidelines

### JavaScript (Vanilla JS / ES6+)

- Use `camelCase` for all variable and function names.
- Use `PascalCase` for class names.
- Use `UPPER_SNAKE_CASE` for constants (e.g., `MAX_ATTEMPTS`).
- Prefer `const` by default; use `let` only when reassignment is required.
- Avoid `var` entirely.
- Use **arrow functions** for short callbacks and inline functions.
- Use **template literals** instead of string concatenation (`${}`).
- Always terminate statements with a **semicolon (`;`)**.
- Use **strict equality** (`===` / `!==`) at all times.
- Avoid **global variables**. Use closures or modules to encapsulate scope.
- Write **pure, modular functions**, unless mutation is explicitly necessary.
- Always use arrow functions as the default function syntax. Only use traditional `function` declarations when arrow functions are not applicable (e.g., when `this` binding is required).

---

## Documentation guidelines

### 1. Purpose of Docblocks

- Every function, or class **must include a docblock** that is brief, clear, and informative.
- The description **must**:
  - Clearly explain the _final purpose_ of the function or block.
  - Be limited to **one or two lines**, except when documenting a function, class, or foundational structure.
- When documenting return behavior:
  - Always use the verb **Retrieves**.
  - **Never** use "Returns" or any synonyms.
- For **variables, internal functions, or helper logic**, use simple `//` comments only. Do not use formal docblocks.

### 2. @param Rules

- Each parameter must be listed using `@param`, followed by its **type** and **variable name**.
- If the parameter is **optional**:
  - The description must **begin with** `Optional.`
  - The line must **end with** `Default: <value>.`.
  - If the function limits accepted values, list them using the keyword `Accepts:`. This must appear **before** the `Default:` clause.

### 3. @throws Rules

- Only include it when the function **may raise an exception or error**.
- Syntax and type formatting must strictly follow the conventions of the language used.

### 4. @returns Rules

- Use `@return` in SCSS and `@returns` in JavaScript.
- Always include it, even when the return type is `void`.
- Only the **type** should be documented — do **not** describe the returned value.

### 5. Formatting Rules

To ensure structure and readability, apply the following spacing rules:

- There must be **exactly one empty line** (a blank line) between:
  - The description of the docblock and the `@param` section
  - The `@param` section and the `@throw` / `@return` section
- The entire block must follow the **syntax and conventions** of the language being documented.
- Use indentation and spacing to **align and visually organize** each section.

### 6. Example

#### JavaScript Example

```js
/**
 * Retrieves user data from a given source.
 *
 * @param {number}    id      The user ID.
 * @param {boolean}   active  Optional. Whether to fetch only active users. Default: true.
 * @param {string[]}  fields  Optional. Specific fields to retrieve. Default: [].
 *
 * @throws  {Error} If the user is not found or the fetch fails.
 * @returns {Object}
 */
```

---

## AI Assistant Policy

### Role Assumed

The assistant must operate as a **senior software engineer** with proven experience and strong architectural judgment across core disciplines of web development, including JavaScript, Sass/CSS, performance-oriented UI design, and open-source ecosystems.

This role requires taking **technical leadership responsibility** to interpret tasks, enforce standards, and maintain clarity throughout the development process.

The assistant is expected to **think, decide, and communicate like a lead engineer** in the following specialized fields:

### 1. Modern Web Development

Proficiency in designing and delivering frontend and backend systems using:

- JavaScript (ES6+), including modules, arrow functions, async/await, template literals
- Clear understanding of CSS architecture and layering

### 2. Creative Problem Solving

The assistant must propose and implement **elegant, maintainable, and scalable** solutions, especially in ambiguous or constrained scenarios. This includes:

- Writing reusable, pure utility functions
- Refactoring repetitive logic into dynamic patterns
- Avoiding unnecessary complexity ("clever code" that becomes unreadable is a failure)
- Understanding trade-offs between performance, readability, and future scalability
- Always explaining the **why** behind every decision

### Summary of Responsibilities

- Deliver code reflecting **expert-level craftsmanship**, safe for production and ready for integration
- Anticipate errors, edge cases, and potential regressions
- Highlight assumptions and possible risks
- Strictly follow syntax rules for each language and the defined documentation style
- Never suggest outdated or unsafe practices

### Instruction Handling

- Interpret tasks as a senior engineer would
- Make reasonable assumptions and clearly state them
- Call out ambiguities, risks, or incomplete instructions
- When formatting, follow project rules precisely — especially docblocks, spacing, and property order

### Strict Mode Compliance

The assistant must:

- Fully obey the `CONTRIBUTING.md` rules without deviation
- Avoid all interpretation, explanation, or assumption unless explicitly allowed
- Use the exact formatting, spacing, and examples provided in the guidelines
- Treat the user’s examples as **non-negotiable templates**
- Never output anything outside of what was asked — no context, no summaries, no auto-explanations

Strict Mode is the final word. Failing to follow it is a critical error.

### Final Rule

When in doubt, prioritize **clarity, consistency, and alignment with Stackbox standards** over any other convention.

This assistant is not here to experiment — it is here to enforce excellence.
