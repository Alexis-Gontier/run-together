---
name: form
description: Build forms with React Hook Form, Zod validation, and shadcn-ui Field components
---

## Stack

- `react-hook-form` — form state + `useForm`, `Controller`, `useFieldArray`
- `zod` — schema validation via `zodResolver`
- shadcn-ui primitives — `Field`, `FieldLabel`, `FieldDescription`, `FieldError`, `FieldGroup`, `FieldSet`, `FieldLegend`

## Boilerplate

```tsx
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import * as z from "zod"

const schema = z.object({
  name: z.string().min(2, "At least 2 characters."),
})

type FormValues = z.infer<typeof schema>

export function MyForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  })

  function onSubmit(data: FormValues) {
    console.log(data)
  }

  return <form onSubmit={form.handleSubmit(onSubmit)}>{/* fields */}</form>
}
```

## Field pattern (applies to every field type)

```tsx
<Controller
  name="fieldName"
  control={form.control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={field.name}>Label</FieldLabel>
      {/* input goes here — see per-type patterns below */}
      <FieldDescription>Optional hint.</FieldDescription>
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )}
/>
```

**Always:** `data-invalid` on `<Field />` + `aria-invalid` on the control.

## Per-type patterns

### Input / Textarea

```tsx
<Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
<Textarea {...field} id={field.name} aria-invalid={fieldState.invalid} />
```

### Select

```tsx
<Select name={field.name} value={field.value} onValueChange={field.onChange}>
  <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
    <SelectValue placeholder="Select" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="a">Option A</SelectItem>
  </SelectContent>
</Select>
```

### Checkbox (array)

```tsx
<Checkbox
  checked={field.value.includes(item.id)}
  aria-invalid={fieldState.invalid}
  onCheckedChange={(checked) =>
    field.onChange(
      checked
        ? [...field.value, item.id]
        : field.value.filter((v) => v !== item.id),
    )
  }
/>
```

### Radio Group

```tsx
<RadioGroup
  name={field.name}
  value={field.value}
  onValueChange={field.onChange}
>
  <RadioGroupItem value="x" aria-invalid={fieldState.invalid} />
</RadioGroup>
```

### Switch

```tsx
<Switch
  name={field.name}
  checked={field.value}
  onCheckedChange={field.onChange}
  aria-invalid={fieldState.invalid}
/>
```

## Array fields (`useFieldArray`)

```tsx
const { fields, append, remove } = useFieldArray({
  control: form.control,
  name: "emails",
})

// Always use field.id as key, not index
{
  fields.map((field, index) => (
    <Controller
      key={field.id}
      name={`emails.${index}.address`}
      control={form.control}
      render={({ field: f, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <Input {...f} aria-invalid={fieldState.invalid} />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  ))
}

;<Button type="button" onClick={() => append({ address: "" })}>
  Add
</Button>
```

Zod schema for arrays:

```ts
emails: z.array(z.object({ address: z.string().email() }))
  .min(1)
  .max(5)
```

## Validation modes

| Mode         | When                              |
| ------------ | --------------------------------- |
| `"onSubmit"` | default — validate on submit only |
| `"onBlur"`   | validate when field loses focus   |
| `"onChange"` | validate on every keystroke       |

```ts
const form = useForm({ resolver: zodResolver(schema), mode: "onBlur" })
```

## Submit button

Always use `<LoadingButton />` from `@/components/ui/loading-button` for form submit buttons. Pass `isLoading` from the form submission state — it disables the button and shows a spinner automatically.

```tsx
import { LoadingButton } from "@/components/ui/loading-button"

;<LoadingButton type="submit" isLoading={form.formState.isSubmitting}>
  Submit
</LoadingButton>
```

## Reset

```tsx
<Button type="button" onClick={() => form.reset()}>
  Reset
</Button>
```
