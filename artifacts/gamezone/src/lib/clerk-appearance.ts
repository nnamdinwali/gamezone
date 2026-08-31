import type { Appearance } from '@clerk/types';

/** Rock City theme — keep form chrome visible so sign-up never goes blank */
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
    colorBackground: '#0c1512',
    colorInputBackground: '#0a1210',
    colorInputText: '#e8f0ea',
    colorNeutral: '#6b7f72',
    colorDanger: '#f07178',
    borderRadius: '12px',
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
    fontSize: '14px',
  },
  elements: {
    rootBox: 'w-full',
    card: 'bg-transparent shadow-none border-0 p-0 w-full',
    headerTitle: 'hidden',
    headerSubtitle: 'hidden',
    footer: 'hidden',
    footerAction: 'hidden',
    formFieldLabel: 'text-[13px] text-[#8a9e90] font-medium',
    formFieldInput:
      'h-11 rounded-xl border border-white/10 bg-[#0a1210] text-[#e8f0ea] placeholder:text-[#5c6f63]',
    formButtonPrimary:
      'h-11 rounded-xl bg-[#38e87b] text-[#04140c] text-[14px] font-semibold hover:bg-[#4aed88]',
    socialButtonsBlockButton:
      'h-11 rounded-xl border border-white/10 bg-transparent text-[#e8f0ea] hover:bg-white/5',
    socialButtonsBlockButtonText: 'font-medium text-[14px]',
    dividerLine: 'bg-white/10',
    dividerText: 'text-[#6b7f72] text-xs',
    formFieldInputShowPasswordButton: 'text-[#6b7f72]',
    identityPreviewEditButton: 'text-[#38e87b]',
    formFieldErrorText: 'text-[#f07178] text-[12px]',
  },
};
