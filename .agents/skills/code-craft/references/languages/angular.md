# Angular Default Stack

Use for greenfield Angular applications. Retain a repository's existing compatible choices.

## Default choices

- Use Angular CLI and its supported builder/toolchain. Use Angular Router, `HttpClient`, and Reactive Forms before adding third-party counterparts.
- Use Signals for synchronous local/shared UI state and RxJS for stream-based asynchronous composition. Introduce a state-management library only when the application's state complexity demonstrably requires it.
- Use Angular Material for an accessible, maintained component baseline unless the design system specifies another compatible library.
- Follow the CLI's current supported test setup, and keep framework compilation/type checks in the verification path.

## Sources

- https://angular.dev/tools/cli
- https://angular.dev/guide/routing
- https://angular.dev/guide/http
- https://angular.dev/guide/forms/reactive-forms
- https://angular.dev/guide/signals
- https://material.angular.dev/
