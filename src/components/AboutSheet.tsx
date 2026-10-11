import { BONUS } from '../lib/config'
import type { Meta } from '../lib/types'
import { withUtm } from '../lib/utm'
import { track } from '../state'

const STEPS = [
  ['Свайпайте', 'Нравится — вправо, в вишлист. Не нравится — влево, дальше.'],
  ['Уточняйте', 'Фильтры по городу, интересам, цене, возрасту и поводу помогут найти своё.'],
  ['Делитесь', 'Отправьте вишлист или отдельное впечатление друзьям и гостям на день рождения.'],
] as const

export function AboutSheet({ meta, count, onClose }: { meta: Meta | null; count: number; onClose: () => void }) {
  return (
    <div className="sheet-back" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label="О приложении" onClick={(e) => e.stopPropagation()}>
        <button className="sheet-close" aria-label="Закрыть" onClick={onClose}>✕</button>
        <div className="sheet-body about">
          <img src="brand/logo_main_dark.svg" alt="Surprise" height="28" className="about-logo" />
          <h2>Wish-list от Surprise.by</h2>
          <p>
            Выбирать впечатления так же легко, как листать ленту. Собирайте то, что хочется попробовать,
            и делитесь списком с близкими — пусть знают, что вам подарить.
          </p>

          <ol className="steps-list">
            {STEPS.map(([t, d], i) => (
              <li key={t}><b>{i + 1}</b><span><strong>{t}</strong>{d}</span></li>
            ))}
          </ol>

          <div className="bonus">
            <img src="brand/mark_gift_dark.svg" alt="" width="36" height="36" />
            <div><strong>{BONUS.title}</strong><span>{BONUS.text}</span></div>
          </div>

          <h3>Ваши данные</h3>
          <p className="muted">
            Регистрация не нужна. Вишлист и профиль хранятся только на вашем устройстве; чем вы делитесь —
            решаете вы. Профиль можно удалить в любой момент во вкладке «Профиль».
          </p>

          <a
            className="btn btn-ink full"
            href={withUtm('https://surprise.by/', 'about')}
            target="_blank"
            rel="noopener"
            onClick={() => track('outbound_click', { campaign: 'about' })}
          >
            Перейти на surprise.by
          </a>
          <p className="muted small about-foot">
            {count} впечатлений в каталоге{meta ? ` · обновлён ${new Date(meta.syncedAt).toLocaleDateString('ru-RU')}` : ''}
          </p>
        </div>
      </div>
    </div>
  )
}
