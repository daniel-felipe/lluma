---
name: make-action
description: Create a new Action class following project conventions. Pass the action name as argument (e.g. /make-action CreateInvoice).
---

Run the following to scaffold the action:

```bash
php artisan make:action "$SKILL_ARGS" --no-interaction
```

Then remind of project conventions:
- Entry point is `run()` not `handle()`
- Invoke via `resolve(ClassName::class)->run(...)` — not `new` or constructor injection (unless necessary)
- Wrap multi-model operations in `DB::transaction()`
- Constructor dependencies use property promotion with `private readonly`
- No dependencies? Omit `__construct` entirely
- `final readonly class` for stateless actions
