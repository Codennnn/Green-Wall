'use client'

import { useTranslations } from 'next-intl'
import { AtSignIcon, BuildingIcon, CalendarIcon, DotIcon, GitForkIcon, UsersIcon } from 'lucide-react'

import { StaticCard } from '~/components/StaticCard'
import { TextLink } from '~/components/TextLink'
import { UserAvatar } from '~/components/UserAvatar'
import { getRelativeTime } from '~/helpers'
import type { RepoOwnerInfo } from '~/types'

interface OwnerInfoSectionProps {
  owner: RepoOwnerInfo
}

export default function OwnerInfoSection({ owner }: OwnerInfoSectionProps) {
  const t = useTranslations('repo.analysis.owner')
  const tRoot = useTranslations()
  const locale = t('title').includes('Owner') ? 'en' : 'zh'

  const joinedTime = getRelativeTime(owner.createdAt, tRoot)
  const isOrganization = owner.type === 'Organization'

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">{t('title')}</h2>

      <StaticCard>
        <div className="p-grid-item">
          <div className="flex w-full items-center">
            {/* 头像区域 - 参考 GraphHeader 的紧凑布局 */}
            <TextLink
              className="mr-4 flex shrink-0 items-center"
              href={owner.url}
              target="_blank"
            >
              <UserAvatar
                avatarUrl={owner.avatarUrl}
                className="size-20"
                login={owner.login}
                name={owner.name}
              />
            </TextLink>

            {/* 信息区域 - 参考 GraphHeader 的紧凑垂直排列 */}
            <div className="flex flex-1 flex-col gap-1">
              {/* 名称和用户名 */}
              <div>
                <h3 className="text-xl font-semibold" translate="no">
                  <TextLink
                    href={owner.url}
                    target="_blank"
                  >
                    {owner.name ?? owner.login}
                  </TextLink>
                </h3>
              </div>

              {/* 用户名、统计数据 - 参考 GraphHeader 的横向排列 */}
              <div className="flex flex-wrap items-center gap-y-1 text-sm">
                {/* 用户名 */}
                {owner.name && (
                  <>
                    <span className="flex items-center" translate="no">
                      <AtSignIcon className="mr-px size-[13px]" />
                      @
                      {owner.login}
                    </span>
                    <DotIcon className="size-5" />
                  </>
                )}

                {/* 关注者/成员 */}
                <span className="flex items-center gap-1 whitespace-nowrap">
                  <UsersIcon className="size-4" />
                  <span>{owner.followers.toLocaleString()}</span>
                  <span className="opacity-70">{isOrganization ? t('members') : t('followers')}</span>
                </span>

                {/* 正在关注（仅用户） */}
                {!isOrganization && owner.following > 0 && (
                  <>
                    <DotIcon className="size-5" />
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <span>{owner.following.toLocaleString()}</span>
                      <span className="opacity-70">{t('following')}</span>
                    </span>
                  </>
                )}

                {/* 仓库数量 */}
                <DotIcon className="size-5" />
                <span className="flex items-center gap-1 whitespace-nowrap">
                  <GitForkIcon className="size-4" />
                  <span>{owner.repositories.toLocaleString()}</span>
                  <span className="opacity-70">{t('repositories')}</span>
                </span>

                {/* 加入时间 */}
                <DotIcon className="size-5" />
                <span className="flex items-center gap-1 whitespace-nowrap">
                  {isOrganization
                    ? (
                        <BuildingIcon className="size-4" />
                      )
                    : (
                        <CalendarIcon className="size-4" />
                      )}
                  <span>{joinedTime}</span>
                  <span className="opacity-70">{t('joined')}</span>
                </span>
              </div>

              {/* 简介 - 参考 GraphHeader 的最大宽度限制 */}
              {owner.bio && (
                <div className="line-clamp-3 max-w-[400px] text-sm opacity-70">
                  {owner.bio}
                </div>
              )}
            </div>
          </div>
        </div>
      </StaticCard>
    </section>
  )
}
