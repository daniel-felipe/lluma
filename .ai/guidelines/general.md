# General Guidelines

- Don't include any superfluous PHP Annotations, except ones that start with `@` for typing variables.

# Laravel Custom Standards & Conventions

This project follows specific architectural patterns. Adhere to these rules strictly when generating migrations, actions, and model logic.

## 1. Database & Migrations
- **No Enums:** Never use `$table->enum()`. Use `$table->string()` instead to allow for easier flexibility and database compatibility.
- **Monetary Values:** Never use `float` or `decimal` for money. Always use `integer` (storing values in cents/sub-units) to avoid rounding errors.

## 2. Action Classes
- **Method Name:** All Action classes must use a `run()` method as their entry point.
- **Invocation:** Do not instantiate Actions with `new` or via constructor injection unless necessary. Use the `resolve()` helper to execute them.
    - *Example:* `resolve(CreateUserAction::class)->run($data);`

## 3. Modern Laravel Syntax (PHP 8.2+)
Always use the most recent Laravel features and PHP Attributes over legacy methods.

Example:

Use the `#[Scope]` attribute instead of the `scopeName` prefix.
- **Bad:**
  ```php
  public function scopeActive($query) { ... }
  ```
- **Good:**
  ```php
  use Illuminate\Database\Eloquent\Attributes\ScopedBy; // If using global
  // For local scopes:
  #[Scope]
  public function active($query) { ... }
  ```

## 4. Guard Clauses and Early Returns

Prefer **Guard Clauses (Early Returns)** over `else` statements whenever possible.

The goal is to keep the main execution path ("happy path") easy to read by handling exceptional or invalid conditions early and exiting immediately.

#### Preferred

```php
if (! $user->isAdmin()) {
    abort(403);
}

return $this->createUser();
```

#### Avoid

```php
if ($user->isAdmin()) {
    return $this->createUser();
} else {
    abort(403);
}
```

### General Modernization
- Use **Constructor Property Promotion** for all classes.
- Use **Readonly properties** where state doesn't change.
- Use **Arrow functions** `fn ()` for short callbacks.
- Use **Typed constants** (PHP 8.3).
- Use **uuid** for record ids
- Always use variable full name (e.g. instead of fn (Builder $q) use fn (Builder $query))