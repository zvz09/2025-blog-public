'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import LogoUploadDialog, { type LogoItem } from './logo-upload-dialog'

export interface Share {
	name: string
	logo: string
	url: string
	description: string // 属性保留，但不在 JSX 中显示
	tags: string[]
	stars: number // 属性保留，但不在 JSX 中显示
}

interface ShareCardProps {
	share: Share
	isEditMode?: boolean
	onUpdate?: (share: Share, oldShare: Share, logoItem?: LogoItem) => void
	onDelete?: () => void
}

// ------------------------------------
// 1. 定义一组吸引人的渐变颜色类
// ------------------------------------
const GRADIENT_CLASSES = [
	'from-blue-500 to-cyan-500',     // 蓝绿
	'from-green-500 to-teal-500',    // 绿青
	'from-pink-500 to-red-500',      // 粉红
	'from-indigo-500 to-purple-600', // 蓝紫 (原有的 brand 风格)
	'from-yellow-500 to-orange-500', // 黄橙
	'from-fuchsia-500 to-pink-500',  // 亮紫粉
	'from-red-600 to-yellow-500',    // 红黄
	'from-lime-500 to-green-600',    // 青绿
]

// ------------------------------------
// 2. 辅助函数：根据字符串（如名称）生成稳定的哈希值，用于确定颜色索引
// ------------------------------------
const getColorHash = (str: string): number => {
	let hash = 0
	for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash) // 简单的哈希算法
	}
	return Math.abs(hash)
}


