/**
 * English strings, and the source of truth for the translation keys. Other languages must have
 * exactly the same shape (`Translation`), so a missing key fails typecheck.
 *
 * Use `{{name}}` for values. Keep strings short and free of formatting; do not build sentences
 * from several keys, because word order differs between languages.
 */
export const en = {
  common: {
    back: "Back",
    cancel: "Cancel",
    confirm: "Confirm",
    delete: "Delete",
    skip: "Skip",
    next: "Next",
    getStarted: "Get started",
    tryAgain: "Try again",
    pleaseWait: "Please wait",
  },
  tabs: {
    home: "Home",
    activity: "Activity",
    settings: "Settings",
    newEntry: "New entry",
    newEntrySoon: "The composer is coming soon.",
  },
  home: {
    greeting: "Hi, {{name}}",
    title: "Home",
    subtitle: "Welcome to {{app}}.",
    emptyTitle: "Nothing here yet",
    emptyDescription: "Replace this screen with your app.",
  },
  activity: {
    title: "Activity",
    emptyTitle: "No activity yet",
    emptyDescription: "What you do will show up here.",
  },
  settings: {
    title: "Settings",
    appearance: "Appearance",
    selectTheme: "Select theme",
    accentColor: "Accent color",
    language: "Language",
  },
  theme: {
    title: "Theme",
    subtitle: "Choose your preferred theme",
    system: "System",
    light: "Light",
    dark: "Dark",
  },
  accent: {
    title: "Accent color",
    subtitle: "Used for buttons, links and highlights",
    blue: "Blue",
    indigo: "Indigo",
    violet: "Violet",
    pink: "Pink",
    teal: "Teal",
  },
  language: {
    title: "Language",
    subtitle: "Choose the app language",
    system: "System default",
  },
  account: {
    title: "Account",
    subtitle: "Manage your account settings",
    changePassword: "Change password",
    signOut: "Sign out",
    signingOut: "Signing out",
    signOutFailed: "Couldn't sign out",
    deleteAccount: "Delete account",
  },
  auth: {
    signInSubtitle: "Sign in to sync your notes across devices.",
    signUpSubtitle: "Create an account to sync your notes across devices.",
    name: "Name",
    namePlaceholder: "Your name",
    email: "Email",
    emailPlaceholder: "you@example.com",
    password: "Password",
    passwordPlaceholder: "Your password",
    newPasswordPlaceholder: "At least {{count}} characters",
    signIn: "Sign in",
    createAccount: "Create account",
    haveAccount: "Have an account? Sign in",
    newHere: "New here? Create an account",
    signInFailed: "Couldn't sign in",
    signUpFailed: "Couldn't create account",
    emailTaken: "An account with this email already exists.",
  },
  changePassword: {
    title: "Change password",
    subtitle: "Other devices will be signed out.",
    current: "Current password",
    new: "New password",
    confirm: "Confirm new password",
    submit: "Update password",
    failedTitle: "Couldn't change password",
    failed: "Couldn't change your password. Please try again.",
    successTitle: "Password updated",
    successMessage: "Other devices were signed out.",
  },
  deleteAccount: {
    title: "Delete account",
    subtitle: "This cannot be undone.",
    description:
      "Your account and everything synced to it will be permanently deleted. Data that only exists on this device is not affected. Enter your password to confirm.",
    submit: "Delete my account",
    failedTitle: "Couldn't delete account",
    failed: "Couldn't delete your account. Please try again.",
    confirmTitle: "Delete your account?",
    confirmMessage:
      "This permanently deletes your account and all of your data. It cannot be undone.",
  },
  onboarding: {
    page: "Page {{current}} of {{total}}",
    welcomeTitle: "Welcome to {{name}}",
    welcomeDescription: "A calm place to keep track of what you get done.",
    syncTitle: "Your data, everywhere",
    syncDescription: "Sign in once and your notes follow you across devices.",
    privateTitle: "Private by default",
    privateDescription: "Only you can see your data. You can export or delete it at any time.",
  },
  validation: {
    nameRequired: "Enter your name.",
    emailRequired: "Enter your email.",
    emailInvalid: "Enter a valid email address.",
    passwordRequired: "Enter your password.",
    passwordMin: "Use at least {{count}} characters.",
    currentPasswordRequired: "Enter your current password.",
    newPasswordRequired: "Enter a new password.",
    confirmPasswordRequired: "Confirm your new password.",
    passwordsMismatch: "Passwords don't match.",
    passwordToConfirm: "Enter your password to confirm.",
  },
  errors: {
    generic: "Something went wrong. Please try again.",
    network: "Couldn't reach the server. Check your connection and try again.",
    timeout: "The request took too long. Please try again.",
    invalidResponse: "The server sent an unexpected response.",
    sessionExpired: "Your session has expired. Please sign in again.",
    forbidden: "You don't have permission to do that.",
    notFound: "We couldn't find what you were looking for.",
    tooManyRequests: "Too many requests. Please wait a moment and try again.",
    server: "The server ran into a problem. Please try again.",
    signOut: "Couldn't sign out. Please try again.",
    boundaryTitle: "Something went wrong",
    boundaryMessage: "An unexpected error occurred.",
    pageNotFoundTitle: "Page not found",
    pageNotFoundMessage: "This screen doesn't exist or the link is out of date.",
    goHome: "Go home",
  },
  offline: {
    banner: "You're offline",
  },
} as const;

type Widen<T> = { [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };

/** The shape every language file must match. */
export type Translation = Widen<typeof en>;
