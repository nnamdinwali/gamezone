import type { Appearance } from '@clerk/types';

/** High-contrast dark form so fields are actually visible on mobile */
export const clerkAppearance: Appearance = {
  layout: {
    socialButtonsPlacement: 'top',
    socialButtonsVariant: 'blockButton',
    showOptionalFields: false,
  },
  variables: {
    colorPrimary: '#22c55e',
    colorText: '#fafafa',
    colorTextSecondary: '#a1a1aa',
    colorTextOnPrimaryBackground: '#052e16',
    colorBackground: 'transparent',
    colorInputBackground: '#18181b',
    colorInputText: '#fafafa',
    colorNeutral: '#a1a1aa',
    colorDanger: '#f87171',
    borderRadius: '10px',
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif',
    fontSize: '15px',
    spacingUnit: '0.9rem',
  },
  elements: {
    rootBox: 'w-full',
    cardBox: 'w-full shadow-none !bg-transparent',
    card: '!bg-transparent shadow-none border-0 p-0 gap-4',
    // Hide Clerk's own title (we show ours above)
    header: 'hidden',
    headerTitle: 'hidden',
    headerSubtitle: 'hidden',
    footer: 'hidden',
    footerAction: 'hidden',
    main: 'gap-4',
    form: 'gap-3',
    formFieldRow: 'gap-1.5',
    formFieldLabel: '!text-zinc-300 text-[13px] font-medium',
    formFieldInput:
      '!h-12 !rounded-[10px] !border !border-zinc-600 !bg-zinc-900 !text-white text-[15px] placeholder:!text-zinc-500 focus:!border-emerald-500 focus:ring-0 shadow-none',
    formButtonPrimary:
      '!h-12 !rounded-[10px] !bg-emerald-500 !text-emerald-950 text-[15px] font-semibold hover:!bg-emerald-400 shadow-none',
    formButtonPrimaryIcon: 'hidden',
    socialButtonsBlockButton:
      '!h-12 !rounded-[10px] !border !border-zinc-600 !bg-zinc-900 !text-white hover:!bg-zinc-800',
    socialButtonsBlockButtonText: '!text-white text-[15px] font-medium',
    socialButtonsProviderIcon: 'w-5 h-5',
    dividerRow: 'my-1',
    dividerLine: '!bg-zinc-700',
    dividerText: '!text-zinc-400 text-xs uppercase tracking-wider',
    formFieldInputShowPasswordButton: '!text-zinc-400 hover:!text-zinc-200',
    identityPreviewEditButton: '!text-emerald-400',
    formFieldErrorText: '!text-red-400 text-[12px]',
    alert: 'rounded-[10px] border border-zinc-700 bg-zinc-900',
    alertText: 'text-[13px] text-zinc-200',
    otpCodeFieldInput: '!border-zinc-600 !bg-zinc-900 !text-white',
  },
};