export function ShareCard({ share, isEditMode = false, onUpdate, onDelete }: ShareCardProps) {
	const [isEditing, setIsEditing] = useState(false)
	const [localShare, setLocalShare] = useState(share)
	const [showLogoDialog, setShowLogoDialog] = useState(false)
	const [logoItem, setLogoItem] = useState<LogoItem | null>(null)

	const handleFieldChange = (field: keyof Share, value: any) => {
		const updated = { ...localShare, [field]: value }
		setLocalShare(updated)
		onUpdate?.(updated, share, logoItem || undefined)
	}

	const handleLogoSubmit = (logo: LogoItem) => {
		setLogoItem(logo)
		const logoUrl = logo.type === 'url' ? logo.url : logo.previewUrl
		const updated = { ...localShare, logo: logoUrl }
		setLocalShare(updated)
		onUpdate?.(updated, share, logo)
	}

	const handleCancel = () => {
		setLocalShare(share)
		setIsEditing(false)
		setLogoItem(null)
	}

	const canEdit = isEditMode && isEditing

	// ------------------------------------
	// 处理卡片点击跳转
	const handleCardClick = () => {
		if (isEditMode) return // 编辑模式下不跳转

		let fullUrl = localShare.url
		if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
			fullUrl = `https://${fullUrl}`
		}
		window.open(fullUrl, '_blank')
	}
	// ------------------------------------

	// ------------------------------------
	// 获取默认 Logo 占位符文本
	const getFallbackText = (name: string): string => {
		const trimmedName = name.trim()
		if (!trimmedName) return '?'
		// 取前两个大写字母
		const initials = trimmedName
			.split(/\s+/) // 按空格分割
			.map(word => word[0])
			.join('')
			.toUpperCase()

		return initials.substring(0, 2) || trimmedName[0].toUpperCase()
	}

	const hasLogo = !!localShare.logo

	// ------------------------------------
	// 3. 确定性地选择随机渐变类
	// ------------------------------------
	const colorIndex = getColorHash(localShare.name) % GRADIENT_CLASSES.length
	const randomGradientClass = `bg-gradient-to-br ${GRADIENT_CLASSES[colorIndex]}`
	// ------------------------------------


	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.6 }}
			whileInView={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.3 }}
			className={cn(
				'card relative block overflow-hidden p-6 transition-all duration-300',
				!isEditMode && 'cursor-pointer hover:shadow-2xl hover:scale-[1.02]'
			)}
			onClick={handleCardClick}
		>
			{/* 编辑/删除/完成/取消 按钮 - 保持不变 */}
			{isEditMode && (
				<div className='absolute top-3 right-3 z-20 flex gap-2 rounded-lg bg-gray-900/50 p-1 backdrop-blur-sm'>
					{isEditing ? (
						<>
							<button onClick={(e) => { e.stopPropagation(); handleCancel(); }} className='rounded-lg px-2 py-1.5 text-xs text-gray-400 transition-colors hover:text-gray-200'>
								取消
							</button>
							<button onClick={(e) => { e.stopPropagation(); setIsEditing(false); }} className='rounded-lg px-2 py-1.5 text-xs text-brand transition-colors hover:text-purple-400'>
								完成
							</button>
						</>
					) : (
						<>
							<button onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} className='rounded-lg px-2 py-1.5 text-xs text-brand transition-colors hover:text-purple-400'>
								编辑
							</button>
							<button onClick={(e) => { e.stopPropagation(); onDelete?.(); }} className='rounded-lg px-2 py-1.5 text-xs text-red-400 transition-colors hover:text-red-300'>
								删除
							</button>
						</>
					)}
				</div>
			)}

			<div>
				<div className='mb-4 flex items-center gap-4'>
					{/* 🚀 优化后的 Logo 区域：应用随机渐变类 */}
					<div className='group relative flex-shrink-0'>

						<div
							className={cn(
								'h-16 w-16 rounded-xl ring-2 ring-brand/50 transition-shadow duration-300',
								'flex items-center justify-center text-xl font-bold text-white',
								// 替换硬编码的 bg-gradient-to-br from-brand to-purple-700
								hasLogo ? 'hidden' : randomGradientClass,
								canEdit && 'cursor-pointer'
							)}
							onClick={(e) => { e.stopPropagation(); canEdit && setShowLogoDialog(true); }} // 阻止事件冒泡
						>
							{hasLogo ? null : getFallbackText(localShare.name)}
						</div>

						{hasLogo && (
							<img
								src={localShare.logo}
								alt={localShare.name}
								className={cn('h-16 w-16 rounded-xl object-cover ring-2 ring-brand/50 transition-shadow duration-300', canEdit && 'cursor-pointer')}
								onClick={(e) => { e.stopPropagation(); canEdit && setShowLogoDialog(true); }} // 阻止事件冒泡
							/>
						)}

						{canEdit && (
							<div
								className={cn(
									'pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-black/40 opacity-0 transition-opacity group-hover:opacity-100',
									canEdit ? 'pointer-events-auto' : 'pointer-events-none'
								)}
								onClick={(e) => { e.stopPropagation(); canEdit && setShowLogoDialog(true); }} // 阻止事件冒泡
							>
								<span className='text-xs text-white'>更换</span>
							</div>
						)}
					</div>

					{/* 名称和URL区域 - 保持不变 */}
					<div className='flex-1 min-w-0'>
						<h3
							contentEditable={canEdit}
							suppressContentEditableWarning
							onBlur={e => handleFieldChange('name', e.currentTarget.textContent || '')}
							onClick={(e) => { e.stopPropagation(); }} // 阻止事件冒泡
							className={cn('group-hover:text-brand text-lg font-bold transition-colors focus:outline-none text-white truncate', canEdit && 'cursor-text border-b border-brand/50')}>
							{localShare.name}
						</h3>

						{/* URL编辑/链接显示 */}
						{canEdit ? (
							<div
								contentEditable
								suppressContentEditableWarning
								onBlur={e => handleFieldChange('url', e.currentTarget.textContent || '')}
								onClick={(e) => { e.stopPropagation(); }} // 阻止事件冒泡
								className='text-secondary mt-1 block max-w-full cursor-text truncate text-xs text-gray-400 focus:outline-none border-b border-gray-600/50'>
								{localShare.url}
							</div>
						) : (
							<div className='text-secondary mt-1 block max-w-full truncate text-xs text-gray-500'>
								{localShare.url}
							</div>
						)}
					</div>
				</div>

				{/* Tag 区域 - 保持不变 */}
				<div className='flex flex-wrap gap-2 mt-4'>
					{localShare.tags.map(tag => (
						<span key={tag} className='px-3 py-1 text-xs font-medium rounded-full bg-brand/10 text-brand border border-brand/30'>
        {tag}
       </span>
					))}
				</div>
			</div>

			{canEdit && showLogoDialog && <LogoUploadDialog currentLogo={localShare.logo} onClose={() => setShowLogoDialog(false)} onSubmit={handleLogoSubmit} />}
		</motion.div>
	)
}