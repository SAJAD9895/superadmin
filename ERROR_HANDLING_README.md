# Global Error Handling Setup

A global error handling system has been implemented to catch API errors (like "Payload too large") and display them in a user-friendly modal.

## How It Works

### 1. Supabase Interceptor (`src/lib/supabaseClient.js`)
We've added a custom `fetch` wrapper to the Supabase client. This acts as an **interceptor** for all Supabase API requests.

- It checks every response status code.
- If it detects a **413 (Payload Too Large)** error:
  - It dispatches a global `global-api-error` event.
  - This allows the error to be handled centrally without `try/catch` in every component.

### 2. Error Context (`src/contexts/ErrorContext.jsx`)
- Listens for the `global-api-error` event.
- Manages the state of the error modal.
- Provides a `useError` hook for components to manually trigger errors if needed.

### 3. Global Modal (`src/components/GlobalErrorModal.jsx`)
- A reusable modal component that displays the error title, message, and optional technical details.
- Styled with the Souq Route branding (Red/Black/White).

### 4. Component Integration (`src/components/Profile.jsx`)
- The `Profile` component has been updated to **ignore** local alerts for 413 errors, letting the global modal handle them instead.

## How to Use

### Handling New Global Errors
To handle other errors globally (e.g., 500 Server Error), simply update the `customFetch` function in `src/lib/supabaseClient.js`:

```javascript
if (response.status === 500) {
  window.dispatchEvent(new CustomEvent('global-api-error', {
    detail: {
      title: 'Server Error',
      message: 'Something went wrong on our end. Please try again later.'
    }
  }));
}
```

### Manually Showing Errors
You can also show the error modal manually from any component:

```javascript
import { useError } from '../contexts/ErrorContext';

const MyComponent = () => {
  const { showError } = useError();

  const handleSomething = () => {
    try {
      // ...
    } catch (err) {
      showError('Something went wrong', 'Operation Failed');
    }
  };
};
```
