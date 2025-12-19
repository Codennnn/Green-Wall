import { useTranslations } from 'next-intl'

import { ErrorType } from '~/enums'

import { TextLink } from './TextLink'

export function ErrorMessage(props: { errorType?: ErrorType, text?: string }) {
  const { errorType, text } = props
  const t = useTranslations('errors')

  return (
    <div className="flex flex-col items-center justify-center text-muted-foreground/80">
      <div className="select-none py-9 text-6xl opacity-90">
        <span>¯\_(ツ)_/¯</span>
      </div>

      <div className="max-w-[min(40%,90vw)] text-center">
        {errorType === ErrorType.BadCredentials
          ? (
              <div className="text-center">
                {t.rich('badCredentials', {
                  link: (chunks) => (
                    <TextLink
                      passHref
                      className="font-bold"
                      href="https://github.com/Codennnn/Green-Wall#running-locally"
                      target="_blank"
                    >
                      {chunks}
                    </TextLink>
                  ),
                })}
              </div>
            )
          : (
              (text ?? t('somethingWentWrong'))
            )}
      </div>
    </div>
  )
}
