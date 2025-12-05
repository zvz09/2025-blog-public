'use client'

import { useState } from 'react'

// 假设这些类型和组件文件存在
import { type LogoItem } from './components/logo-upload-dialog'
import { ShareCard, type Share } from './components/share-card'

interface GridViewProps {
	shares: Share[]
	isEditMode?: boolean
	onUpdate?: (share: Share, oldShare: Share, logoItem?: LogoItem) => void
	onDelete?: (share: Share) => void
}

// 搜索引擎类型定义
type SearchEngine = 'bing' | 'baidu' | 'google' | 'local'

// 搜索引擎配置
const SEARCH_ENGINES = [
	{ id: 'local', name: '本地' },
	{ id: 'bing', name: '必应' },
	{ id: 'baidu', name: '百度' },
	{ id: 'google', name: '谷歌' }
]

export default function GridView({ shares, isEditMode = false, onUpdate, onDelete }: GridViewProps) {
	const [searchTerm, setSearchTerm] = useState('')

	const [searchEngine, setSearchEngine] = useState<SearchEngine>('local')
	const [showDropdown, setShowDropdown] = useState(false)

	const allTags = Array.from(new Set(shares.flatMap(share => share.tags)))
	const [selectedTag, setSelectedTag] = useState<string>(allTags[0] ? allTags[0] : '')
	// 处理联网搜索
	const handleWebSearch = (term: string) => {
		if (!term.trim()) return

		let url = ''
		switch (searchEngine) {
			case 'bing':
				url = `https://www.bing.com/search?q=${encodeURIComponent(term)}`
				break
			case 'baidu':
				url = `https://www.baidu.com/s?wd=${encodeURIComponent(term)}`
				break
			case 'google':
				url = `https://www.google.com/search?q=${encodeURIComponent(term)}`
				break
			default:
				return
		}

		window.open(url, '_blank')
	}

	const filteredShares = shares.filter(share => {
		// 如果是联网搜索模式，则显示所有分享项
		// **注意：** 这里的逻辑似乎是为了在非本地搜索时，Tag筛选仍应生效，但搜索词不影响结果列表。
		// 原代码：if (searchEngine !== 'local') return selectedTag === 'all' || share.tags.includes(selectedTag)
		// 保持原代码逻辑。
		if (searchEngine !== 'local') return selectedTag === 'all' || share.tags.includes(selectedTag)

		// 本地搜索逻辑
		const name = share.name || '';
		const description = share.description || '';
		const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || description.toLowerCase().includes(searchTerm.toLowerCase())
		const matchesTag = selectedTag === 'all' || share.tags.includes(selectedTag)
		return matchesSearch && matchesTag
	})

	// 处理搜索提交
	const handleSearchSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (searchEngine !== 'local') {
			handleWebSearch(searchTerm)
		}
	}

	// 切换搜索引擎
	const handleEngineChange = (engine: SearchEngine) => {
		setSearchEngine(engine)
		setShowDropdown(false)
	}

	return (
		<div className='mx-auto w-full max-w-7xl px-6 pt-24 pb-12'>
			<div className='mb-8 space-y-4'>
				{/* 搜索表单 (科技美观风格) - 保持不变 */}
				<form onSubmit={handleSearchSubmit} className='flex flex-col items-center gap-4 sm:flex-row sm:justify-center'>
					<div className='relative flex max-w-xl w-full'>
						{/* 搜索引擎切换按钮 */}
						<button
							type='button'
							className='flex items-center pl-4 pr-3 py-3 text-base bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-l-2xl text-white font-medium focus:ring-2 focus:ring-brand focus:border-brand focus:outline-none transition-all duration-300 hover:bg-gray-700/90 shadow-lg shadow-gray-900/50 z-20'
							onClick={() => setShowDropdown(!showDropdown)}
						>
							<span className='text-brand font-semibold'>{SEARCH_ENGINES.find(se => se.id === searchEngine)?.name}</span>
							<svg className={`w-4 h-4 ml-2 text-brand transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
							</svg>
						</button>

						{/* 下拉菜单 */}
						{showDropdown && (
							<div
								className='absolute left-0 top-full mt-2 w-28 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 z-30 overflow-hidden backdrop-blur-sm'
								style={{ boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 15px rgba(124, 58, 237, 0.4)' }}
							>
								{SEARCH_ENGINES.map(engine => (
									<button
										key={engine.id}
										type='button'
										className={`block w-full text-left px-4 py-3 text-sm transition-colors duration-200 ${
											searchEngine === engine.id
												? 'bg-brand/20 text-brand font-semibold'
												: 'text-gray-300 hover:bg-gray-700/70 hover:text-white'
										}`}
										onClick={() => handleEngineChange(engine.id as SearchEngine)}
									>
										{engine.name}
									</button>
								))}
							</div>
						)}

						{/* 搜索输入框 */}
						<div className='relative flex-grow'>
							<div className='absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none'>
								<svg className='w-5 h-5 text-gray-500' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
								</svg>
							</div>
							<input
								type='text'
								placeholder={searchEngine === 'local' ? '搜索资源...' : `在${SEARCH_ENGINES.find(se => se.id === searchEngine)?.name}中搜索...`}
								value={searchTerm}
								onChange={e => setSearchTerm(e.target.value)}
								className='block w-full pl-12 pr-28 py-3 text-base bg-gray-800/80 backdrop-blur-sm border border-gray-700 border-l-0 rounded-r-2xl text-white placeholder-gray-500 focus:ring-2 focus:ring-brand focus:border-brand focus:outline-none transition-all duration-300 shadow-lg shadow-gray-900/50'
							/>

							{/* 搜索按钮 */}
							<button
								type='submit'
								className='absolute right-2 top-1/2 -translate-y-1/2 h-10 bg-gradient-to-r from-brand to-purple-600 hover:from-brand/90 hover:to-purple-700 text-white font-medium rounded-xl px-5 transition-all duration-300 flex items-center shadow-lg shadow-purple-600/40 hover:scale-[1.02]'
								style={{ minWidth: '70px' }}
							>
								搜索
							</button>
						</div>
					</div>

					{/* 点击外部关闭下拉菜单 */}
					{showDropdown && (
						<div
							className='fixed inset-0 z-10'
							onClick={() => setShowDropdown(false)}
						/>
					)}
				</form>

				{/* Tag 筛选按钮 (保持科技感渐变风格) - 保持不变 */}
				<div className='flex flex-wrap justify-center gap-2 pt-2'>
					{allTags.map(tag => (
						<button
							key={tag}
							onClick={() => setSelectedTag(tag)}
							className={`px-5 py-2.5 text-sm font-medium rounded-full transition-all duration-200 transform hover:scale-105 ${
								selectedTag === tag
									? 'bg-gradient-to-r from-brand to-purple-600 text-white shadow-lg shadow-purple-600/40'
									: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm'
							}`}>
							{tag}
						</button>
					))}
				</div>
			</div>

			{/* 🚀 卡片展示区优化 - 保持调用不变，卡片内部样式需要在 ShareCard 中修改 */}
			<div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 pt-6'>
				{filteredShares.map(share => (
					<ShareCard
						key={share.url}
						share={share}
						isEditMode={isEditMode}
						onUpdate={onUpdate}
						onDelete={() => onDelete?.(share)}
					/>
				))}
			</div>

			{/* 结果提示区域 (深色背景下的文本颜色调整：从 text-gray-400 调整为 text-gray-300) */}
			{(searchEngine === 'local' && filteredShares.length === 0) && (
				<div className='mt-12 text-center text-gray-300'>
					<p>本地没有找到相关资源</p>
				</div>
			)}

			{/* 联网搜索结果为空时，只在本地资源列表为空时显示，因为联网搜索后用户会跳转 */}
			{/* 联网搜索模式下，如果 shares 数组（即本地资源列表）为空，这个提示是合理的，但考虑到 filteredShares 的处理，可能更希望提示用户进行联网搜索。
        根据原代码逻辑，此处的 filteredShares.length === 0 的判断更为合理。*/}
			{(searchEngine !== 'local' && filteredShares.length === 0) && (
				<div className='mt-12 text-center text-gray-300'>
					<p>本地资源中没有找到与 Tag 匹配的项目</p>
				</div>
			)}

			{/* 增加一个全局无资源提示 */}
			{shares.length === 0 && (
				<div className='mt-12 text-center text-gray-300'>
					<p>当前没有任何资源，请尝试添加。</p>
				</div>
			)}
		</div>
	)
}