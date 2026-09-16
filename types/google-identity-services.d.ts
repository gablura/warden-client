/* eslint-disable @typescript-eslint/no-explicit-any */

interface GoogleAccountsId {
  initialize(config: {
    client_id: string;
    callback: (response: { credential?: string }) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
  }): void;
  prompt(): void;
  renderButton(
    element: HTMLElement,
    config: {
      type?: string;
      theme?: string;
      size?: string;
      text?: string;
      shape?: string;
    },
  ): void;
}

interface GoogleAccounts {
  id: GoogleAccountsId;
}

interface Google {
  accounts: GoogleAccounts;
}

interface Window {
  google?: Google;
}
