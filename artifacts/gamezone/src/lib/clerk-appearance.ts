import type { Appearance } from '@clerk/types';

export const clerkAppearance: Appearance = {
  layout: {
    socialButtonsPlacement: 'top',
    socialButtonsVariant: 'blockButton',
    showOptionalFields: false,
  },
  variables: {
    colorPrimary: '#22c55e',
    colorText: '#f4f4f5',
    colorTextSecondary: '#a1a1aa',
    colorTextOnPrimaryBackground: '#052e16',
    colorBackground: '#09090b',
    colorInputBackground: '#18181b',
    colorInputText: '#fafafa',
    colorNeutral: '#71717a',
    colorDanger: '#f87171',
    borderRadius: '10px',
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif',
    fontSize: '15px',
    spacingUnit: '0.9rem',
  },
  elements: {
    rootBox: 'w-full',
    cardBox: 'w-full shadow-none',
    card: 'bg-transparent shadow-none border-0 p-0 gap-4',
    header: 'hidden',
    footer: 'hidden',
    footerAction: 'hidden',
    footerPages: 'hidden',
    footerPagesLink: 'hidden',
    badge: 'hidden !important',
    main: 'gap-4',
    form: 'gap-3',
    formFieldRow: 'gap-1.5',
    formFieldLabel: 'text-[13px] font-medium text-zinc-400',
    formFieldInput:
      'h-12 rounded-[10px] border border-zinc-800 !bg-zinc-900 !text-zinc-50 text-[15px] placeholder:text-zinc-600 focus:border-zinc-600 focus:ring-0 shadow-none',
    formButtonPrimary:
      'h-12 rounded-[10px] bg-emerald-500 text-emerald-950 text-[15px] font-semibold hover:bg-emerald-400 shadow-none',
    // Remove arrow / play icon on Continue
    formButtonPrimaryIcon: 'hidden',
    buttonArrowIcon: 'hidden',
    socialButtonsBlockButton:
      'h-12 rounded-[10px] border border-zinc-800 bg-zinc-900 text-zinc-100 hover:bg-zinc-800 hover:border-zinc-700',
    socialButtonsBlockButtonText: 'text-[15px] font-medium text-zinc-100',
    socialButtonsProviderIcon: 'w-5 h-5',
    dividerRow: 'my-1',
    dividerLine: 'bg-zinc-800',
    dividerText: 'text-zinc-600 text-xs uppercase tracking-wider',
    formFieldInputShowPasswordButton: 'text-zinc-500 hover:text-zinc-300',
    identityPreviewEditButton: 'text-emerald-400',
    formFieldErrorText: 'text-red-400 text-[12px]',
    alert: 'rounded-[10px] border border-zinc-800 bg-zinc-900',
    alertText: 'text-[13px] text-zinc-300',
    otpCodeFieldInput: 'border-zinc-800 bg-zinc-900 text-zinc-50',
  },
};
