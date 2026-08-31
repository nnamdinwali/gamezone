import type { Appearance } from '@clerk/types';

/** Restrained Rock City theme — product UI, not a generic widget */
export const clerkAppearance: Appearance = {
  layout: {
    socialButtonsPlacement: 'bottom',
    socialButtonsVariant: 'blockButton',
    showOptionalFields: false,
  },
  variables: {
    colorPrimary: '#38e87b',
    colorText: '#e8f0ea',
    colorTextSecondary: '#8a9e90',
    colorTextOnPrimaryBackground: '#04140c',
    colorBackground: 'transparent',
    colorInputBackground: '#0c1512',
    colorInputText: '#e8f0ea',
    colorNeutral: '#6b7f72',
    colorDanger: '#f07178',
    borderRadius: '12px',
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
    fontSize: '14px',
  },
  elements: {
    rootBox: 'w-full',
    card: 'bg-transparent shadow-none border-0 p-0',
    header: 'hidden',
    footer: 'hidden',
    main: 'gap-4',
    form: 'gap-3',
    formFieldLabel: 'text-[13px] text-[#8a9e90] font-medium mb-1.5',
    formFieldInput:
      'h-11 rounded-xl border border-white/[0.08] bg-[#0c1512] text-[#e8f0ea] placeholder:text-[#5c6f63] focus:border-[#38e87b]/50 focus:ring-0 transition-colors',
    formButtonPrimary:
      'h-11 rounded-xl bg-[#38e87b] text-[#04140c] text-[14px] font-semibold hover:bg-[#4aed88] active:scale-[0.99] transition-all shadow-none',
    socialButtonsBlockButton:
      'h-11 rounded-xl border border-white/[0.08] bg-transparent text-[#e8f0ea] hover:bg-white/[0.04] transition-colors',
    socialButtonsBlockButtonText: 'font-medium text-[14px]',
    dividerLine: 'bg-white/[0.06]',
    dividerText: 'text-[#6b7f72] text-xs',
    formFieldInputShowPasswordButton: 'text-[#6b7f72] hover:text-[#8a9e90]',
    identityPreviewEditButton: 'text-[#38e87b]',
    formFieldErrorText: 'text-[#f07178] text-[12px]',
    alert: 'rounded-xl border border-white/[0.06] bg-white/[0.03]',
    alertText: 'text-[13px] text-[#c5d4c9]',
  },
};
