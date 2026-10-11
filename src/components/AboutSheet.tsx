import { BONUS } from '../lib/config'
import type { Meta } from '../lib/types'
import { withUtm } from '../lib/utm'
import { track } from '../state'

const STEPS = [
  ['Выбирайте', 'Листайте впечатления: вправо — в вишлист, влево — дальше. Ищите по названию, фильтруйте по поводу, городу и цене.'],
  ['Делитесь', 'Отправьте весь вишлист или одно впечатление в мессенджер, Instagram или просто ссылкой. Получателю регистрация не нужна.'],
  ['Пробуйте', 'Друзья переходят на surprise.by и заказывают подарок по вашему списку — вы получаете впечатление, а не очередной сувенир.'],
] as const

const FAQ = [
  ['Нужна ли регистрация?', 'Нет. Приложение работает сразу. Анкету можно заполнить в любой момент во вкладке «Профиль» — мы поздравим вас с днём рождения и подберём впечатления под ваши интересы.'],
  ['Кому виден мой вишлист?', 'Только тем, кому вы отправили ссылку. Список целиком зашит в саму ссылку, поэтому открыть его может любой, у кого она есть, — и ему не нужно входить в аккаунт.'],
  ['Как поделиться?', 'Во вкладке «Вишлист» нажмите «Поделиться вишлистом». Одно впечатление можно отправить из его карточки. Подойдут Telegram, WhatsApp, Viber, Instagram или копирование ссылки.'],
  ['Как получить бонус?', 'Переходите на surprise.by по кнопке из приложения и оформляйте заказ: метка в ссылке покажет, что вы пришли из Wish-list.'],
  ['Куда деваются пропущенные карточки?', 'Они возвращаются в конец ленты. Чтобы они больше не появлялись, выключите «Возвращать пропущенные» в разделе «Профиль → Настройки».'],
  ['Как удалить мои данные?', 'Вкладка «Профиль» → «Удалить мои данные». Всё хранится на вашем устройстве, поэтому после удаления не останется ничего.'],
] as const

export function AboutSheet({ meta, count, onClose }: { meta: Meta | null; count: number; onClose: () => void }) {
  return (
    <div className="sheet-back" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label="О приложении" onClick={(e) => e.stopPropagation()}>
        <button className="sheet-close" aria-label="Закрыть" onClick={onClose}>✕</button>
        <div className="sheet-body about">
          <img src="brand/logo_main_dark.svg" alt="Surprise" height="28" className="about-logo" />
          <h2>Wish-list от Surprise.by</h2>
          <p className="about-tag">Выбирай. Делись. Пробуй.</p>
          <p>
            Список желаемых впечатлений: собирайте то, что давно хотели попробовать, и отправляйте его близким —
            пусть знают, что вам подарить.
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

          <h3>Частые вопросы</h3>
          <div className="faq">
            {FAQ.map(([q, a]) => (
              <details key={q}><summary>{q}</summary><p>{a}</p></details>
            ))}
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
