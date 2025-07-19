# Contributing to Stackbox

## Philosophy

This project is a streamlined local development environment for macOS, offering fast control over Apache and MySQL, with easy access to tools like `localhost` and `phpMyAdmin`.  
Every contribution must uphold consistency, simplicity, and technical clarity across the codebase.  
This document defines the **technical, syntactical, and stylistic standards** required to ensure long-term maintainability and developer trust.

---

## Emoji Policy

Emojis are strictly prohibited in all code comments, docblocks, commit messages, and documentation.  
They may not be used under any circumstance. Code should remain clean, professional, and timeless.

---

## Language Policy

All code, comments, docblocks, commit messages, and documentation must be written in English at all times.  
No exceptions are allowed. Consistency in language ensures clarity and global accessibility.

---

## Structural Consistency Policy

All functions, classes, objects, and related structures must follow a consistent and uniform pattern throughout the codebase.
Do not introduce inconsistencies in naming, formatting, or element ordering between different code fragments or versions.

---

## Commit Message Policy

All commit messages must follow the lowercase format:

```
type: short description
```

Multiple types can be combined in a single commit message, separated by commas:

```
release: v1.0.0, fix: corrected button alignment, feat: added dark mode toggle
```

Do **not** use capital letters, parentheses, or colons within the type (e.g., avoid `Feat(...)` or `feat():`).

### Allowed Types

| Type     | Purpose                                             |
| -------- | --------------------------------------------------- |
| feat     | New feature                                         |
| fix      | Bug fix                                             |
| chore    | General maintenance or routine tasks                |
| docs     | Documentation changes (README, Wiki, comments)      |
| style    | Code formatting, linting, and style changes         |
| refactor | Code restructuring with no functional changes       |
| test     | Unit tests, integration tests, mock setups          |
| perf     | Performance improvements                            |
| build    | Changes to build system, dependencies, or packaging |
| ci       | Continuous integration scripts and configuration    |
| revert   | Revert a previous commit                            |
| wip      | Work in progress (non-standard, use with caution)   |
| release  | Reserved for large commits tied to version releases |

---

## Syntax Rules

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

## Master Property Order

All CSS property declarations must follow the standardized order defined below. This ensures consistency and readability across the entire codebase.

Apply the following rules when sorting properties:

- If the property includes a **vendor prefix** (`-webkit-`, `-moz-`, `-o-`), ignore the prefix and sort according to the base property name.

### 1. Layout

- position
- z-index
- top / right / bottom / left (or logical equivalents)
- inset
- display
- float
- clear
- aspect-ratio
- vertical-align
- box-sizing
- width / height
- min-width / min-height
- max-width / max-height
- margin / padding
- overflow / overflow-x / overflow-y
- overscroll-behavior / overscroll-behavior-x / overscroll-behavior-y
- scroll-margin
- scroll-padding
- table-layout
- border-collapse
- border-spacing
- caption-side
- flex
- flex-basis
- flex-direction
- flex-wrap
- flex-grow
- flex-shrink
- order
- grid-template-columns
- grid-template-rows
- grid-auto-flow
- grid-auto-columns
- grid-auto-rows
- grid-column
- grid-row
- place-content
- place-items
- place-self
- gap
- justify-content
- justify-items
- justify-self
- align-content
- align-items
- align-self
- scroll-behavior
- scroll-snap-type
- scroll-snap-align
- scroll-snap-stop
- touch-action

### 2. Visual

- font / font-family / font-size / font-style / font-weight
- line-height
- letter-spacing / word-spacing
- text-align
- text-indent
- text-transform / text-decoration
- text-shadow
- white-space
- word-break
- color
- caret-color
- list-style
- list-style-type
- list-style-position
- background-color
- background-image
- background-size
- background-position
- background-repeat
- background-attachment
- background-clip
- background-origin
- background-blend-mode
- border
- border-top
- border-right / border-inline-end
- border-bottom
- border-left / border-inline-start
- border-width
- border-style
- border-color
- border-radius
- outline
- outline-width
- outline-color
- outline-style
- outline-offset
- box-shadow
- opacity
- visibility
- mix-blend-mode
- filter
- backdrop-filter
- will-change
- color-scheme
- transform
- transform-origin
- transform-style
- rotate
- scale
- translate
- transition
- transition-property
- transition-duration
- transition-timing-function
- transition-delay
- animation
- animation-name
- animation-duration
- animation-timing-function
- animation-delay
- animation-iteration-count
- animation-direction
- animation-fill-mode
- animation-play-state
- object-fit
- object-position
- fill
- stroke
- stroke-width
- cursor
- pointer-events
- user-select
- resize
- appearance
- field-sizing
- content

---

## Documentation Standards

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

When the user activates **Strict Mode**, the assistant must:

- Fully obey the `CONTRIBUTING.md` rules without deviation
- Avoid all interpretation, explanation, or assumption unless explicitly allowed
- Use the exact formatting, spacing, and examples provided in the guidelines
- Treat the user’s examples as **non-negotiable templates**
- Never output anything outside of what was asked — no context, no summaries, no auto-explanations

Strict Mode is the final word. Failing to follow it is a critical error.

### Final Rule

When in doubt, prioritize **clarity, consistency, and alignment with Stackbox standards** over any other convention.

This assistant is not here to experiment — it is here to enforce excellence.
