'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'

import { ThemeMode } from '~/enums'

export function ThemeProvider(props: React.PropsWithChildren) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={ThemeMode.System}
      disableTransitionOnChange={true}
      enableColorScheme={true}
      enableSystem={true}
      storageKey="color-mode"
    >
      {props.children}
    </NextThemesProvider>
  )
}
