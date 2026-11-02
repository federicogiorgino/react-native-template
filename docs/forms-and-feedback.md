# Forms and feedback

Files: `src/lib/schemas.ts`, `src/components/form-text-field.tsx`, `src/lib/use-notify.ts`, `src/components/confirm-provider.tsx`, `empty-state.tsx`, `error-screen.tsx`, `offline-banner.tsx`.

## Forms

The pattern is react-hook-form + a Zod schema + `FormTextField`. `src/app/sign-in.tsx` is the reference.

```tsx
import { zodResolver } from "@hookform/resolvers/zod";
import type { TFunction } from "i18next";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { FormTextField } from "@/components/form-text-field";
import { emailField, requiredText, setFormError } from "@/lib/schemas";

// A factory, so messages are translated in the current language.
const createSchema = (t: TFunction) =>
  z.object({
    title: requiredText(t("validation.titleRequired")),
    email: emailField(t),
  });
type FormValues = z.input<ReturnType<typeof createSchema>>;

export default function EditScreen() {
  const { t } = useTranslation();
  const form = useForm<FormValues>({
    resolver: zodResolver(createSchema(t)),
    defaultValues: { title: "", email: "" },
    mode: "onTouched", // validate on blur, then live while typing
  });
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  async function onValid(values: FormValues) {
    try {
      await save.mutateAsync(schema.parse(values)); // parse() applies trim() etc.
    } catch (error) {
      setFormError(form, getErrorMessage(error));
    }
  }

  return (
    <>
      {errors.root?.server ? (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>{errors.root.server.message}</Alert.Description>
          </Alert.Content>
        </Alert>
      ) : null}

      <FormTextField control={control} name="title" label="Title" returnKeyType="next" />
      <FormTextField
        control={control}
        name="email"
        label="Email"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Button onPress={() => void handleSubmit(onValid)()} isDisabled={isSubmitting}>
        <Button.Label>Save</Button.Label>
      </Button>
    </>
  );
}
```

Notes:

- `handleSubmit` expects a web event, so wrap it: `() => void handleSubmit(onValid)()`.
- Error messages are translated: schemas are built from a `t` function (`createSchema(t)`), and the texts live under `validation` in `src/lib/i18n`. See [i18n.md](i18n.md).
- Shared rules in `lib/schemas`: `emailField(t)`, `newPasswordField(t)`, `requiredText(message)` and `MIN_PASSWORD_LENGTH`. Add new reusable rules there.
- Cross-field rules (such as "passwords match") use `.refine()` with a `path`; `change-password.tsx` shows it.
- `setFormError(form, message)` shows a non-field error (a failed request). Read it from `errors.root?.server?.message`.
- Set a field error from the server with `form.setError("email", { message })`.
- `FormTextField` accepts every `Input` prop (`placeholder`, `secureTextEntry`, `autoComplete`, `onSubmitEditing`...) plus `inputRef` to focus the next field, and `isRequired` (default `true`).
- Wrap a long form in `KeyboardAvoidingView behavior="padding"` with a `ScrollView` using `keyboardShouldPersistTaps="handled"`, as `sign-in.tsx` does.
- `sign-in.tsx`, `change-password.tsx` and `delete-account.tsx` are the working examples. `FormTextField` still accepts a `rules` prop, but it is ignored when a Zod resolver is used.

## Toasts: `useNotify`

For short outcomes the user does not need to act on.

```tsx
const notify = useNotify();

notify.success("Note saved");
notify.error("Couldn't save", "Check your connection and try again.");
notify.info("Syncing...");
notify.warning("Storage almost full");
```

Signature: `(label: string, description?: string) => void`. It wraps HeroUI's `Toast`, which the root provider already mounts. For a toast with an action button, call `useToast()` from `heroui-native` directly.

## Confirmations: `useConfirm`

For decisions. It returns a promise that resolves `true` on confirm and `false` on cancel or dismiss.

```tsx
const confirm = useConfirm();

async function onDelete() {
  const ok = await confirm({
    title: "Delete note?",
    message: "This can't be undone.",
    confirmLabel: "Delete",
    destructive: true, // red confirm button
  });
  if (!ok) return;
  await remove.mutateAsync(id);
  notify.success("Note deleted");
}
```

Options: `title`, `message`, `confirmLabel` (default "Confirm"), `cancelLabel` (default "Cancel"), `destructive`. Only one dialog is shown at a time; asking again cancels the earlier one. `delete-account.tsx` is a working example. The dialog is a HeroUI `Dialog`, so it looks the same on iOS and Android, unlike the native `Alert.alert`.

Rule of thumb: toast for "it worked / it failed", dialog for "are you sure".

## Empty, error and offline states

`EmptyState`: centered icon, title, optional description and action. Use it for empty lists, failed loads and placeholder screens.

```tsx
<EmptyState
  icon="document-text-outline" // any Ionicons name
  title="No notes yet"
  description="Notes you create will show up here."
  actionLabel="New note"
  onAction={() => router.push("/new")}
/>
```

`ErrorScreen` (`title`, `message`, `actionLabel`, `onAction`): a full-screen error built only from React Native primitives, so it still renders if the error happened above the HeroUI provider. The root `ErrorBoundary` and the not-found screen use it. For a failed load inside a normal screen, prefer `EmptyState` with a retry.

`OfflineBanner`: a small pill shown while the device is offline. It is mounted once in the root layout; there is nothing to add per screen. React Query pauses requests while offline and resumes them on reconnect.

## Loading states

Use HeroUI's `Skeleton` for content placeholders (`<Skeleton className="h-5 w-1/3 rounded-md" />`) and `Spinner` for short waits, such as a button while submitting or a list footer. Give a spinner an `accessibilityLabel` when it stands alone.
